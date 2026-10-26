import { NextResponse, type NextRequest } from "next/server";

import { sameOriginError } from "@/lib/server/request-security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentication is unavailable." },
      { status: 503 },
    );
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json(
      { error: "Could not sign out. Try again." },
      { status: 500 },
    );
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
  response.cookies.set("wt-remember", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
