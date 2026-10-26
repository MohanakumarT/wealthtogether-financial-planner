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

    const [consultations, requests, plans] = await Promise.all([
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
    ]);
    if (consultations.error || requests.error || plans.error)
      throw consultations.error ?? requests.error ?? plans.error;
    return json({
      client,
      consultations: consultations.data ?? [],
      requests: requests.data ?? [],
      plans: plans.data ?? [],
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
    const { error, count } = await supabase
      .from("crm_clients")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw error;
    if (!count) return json({ error: "Client not found." }, 404);
    return json({ deleted: true });
  } catch {
    return json({ error: "This client could not be deleted." }, 503);
  }
}
