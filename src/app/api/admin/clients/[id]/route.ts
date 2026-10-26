import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  clientInputSchema,
  clientInputToRecord,
} from "@/features/admin/schema";
import { getAdminAccess } from "@/lib/server/admin-auth";
import {
  parseJsonRequest,
  sameOriginError,
} from "@/lib/server/request-security";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { publishCrmChanged } from "@/lib/server/crm-realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return json({ error: "Client not found." }, 404);
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);

  try {
    const { data: client, error } = await supabase
      .from("crm_clients")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!client) return json({ error: "Client not found." }, 404);

    const [
      consultations,
      requests,
      plans,
      goals,
      investments,
      insurance,
      activities,
      tasks,
      documents,
    ] = await Promise.all([
      supabase
        .from("crm_consultations")
        .select("id,topic,scheduled_at,status,notes,created_at")
        .eq("client_id", id)
        .order("scheduled_at", { ascending: false })
        .limit(100),
      supabase
        .from("consultation_requests")
        .select(
          "id,topic,preferred_date,preferred_time,time_zone,status,notes,created_at",
        )
        .eq("client_id", id)
        .order("created_at", { ascending: false })
        .limit(100),
      client.auth_user_id
        ? supabase
            .from("saved_calculations")
            .select(
              "id,calculator_id,calculator_title,name,inputs,results,created_at,updated_at",
            )
            .eq("user_id", client.auth_user_id)
            .order("updated_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("crm_client_goals")
        .select("*")
        .eq("client_id", id)
        .order("target_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("crm_client_investments")
        .select("*")
        .eq("client_id", id)
        .order("investment_date", { ascending: false, nullsFirst: false }),
      supabase
        .from("crm_client_insurance")
        .select("*")
        .eq("client_id", id)
        .order("renewal_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("crm_client_activities")
        .select("*")
        .eq("client_id", id)
        .order("occurred_at", { ascending: false })
        .limit(200),
      supabase
        .from("crm_tasks")
        .select("*")
        .eq("client_id", id)
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(200),
      supabase
        .from("crm_client_documents")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
    ]);
    const failed = [
      consultations,
      requests,
      plans,
      goals,
      investments,
      insurance,
      activities,
      tasks,
      documents,
    ].find((result) => result.error);
    if (failed?.error) throw failed.error;
    const documentRows = await Promise.all(
      (documents.data ?? []).map(async (document) => {
        const { data: signed } = await supabase.storage
          .from("crm-client-documents")
          .createSignedUrl(document.storage_path, 60 * 10, {
            download: document.file_name,
          });
        return { ...document, download_url: signed?.signedUrl ?? null };
      }),
    );
    return json({
      client,
      consultations: consultations.data ?? [],
      requests: requests.data ?? [],
      plans: plans.data ?? [],
      goals: goals.data ?? [],
      investments: investments.data ?? [],
      insurance: insurance.data ?? [],
      activities: activities.data ?? [],
      tasks: tasks.data ?? [],
      documents: documentRows,
    });
  } catch {
    return json({ error: "This client profile could not be loaded." }, 503);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  if (access.role === "viewer")
    return json({ error: "Your role cannot change client records." }, 403);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return json({ error: "Client not found." }, 404);
  const parsed = await parseJsonRequest(request, 16_000, clientInputSchema, {
    tooLarge: "This client record is too large.",
    invalidJson: "Enter valid client details and try again.",
    invalidData: "Check the client details and try again.",
  });
  if (!parsed.ok) return parsed.response;
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);
  try {
    const { data: previous, error: previousError } = await supabase
      .from("crm_clients")
      .select("status,follow_up_status,next_follow_up_at")
      .eq("id", id)
      .maybeSingle();
    if (previousError) throw previousError;
    if (!previous) return json({ error: "Client not found." }, 404);
    const { data, error } = await supabase
      .from("crm_clients")
      .update({
        ...clientInputToRecord(parsed.data),
        email: parsed.data.email.toLowerCase(),
      })
      .eq("id", id)
      .select("id,email")
      .maybeSingle();
    if (error?.code === "23505") {
      return json(
        { error: "A client record already exists for this email address." },
        409,
      );
    }
    if (error) throw error;
    if (!data) return json({ error: "Client not found." }, 404);
    await supabase
      .from("consultation_requests")
      .update({ client_id: id })
      .eq("email", data.email)
      .is("client_id", null);
    const activities: Array<{
      client_id: string;
      activity_type: string;
      title: string;
      details: string;
      created_by: string;
    }> = [];
    const nextFollowUpAt = clientInputToRecord(parsed.data).next_follow_up_at;
    const previousFollowUpTime = previous.next_follow_up_at
      ? new Date(previous.next_follow_up_at).getTime()
      : null;
    const nextFollowUpTime = nextFollowUpAt
      ? new Date(String(nextFollowUpAt)).getTime()
      : null;
    if (previous.status !== parsed.data.status) {
      activities.push({
        client_id: id,
        activity_type: "status_change",
        title: "Client status updated",
        details: `${previous.status} → ${parsed.data.status}`,
        created_by: access.userId,
      });
    }
    if (
      previous.follow_up_status !== parsed.data.followUpStatus ||
      previousFollowUpTime !== nextFollowUpTime
    ) {
      activities.push({
        client_id: id,
        activity_type: "follow_up",
        title: "Follow-up updated",
        details: `${parsed.data.followUpStatus}${parsed.data.nextFollowUpAt ? ` · ${parsed.data.nextFollowUpAt}` : ""}`,
        created_by: access.userId,
      });
    }
    if (activities.length)
      await supabase.from("crm_client_activities").insert(activities);
    await publishCrmChanged();
    return json({ saved: true });
  } catch {
    return json({ error: "Client changes could not be saved." }, 503);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  if (access.role !== "owner" && access.role !== "admin")
    return json({ error: "Your role cannot delete client records." }, 403);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return json({ error: "Client not found." }, 404);
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);
  try {
    const { data: documents, error: documentsError } = await supabase
      .from("crm_client_documents")
      .select("storage_path")
      .eq("client_id", id);
    if (documentsError) throw documentsError;
    if (documents?.length) {
      const { error: storageError } = await supabase.storage
        .from("crm-client-documents")
        .remove(documents.map((document) => document.storage_path));
      if (storageError) throw storageError;
    }
    const { error, count } = await supabase
      .from("crm_clients")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw error;
    if (!count) return json({ error: "Client not found." }, 404);
    await publishCrmChanged();
    return json({ deleted: true });
  } catch {
    return json({ error: "This client could not be deleted." }, 503);
  }
}
