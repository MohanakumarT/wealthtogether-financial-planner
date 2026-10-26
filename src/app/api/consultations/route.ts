import { after, NextResponse, type NextRequest } from "next/server";

import { consultationRequestSchema } from "@/features/consultations/schema";
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

  const parsed = await parseJsonRequest(
    request,
    12_000,
    consultationRequestSchema,
    {
      tooLarge: "This request is too large.",
      invalidJson: "Enter valid booking details and try again.",
      invalidData: "Check the booking details and try again.",
    },
  );
  if (!parsed.ok) return parsed.response;
  if (parsed.data.website) return acceptedResponse();

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "The booking service is being configured. Please contact WealthTogether directly.",
      },
      { status: 503 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  try {
    const ipAllowed = await consumePublicRateLimit(supabase, {
      scope: "consultation:ip",
      identifier: getClientAddress(request),
      maximum: 5,
      windowSeconds: 3600,
    });
    if (!ipAllowed) {
      return NextResponse.json(
        { error: "Please wait before sending another consultation request." },
        { status: 429 },
      );
    }

    const emailAllowed = await consumePublicRateLimit(supabase, {
      scope: "consultation:email",
      identifier: email,
      maximum: 1,
      windowSeconds: 600,
    });
    // Keep duplicate-email responses indistinguishable from accepted requests.
    if (!emailAllowed) return acceptedResponse();
  } catch {
    console.error("Consultation request rate limiting is unavailable.");
    return NextResponse.json(
      {
        error:
          "The booking service is temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const { data: matchedClient } = await supabase
      .from("crm_clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    const { data: savedRequest, error } = await supabase
      .from("consultation_requests")
      .insert({
        name: parsed.data.name,
        email,
        phone: parsed.data.phone,
        topic: parsed.data.topic,
        preferred_date: parsed.data.preferredDate,
        preferred_time: parsed.data.preferredTime,
        time_zone: parsed.data.timeZone,
        notes: parsed.data.notes || null,
        consented_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      console.error("Consultation request could not be saved.", error.code);
      return NextResponse.json(
        {
          error:
            "Your request could not be saved. Please try again or contact us directly.",
        },
        { status: 503 },
      );
    }
    if (matchedClient) {
      await supabase
        .from("consultation_requests")
        .update({ client_id: matchedClient.id })
        .eq("id", savedRequest.id);
    }
  } catch {
    console.error("Consultation request could not be saved.");
    return NextResponse.json(
      {
        error:
          "Your request could not be saved. Please try again or contact us directly.",
      },
      { status: 503 },
    );
  }

  const to = process.env.CONSULTATION_NOTIFICATION_EMAIL;
  if (to && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    after(() =>
      sendNotificationEmail({
        to,
        replyTo: email,
        subject: "New WealthTogether consultation request",
        text: [
          `Name: ${parsed.data.name}`,
          `Email: ${email}`,
          `Phone: ${parsed.data.phone}`,
          `Planning focus: ${parsed.data.topic}`,
          `Preferred date: ${parsed.data.preferredDate}`,
          `Preferred time: ${parsed.data.preferredTime} (${parsed.data.timeZone})`,
          `Notes: ${parsed.data.notes || "None provided"}`,
        ].join("\n"),
      }),
    );
  }

  return acceptedResponse();
}
