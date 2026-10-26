import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAuthIdentity } from "@/lib/server/user-auth";
import { sameOriginError } from "@/lib/server/request-security";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

async function authorize() {
  const identity = await getAuthIdentity();
  if (!identity)
    return {
      identity: null,
      response: json({ error: "Sign in to use the financial assistant." }, 401),
    };
  if (identity.role !== "client")
    return {
      identity: null,
      response: json(
        { error: "This assistant is available to client accounts." },
        403,
      ),
    };
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return {
      identity: null,
      response: json(
        { error: "The assistant is temporarily unavailable." },
        503,
      ),
    };
  return { identity, response: null, supabase };
}

export async function GET(_request: NextRequest, { params }: Context) {
  const access = await authorize();
  if (!access.identity || !access.supabase) return access.response;
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return json({ error: "Conversation not found." }, 404);
  const { data: conversation, error: conversationError } = await access.supabase
    .from("assistant_conversations")
    .select(
      "id,title,last_message_preview,last_message_at,created_at,updated_at",
    )
    .eq("id", id)
    .eq("user_id", access.identity.id)
    .maybeSingle();
  if (conversationError)
    return json({ error: "Conversation could not be loaded." }, 503);
  if (!conversation) return json({ error: "Conversation not found." }, 404);
  const { data: messages, error } = await access.supabase
    .from("assistant_messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", id)
    .eq("user_id", access.identity.id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(200);
  if (error)
    return json({ error: "Conversation messages could not be loaded." }, 503);
  return json({ conversation, messages: messages ?? [] });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await authorize();
  if (!access.identity || !access.supabase) return access.response;
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return json({ error: "Conversation not found." }, 404);
  const { error, count } = await access.supabase
    .from("assistant_conversations")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", access.identity.id);
  if (error) return json({ error: "Conversation could not be deleted." }, 503);
  if (!count) return json({ error: "Conversation not found." }, 404);
  return json({ deleted: true });
}
