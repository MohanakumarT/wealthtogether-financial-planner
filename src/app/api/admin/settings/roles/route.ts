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

const assignmentSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  role: z.enum(["admin", "advisor", "viewer"]),
});
const roleUpdateSchema = z.object({
  userId: z.uuid(),
  role: z.enum(["admin", "advisor", "viewer"]),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

async function requireOwner() {
  const access = await getAdminAccess();
  if (!access)
    return {
      access: null,
      response: json({ error: "Admin access is required." }, 401),
    };
  if (access.role !== "owner")
    return {
      access: null,
      response: json(
        { error: "Only an account owner can manage administrator access." },
        403,
      ),
    };
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return {
      access: null,
      response: json({ error: "The admin data service is unavailable." }, 503),
    };
  return { access, response: null, supabase };
}

async function listAuthUsers(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
) {
  const users: Array<{ id: string; email?: string }> = [];
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    users.push(...data.users.map(({ id, email }) => ({ id, email })));
    if (data.users.length < 1000) break;
  }
  return users;
}

export async function GET() {
  const result = await requireOwner();
  if (!result.access || !result.supabase) return result.response;
  try {
    const [{ data: assignments, error }, users] = await Promise.all([
      result.supabase
        .from("admin_users")
        .select("user_id,role,created_at")
        .order("created_at"),
      listAuthUsers(result.supabase),
    ]);
    if (error) throw error;
    const usersById = new Map(users.map((user) => [user.id, user.email ?? ""]));
    return json({
      assignments: (assignments ?? []).map((assignment) => ({
        ...assignment,
        email: usersById.get(assignment.user_id) ?? "Account email unavailable",
      })),
    });
  } catch {
    return json(
      { error: "Administrator assignments could not be loaded." },
      503,
    );
  }
}

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const result = await requireOwner();
  if (!result.access || !result.supabase) return result.response;
  const parsed = await parseJsonRequest(request, 2_000, assignmentSchema, {
    tooLarge: "Check the administrator details and try again.",
    invalidJson: "Enter a valid email and role.",
    invalidData: "Enter a valid email and role.",
  });
  if (!parsed.ok) return parsed.response;
  try {
    const users = await listAuthUsers(result.supabase);
    const user = users.find(
      (item) => item.email?.toLowerCase() === parsed.data.email,
    );
    if (!user)
      return json(
        {
          error:
            "This email does not belong to a registered account. Ask the user to create an account first.",
        },
        404,
      );
    const { error } = await result.supabase
      .from("admin_users")
      .insert({ user_id: user.id, role: parsed.data.role });
    if (error?.code === "23505")
      return json(
        { error: "This account already has administrator access." },
        409,
      );
    if (error) throw error;
    await publishCrmChanged();
    return json({ saved: true }, 201);
  } catch {
    return json({ error: "Administrator access could not be assigned." }, 503);
  }
}

export async function PATCH(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const result = await requireOwner();
  if (!result.access || !result.supabase) return result.response;
  const parsed = await parseJsonRequest(request, 2_000, roleUpdateSchema, {
    tooLarge: "Check the role update and try again.",
    invalidJson: "Enter a valid role update.",
    invalidData: "Enter a valid role update.",
  });
  if (!parsed.ok) return parsed.response;
  if (parsed.data.userId === result.access.userId)
    return json({ error: "Your owner role cannot be changed here." }, 403);
  try {
    const { data, error } = await result.supabase
      .from("admin_users")
      .update({ role: parsed.data.role })
      .eq("user_id", parsed.data.userId)
      .neq("role", "owner")
      .select("user_id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return json(
        { error: "Assignment not found or owner roles are locked." },
        404,
      );
    await publishCrmChanged();
    return json({ saved: true });
  } catch {
    return json({ error: "The role could not be updated." }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const result = await requireOwner();
  if (!result.access || !result.supabase) return result.response;
  const userId = request.nextUrl.searchParams.get("userId") ?? "";
  if (!z.uuid().safeParse(userId).success)
    return json({ error: "Assignment not found." }, 404);
  if (userId === result.access.userId)
    return json({ error: "Your owner access cannot be removed here." }, 403);
  try {
    const { error, count } = await result.supabase
      .from("admin_users")
      .delete({ count: "exact" })
      .eq("user_id", userId)
      .neq("role", "owner");
    if (error) throw error;
    if (!count)
      return json(
        { error: "Assignment not found or owner roles are locked." },
        404,
      );
    await publishCrmChanged();
    return json({ deleted: true });
  } catch {
    return json({ error: "Administrator access could not be removed." }, 503);
  }
}
