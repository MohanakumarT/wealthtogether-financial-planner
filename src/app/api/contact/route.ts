import { after, NextResponse, type NextRequest } from "next/server";

import { contactMessageSchema } from "@/features/contact/schema";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { sendNotificationEmail } from "@/lib/server/notification-email";
import {
  getClientAddress,
  parseJsonRequest,
  sameOriginError,
} from "@/lib/server/request-security";
import { consumePublicRateLimit } from "@/lib/server/public-rate-limit";

export const runtime = "nodejs";

const acceptedResponse = () =>
  NextResponse.json({ received: true }, { status: 201 });

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;

  const parsed = await parseJsonRequest(request, 16_000, contactMessageSchema, {
    tooLarge: "This message is too large.",
    invalidJson: "Enter valid contact details and try again.",
    invalidData: "Check your message and try again.",
  });
  if (!parsed.ok) return parsed.response;
  if (parsed.data.website) return acceptedResponse();

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "The contact form is being configured. Please use one of the contact links on this page.",
      },
      { status: 503 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  try {
    const ipAllowed = await consumePublicRateLimit(supabase, {
      scope: "contact:ip",
      identifier: getClientAddress(request),
      maximum: 5,
      windowSeconds: 3600,
    });
    if (!ipAllowed) {
      return NextResponse.json(
        { error: "Please wait before sending another message." },
        { status: 429 },
      );
    }

    const emailAllowed = await consumePublicRateLimit(supabase, {
      scope: "contact:email",
      identifier: email,
      maximum: 1,
      windowSeconds: 600,
    });
    // Keep duplicate-email responses indistinguishable from accepted messages.
    if (!emailAllowed) return acceptedResponse();
  } catch {
    console.error("Contact request rate limiting is unavailable.");
    return NextResponse.json(
      {
        error:
          "The contact service is temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      consented_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Contact message could not be saved.", error.code);
      return NextResponse.json(
        {
          error:
            "Your message could not be saved. Please try again or contact us directly.",
        },
        { status: 503 },
      );
    }
  } catch {
    console.error("Contact message could not be saved.");
    return NextResponse.json(
      {
        error:
          "Your message could not be saved. Please try again or contact us directly.",
      },
      { status: 503 },
    );
  }

  const to =
    process.env.CONTACT_NOTIFICATION_EMAIL ??
    process.env.CONSULTATION_NOTIFICATION_EMAIL;
  if (to && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    after(() =>
      sendNotificationEmail({
        to,
        replyTo: email,
        subject: "New WealthTogether contact message",
        text: [
          `Name: ${parsed.data.name}`,
          `Email: ${email}`,
          `Topic: ${parsed.data.subject}`,
          "",
          parsed.data.message,
        ].join("\n"),
      }),
    );
  }

  return acceptedResponse();
}
