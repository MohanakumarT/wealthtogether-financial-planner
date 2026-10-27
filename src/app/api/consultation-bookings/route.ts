import { NextResponse, type NextRequest } from "next/server";

import { consultationServices } from "@/features/consultation/constants/services";
import { consultationBookingSchema } from "@/features/consultation/validation/booking-schema";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { consumePublicRateLimit } from "@/lib/server/public-rate-limit";
import {
  getClientAddress,
  parseJsonRequest,
  sameOriginError,
} from "@/lib/server/request-security";

export const runtime = "nodejs";

function logDatabaseError(label: string, error: unknown) {
  console.error(label);
  console.dir(error, { depth: null });
  if (typeof error === "object" && error !== null) {
    const details = error as Record<string, unknown>;
    console.error("Supabase error details:", {
      code: details.code,
      message: details.message,
      details: details.details,
      hint: details.hint,
    });
  } else if (error instanceof Error) {
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }
}

function logSupabaseConfigurationError() {
  console.error("Consultation booking Supabase configuration is incomplete.", {
    hasProjectUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  });
}

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;

  const parsed = await parseJsonRequest(
    request,
    16_000,
    consultationBookingSchema,
    {
      tooLarge: "This booking request is too large.",
      invalidJson: "Enter valid booking details and try again.",
      invalidData: "Check the booking details and try again.",
    },
  );

  if (!parsed.ok) return parsed.response;

  if (parsed.data.website) {
    return NextResponse.json(
      { error: "Unable to submit this request." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    logSupabaseConfigurationError();
    return NextResponse.json(
      {
        error:
          "The booking service is being configured. Please contact WealthTogether directly.",
      },
      { status: 503 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  // Skip rate limiting during local development
  if (process.env.NODE_ENV !== "development") {
    try {
      const ipAllowed = await consumePublicRateLimit(supabase, {
        scope: "consultation-booking:ip",
        identifier: getClientAddress(request),
        maximum: 5,
        windowSeconds: 3600,
      });

      if (!ipAllowed) {
        return NextResponse.json(
          { error: "Please wait before sending another booking request." },
          { status: 429 },
        );
      }

      const emailAllowed = await consumePublicRateLimit(supabase, {
        scope: "consultation-booking:email",
        identifier: email,
        maximum: 2,
        windowSeconds: 3600,
      });

      if (!emailAllowed) {
        return NextResponse.json(
          {
            error:
              "Too many requests have been sent for this email. Please try again later.",
          },
          { status: 429 },
        );
      }
    } catch (error) {
      logDatabaseError(
        "Consultation booking rate limiting is unavailable.",
        error,
      );

      return NextResponse.json(
        {
          error:
            "The booking service is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }
  }

  const values = parsed.data;

  const service = consultationServices.find(
    (item) => item.id === values.serviceId,
  );

  if (!service) {
    return NextResponse.json(
      { error: "Choose a valid consultation service." },
      { status: 400 },
    );
  }

  try {
    const { data: existingClient } = await supabase
      .from("crm_clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service: service.name,
        price: service.price,
        booking_status: "Pending",
        name: values.name,
        email,
        phone: values.phone,
        whatsapp: values.whatsapp,
        age: Number(values.age),
        occupation: values.occupation,
        income: Number(values.monthlyIncome),
        city: values.city,
        investment_experience: values.investmentExperience === "yes",
        monthly_sip: Number(values.monthlySip),
        financial_goals: values.financialGoals,
        investment_budget: Number(values.investmentBudget),
        risk_profile: values.riskProfile,
        preferred_date: values.preferredDate,
        preferred_time: values.preferredTime,
        time_zone: values.timeZone,
        meeting_mode: values.meetingMode,
        notes: values.notes || null,
        client_id: existingClient?.id ?? null,
        consented_at: new Date().toISOString(),
      })
      .select("booking_id,booking_reference")
      .single();

    if (error || !data) {
      if (error) {
        logDatabaseError(
          "Consultation booking could not be saved.",
          error,
        );
      } else {
        console.error(
          "Supabase returned no booking row and no error."
        );
      }

      if (error?.code === "23505") {
        return NextResponse.json(
          {
            error:
              "That appointment time was just booked. Please choose another available time.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error:
            "Your booking request could not be saved. Please try again or contact us directly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        bookingReference: data.booking_reference,
      },
      { status: 201 },
    );
  } catch (error) {
    logDatabaseError(
      "Consultation booking could not be saved.",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Your booking request could not be saved. Please try again or contact us directly.",
      },
      { status: 503 },
    );
  }
}