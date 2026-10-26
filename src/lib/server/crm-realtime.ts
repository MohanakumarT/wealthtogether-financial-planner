import "server-only";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

/** Publish an empty invalidation event; CRM records never travel over Realtime. */
export async function publishCrmChanged() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  try {
    await supabase
      .channel("wealthtogether-crm", { config: { private: true } })
      .send({
        type: "broadcast",
        event: "changed",
        payload: {},
      });
  } catch {
    // CRUD success must not depend on the optional live refresh signal.
  }
}
