"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function CrmRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel("wealthtogether-crm", { config: { private: true } })
      .on("broadcast", { event: "changed" }, () => {
        window.dispatchEvent(new Event("crm:changed"));
        router.refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
