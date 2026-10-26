import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  parseJsonRequest,
  sameOriginError,
} from "@/lib/server/request-security";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isValidDateOnly(value: string) {
  if (value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

const profileSchema = z
  .object({
    full_name: z.string().trim().min(2).max(80),
    phone: z.string().trim().max(25),
    dob: z
      .string()
      .trim()
      .refine(isValidDateOnly, "Enter a valid date of birth."),
    occupation: z.string().trim().max(100),
    city: z.string().trim().max(100),
    country: z.string().trim().max(100),
    avatar: z
      .string()
      .trim()
      .max(2048)
      .refine((value) => {
        if (!value) return true;
        try {
          return new URL(value).protocol === "https:";
        } catch {
          return false;
        }
      }, "Avatar URL must use HTTPS."),
    monthly_income: z.number().finite().min(0).max(1_000_000_000),
    current_monthly_sip: z.number().finite().min(0).max(1_000_000_000),
    risk_profile: z.enum([
      "conservative",
      "moderate",
      "aggressive",
      "not_assessed",
    ]),
  })
  .strict();

export async function PATCH(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!getSupabasePublicEnv()) {
    return NextResponse.json(
      { error: "Authentication is unavailable." },
      { status: 503 },
    );
  }

  const parsed = await parseJsonRequest(request, 8_192, profileSchema, {
    tooLarge: "Profile details are too large.",
    invalidJson: "Invalid request body.",
    invalidData: "Check the profile fields.",
  });
  if (!parsed.ok) return parsed.response;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentication is unavailable." },
      { status: 503 },
    );
  }
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Sign in to update your profile." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, dob: parsed.data.dob || null })
    .eq("id", user.id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json(
      { error: "Your profile could not be saved. Please try again." },
      { status: 500 },
    );
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.full_name },
  });
  if (metadataError) {
    return NextResponse.json(
      {
        error:
          "Your profile was saved, but your account display name did not sync.",
      },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { profile: data },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
