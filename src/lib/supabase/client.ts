"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

const rememberCookieName = "wt-remember";
const rememberedSessionMaxAge = 60 * 60 * 24 * 30;

function readCookies() {
  if (typeof document === "undefined") return [];
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf("=");
      return {
        name: decodeURIComponent(part.slice(0, separator)),
        value: decodeURIComponent(part.slice(separator + 1)),
      };
    });
}

export function setRememberMe(enabled: boolean) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const persistence = enabled ? `; Max-Age=${rememberedSessionMaxAge}` : "";
  document.cookie = `${rememberCookieName}=${enabled ? "1" : "0"}; Path=/; SameSite=Lax${persistence}${secure}`;
}

export function createSupabaseBrowserClient() {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.key, {
    cookieOptions: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll: readCookies,
      setAll(cookiesToSet) {
        const remember = readCookies().some(
          (cookie) =>
            cookie.name === rememberCookieName && cookie.value === "1",
        );
        const secure = window.location.protocol === "https:";
        cookiesToSet.forEach(({ name, value, options }) => {
          const maxAge =
            options.maxAge === 0
              ? 0
              : remember
                ? rememberedSessionMaxAge
                : undefined;
          const path = options.path ?? "/";
          const sameSite = options.sameSite ?? "lax";
          const domain = options.domain ? `; Domain=${options.domain}` : "";
          const age = maxAge === undefined ? "" : `; Max-Age=${maxAge}`;
          document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}${domain}${age}${secure ? "; Secure" : ""}`;
        });
      },
    },
  });
}
