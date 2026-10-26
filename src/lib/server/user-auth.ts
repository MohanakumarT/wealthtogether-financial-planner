import "server-only";

import { redirect } from "next/navigation";

import type { AuthIdentity, UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const [adminResult, profileResult] = await Promise.all([
    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  if (adminResult.error) return null;

  const role = adminResult.data ? "admin" : "client";
  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";
  const profile = (profileResult.data as UserProfile | null) ?? {
    id: user.id,
    role,
    full_name: metadataName,
    email: user.email ?? "",
    phone: "",
    dob: null,
    occupation: "",
    city: "",
    country: "",
    avatar: "",
    monthly_income: 0,
    current_monthly_sip: 0,
    risk_profile: "not_assessed" as const,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };

  return {
    id: user.id,
    email: user.email ?? "",
    role,
    profile: { ...profile, role },
  };
}

export async function requireClientAccess(nextPath = "/dashboard") {
  const identity = await getAuthIdentity();
  if (!identity) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (identity.role === "admin") redirect("/admin");
  return identity;
}
