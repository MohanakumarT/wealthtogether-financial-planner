import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "admin" | "advisor" | "viewer";
export type AdminAccess = { userId: string; role: AdminRole; email: string };

export async function getAdminAccess(): Promise<AdminAccess | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;

  const role = data.role as AdminRole;
  if (!(["owner", "admin", "advisor", "viewer"] as string[]).includes(role)) {
    return null;
  }
  return { userId: user.id, role, email: user.email ?? "" };
}
