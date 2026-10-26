import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/server/admin-auth";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function GET() {
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);

  try {
    const [
      clients,
      enquiries,
      bookedRequests,
      completedRequests,
      bookedManual,
      completedManual,
      latest,
    ] = await Promise.all([
      supabase.from("crm_clients").select("id", { count: "exact", head: true }),
      supabase
        .from("consultation_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("consultation_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed"),
      supabase
        .from("consultation_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("crm_consultations")
        .select("id", { count: "exact", head: true })
        .eq("status", "booked"),
      supabase
        .from("crm_consultations")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("consultation_requests")
        .select(
          "id,name,email,topic,preferred_date,preferred_time,time_zone,status,created_at,client_id",
        )
        .order("created_at", { ascending: false })
        .limit(6),
    ]);
    const failed = [
      clients,
      enquiries,
      bookedRequests,
      completedRequests,
      bookedManual,
      completedManual,
      latest,
    ].find((result) => result.error);
    if (failed?.error) throw failed.error;

    return json({
      stats: {
        totalClients: clients.count ?? 0,
        newEnquiries: enquiries.count ?? 0,
        bookedConsultations:
          (bookedRequests.count ?? 0) + (bookedManual.count ?? 0),
        completedConsultations:
          (completedRequests.count ?? 0) + (completedManual.count ?? 0),
      },
      latestEnquiries: latest.data ?? [],
    });
  } catch {
    return json({ error: "Dashboard data could not be loaded." }, 503);
  }
}
