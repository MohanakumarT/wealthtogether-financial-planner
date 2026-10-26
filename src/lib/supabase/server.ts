import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  const rememberMe = cookieStore.get("wt-remember")?.value === "1";
  return createServerClient(env.url, env.key, {
    cookieOptions: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              maxAge:
                options?.maxAge === 0
                  ? 0
                  : rememberMe
                    ? 60 * 60 * 24 * 30
                    : undefined,
            });
          });
        } catch {
          // Server Components cannot write cookies; middleware refreshes sessions.
        }
      },
    },
  });
}
