import { NextResponse, type NextRequest } from "next/server";

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

export async function GET(request: NextRequest) {
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Math.min(10_000, Number(params.get("page")) || 1));
  const pageSize = 20;
  const search = (params.get("search") ?? "")
    .trim()
    .replace(/[^\p{L}\p{N}@.+\-\s]/gu, "")
    .slice(0, 80);
  const followUp = params.get("followUp");
  const from = (page - 1) * pageSize;

  try {
    let query = supabase
      .from("crm_clients")
      .select(
        "id,name,phone,email,city,occupation,goals,notes,follow_up_status,created_at,updated_at",
        { count: "exact" },
      );
    if (search) {
      const pattern = `%${search.replace(/[%_]/g, "\\$&")}%`;
      query = query.or(
        `name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},city.ilike.${pattern}`,
      );
    }
    if (
      followUp &&
      ["none", "due", "scheduled", "completed"].includes(followUp)
    ) {
      query = query.eq("follow_up_status", followUp);
    }
    const { data, count, error } = await query
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    return json({ clients: data ?? [], total: count ?? 0, page, pageSize });
  } catch {
    return json({ error: "Client records could not be loaded." }, 503);
  }
}

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  if (access.role === "viewer")
    return json({ error: "Your role cannot change client records." }, 403);

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
      .insert({
        ...clientInputToRecord(parsed.data),
        email: parsed.data.email.toLowerCase(),
        created_by: access.userId,
      })
      .select("id,name,email")
      .single();
    if (error?.code === "23505") {
      return json(
        { error: "A client record already exists for this email address." },
        409,
      );
    }
    if (error) throw error;
    await supabase
      .from("consultation_requests")
      .update({ client_id: data.id })
      .eq("email", data.email)
      .is("client_id", null);
    return json({ client: data }, 201);
  } catch {
    return json(
      {
        error:
          "The client could not be saved. Check for duplicate records and try again.",
      },
      503,
    );
  }
}
