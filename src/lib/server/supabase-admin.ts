import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!projectUrl || !serviceKey) return null;

  try {
    const url = new URL(projectUrl);
    const allowedProtocol =
      url.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && url.protocol === "http:");
    if (!allowedProtocol || url.username || url.password) return null;
  } catch {
    return null;
  }

  return createClient(projectUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
