import "server-only";

import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function consumePublicRateLimit(
  supabase: SupabaseClient,
  {
    scope,
    identifier,
    maximum,
    windowSeconds,
  }: {
    scope: string;
    identifier: string;
    maximum: number;
    windowSeconds: number;
  },
) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) throw new Error("Public request limiting is not configured.");

  const keyHash = createHmac("sha256", secret)
    .update(`${scope}\0${identifier}`)
    .digest("hex");
  const { data, error } = await supabase.rpc("consume_public_rate_limit", {
    p_key_hash: keyHash,
    p_limit: maximum,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== "boolean") {
    throw new Error("Public request limiting is unavailable.");
  }
  return data;
}
