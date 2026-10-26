import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAdminAccess } from "@/lib/server/admin-auth";
import { publishCrmChanged } from "@/lib/server/crm-realtime";
import { sameOriginError } from "@/lib/server/request-security";
import { parseJsonRequest } from "@/lib/server/request-security";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const amount = z.coerce.number().finite().min(0).max(1_000_000_000_000);
const goalSchema = z.object({
  kind: z.literal("goal"),
  goal_type: z.enum([
    "retirement",
    "education",
    "house",
    "car",
    "emergency_fund",
    "marriage",
    "vacation",
    "wealth_creation",
    "other",
  ]),
  title: z.string().trim().min(2).max(120),
  target_amount: amount,
  current_amount: amount,
  target_date: z.union([z.literal(""), z.iso.date()]).default(""),
  notes: z.string().max(3000).default(""),
});
const investmentSchema = z.object({
  kind: z.literal("investment"),
  investment_type: z.enum(["mutual_fund", "sip", "lumpsum"]),
  name: z.string().trim().min(2).max(120),
  invested_amount: amount,
  current_value: amount,
  monthly_sip: amount.default(0),
  investment_date: z.union([z.literal(""), z.iso.date()]).default(""),
  notes: z.string().max(3000).default(""),
});
const insuranceSchema = z.object({
  kind: z.literal("insurance"),
  insurance_type: z.enum(["life", "health", "term"]),
  provider: z.string().max(120).default(""),
  policy_name: z.string().trim().min(2).max(120),
  cover_amount: amount,
  annual_premium: amount,
  renewal_date: z.union([z.literal(""), z.iso.date()]).default(""),
  notes: z.string().max(3000).default(""),
});
const activitySchema = z.object({
  kind: z.literal("activity"),
  activity_type: z.enum([
    "note",
    "meeting",
    "whatsapp",
    "email",
    "phone",
    "follow_up",
  ]),
  title: z.string().trim().min(2).max(160),
  details: z.string().max(10000).default(""),
});
const taskSchema = z.object({
  kind: z.literal("task"),
  title: z.string().trim().min(2).max(160),
  details: z.string().max(3000).default(""),
  due_at: z.string().max(40).default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});
const recordSchema = z.discriminatedUnion("kind", [
  goalSchema,
  investmentSchema,
  insuranceSchema,
  activitySchema,
  taskSchema,
]);
type Context = { params: Promise<{ id: string }> };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest, { params }: Context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  if (access.role === "viewer")
    return json({ error: "Your role cannot change client records." }, 403);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return json({ error: "Client not found." }, 404);
  const parsed = await parseJsonRequest(request, 20_000, recordSchema, {
    tooLarge: "This client record is too large.",
    invalidJson: "Enter valid record details.",
    invalidData: "Check the record details and try again.",
  });
  if (!parsed.ok) return parsed.response;
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);
  const { kind, ...fields } = parsed.data;
  const table = {
    goal: "crm_client_goals",
    investment: "crm_client_investments",
    insurance: "crm_client_insurance",
    activity: "crm_client_activities",
    task: "crm_tasks",
  }[kind];
  const nullableDates = ["target_date", "investment_date", "renewal_date"];
  const record = { ...fields } as Record<string, unknown>;
  for (const key of nullableDates) if (record[key] === "") record[key] = null;
  if (kind === "task" && record.due_at) {
    const due = new Date(String(record.due_at));
    if (Number.isNaN(due.getTime()))
      return json({ error: "Enter a valid task due date." }, 400);
    record.due_at = due.toISOString();
  } else if (kind === "task") record.due_at = null;
  if (kind === "activity") record.created_by = access.userId;
  if (kind === "task") record.assigned_to = access.userId;
  try {
    const { data, error } = await supabase
      .from(table)
      .insert({ client_id: id, ...record })
      .select("*")
      .single();
    if (error) throw error;
    await publishCrmChanged();
    return json({ record: data }, 201);
  } catch {
    return json({ error: "The record could not be saved." }, 503);
  }
}
