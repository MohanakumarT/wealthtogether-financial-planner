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
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());
    const todayStart = new Date(`${today}T00:00:00+05:30`).toISOString();
    const tomorrowStart = new Date(
      new Date(`${today}T00:00:00+05:30`).getTime() + 86_400_000,
    ).toISOString();
    const [
      clients,
      activeClients,
      enquiries,
      bookedRequests,
      completedRequests,
      bookedManual,
      completedManual,
      latest,
      todayFollowUps,
      todayTasks,
      pendingTasks,
      financialSummary,
    ] = await Promise.all([
      supabase.from("crm_clients").select("id", { count: "exact", head: true }),
      supabase
        .from("crm_clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
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
      supabase
        .from("crm_clients")
        .select("id", { count: "exact", head: true })
        .gte("next_follow_up_at", todayStart)
        .lt("next_follow_up_at", tomorrowStart),
      supabase
        .from("crm_tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("due_at", todayStart)
        .lt("due_at", tomorrowStart),
      supabase
        .from("crm_tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.rpc("crm_dashboard_financial_summary"),
    ]);
    const failed = [
      clients,
      activeClients,
      enquiries,
      bookedRequests,
      completedRequests,
      bookedManual,
      completedManual,
      latest,
      todayFollowUps,
      todayTasks,
      pendingTasks,
      financialSummary,
    ].find((result) => result.error);
    if (failed?.error) throw failed.error;
    const summary = (financialSummary.data ?? {}) as {
      monthlyRevenue?: number;
      totalAum?: number;
      assetAllocation?: Array<{ name: string; value: number }>;
      investmentTimeline?: Array<{
        month: string;
        label: string;
        value: number;
      }>;
    };

    return json({
      stats: {
        totalClients: clients.count ?? 0,
        activeClients: activeClients.count ?? 0,
        todayFollowUps: (todayFollowUps.count ?? 0) + (todayTasks.count ?? 0),
        monthlyRevenue: Number(summary.monthlyRevenue ?? 0),
        totalAum: Number(summary.totalAum ?? 0),
        pendingTasks: pendingTasks.count ?? 0,
        newEnquiries: enquiries.count ?? 0,
        bookedConsultations:
          (bookedRequests.count ?? 0) + (bookedManual.count ?? 0),
        completedConsultations:
          (completedRequests.count ?? 0) + (completedManual.count ?? 0),
      },
      assetAllocation: summary.assetAllocation ?? [],
      investmentTimeline: summary.investmentTimeline ?? [],
      latestEnquiries: latest.data ?? [],
    });
  } catch {
    return json({ error: "Dashboard data could not be loaded." }, 503);
  }
}
