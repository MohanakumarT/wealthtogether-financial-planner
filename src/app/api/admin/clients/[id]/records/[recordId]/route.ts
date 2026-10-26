import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAdminAccess } from "@/lib/server/admin-auth";
import { publishCrmChanged } from "@/lib/server/crm-realtime";
import {
  parseJsonRequest,
  sameOriginError,
} from "@/lib/server/request-security";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string; recordId: string }> };
const tables = {
  goal: "crm_client_goals",
  investment: "crm_client_investments",
  insurance: "crm_client_insurance",
  activity: "crm_client_activities",
  task: "crm_tasks",
  document: "crm_client_documents",
} as const;

export async function PATCH(request: NextRequest, { params }: Context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access)
    return NextResponse.json(
      { error: "Admin access is required." },
      { status: 401 },
    );
  if (access.role === "viewer")
    return NextResponse.json(
      { error: "Your role cannot change client records." },
      { status: 403 },
    );
  const { id, recordId } = await params;
  if (
    !z.uuid().safeParse(id).success ||
    !z.uuid().safeParse(recordId).success ||
    request.nextUrl.searchParams.get("kind") !== "task"
  ) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }
  const parsed = await parseJsonRequest(
    request,
    1000,
    z.object({ status: z.enum(["pending", "completed"]) }),
    {
      tooLarge: "Invalid task update.",
      invalidJson: "Enter a valid task status.",
      invalidData: "Choose a valid task status.",
    },
  );
  if (!parsed.ok) return parsed.response;
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return NextResponse.json(
      { error: "The admin data service is unavailable." },
      { status: 503 },
    );
  try {
    const { data, error } = await supabase
      .from("crm_tasks")
      .update({ status: parsed.data.status })
      .eq("id", recordId)
      .eq("client_id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    await publishCrmChanged();
    return NextResponse.json(
      { saved: true },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The task could not be updated." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access)
    return NextResponse.json(
      { error: "Admin access is required." },
      { status: 401 },
    );
  if (access.role === "viewer")
    return NextResponse.json(
      { error: "Your role cannot change client records." },
      { status: 403 },
    );
  const { id, recordId } = await params;
  const kind = request.nextUrl.searchParams.get("kind") as
    keyof typeof tables | null;
  if (
    !z.uuid().safeParse(id).success ||
    !z.uuid().safeParse(recordId).success ||
    !kind ||
    !(kind in tables)
  ) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return NextResponse.json(
      { error: "The admin data service is unavailable." },
      { status: 503 },
    );
  try {
    if (kind === "document") {
      const { data: document, error: lookupError } = await supabase
        .from(tables.document)
        .select("storage_path")
        .eq("id", recordId)
        .eq("client_id", id)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!document)
        return NextResponse.json(
          { error: "Record not found." },
          { status: 404 },
        );
      const { error: storageError } = await supabase.storage
        .from("crm-client-documents")
        .remove([document.storage_path]);
      if (storageError) throw storageError;
    }
    const { error, count } = await supabase
      .from(tables[kind])
      .delete({ count: "exact" })
      .eq("id", recordId)
      .eq("client_id", id);
    if (error) throw error;
    if (!count)
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    await publishCrmChanged();
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "The record could not be deleted." },
      { status: 503 },
    );
  }
}
