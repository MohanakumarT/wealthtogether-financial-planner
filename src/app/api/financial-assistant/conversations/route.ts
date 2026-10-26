import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAuthIdentity } from "@/lib/server/user-auth";
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

async function authorizedClient() {
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

export async function GET() {
  const access = await authorizedClient();
  if (!access.identity || !access.supabase) return access.response;
  const { data, error } = await access.supabase
    .from("assistant_conversations")
    .select(
      "id,title,last_message_preview,last_message_at,created_at,updated_at",
    )
    .eq("user_id", access.identity.id)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error)
    return json({ error: "Conversation history could not be loaded." }, 503);
  return json({ conversations: data ?? [] });
}

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await authorizedClient();
  if (!access.identity || !access.supabase) return access.response;
  const parsed = await parseJsonRequest(
    request,
    2_000,
    z
      .object({
        title: z.string().trim().min(1).max(120).default("New conversation"),
      })
      .strict(),
    {
      tooLarge: "Conversation details are too long.",
      invalidJson: "Enter a valid conversation title.",
      invalidData: "Enter a valid conversation title.",
    },
  );
  if (!parsed.ok) return parsed.response;
  const { data, error } = await access.supabase
    .from("assistant_conversations")
    .insert({ user_id: access.identity.id, title: parsed.data.title })
    .select(
      "id,title,last_message_preview,last_message_at,created_at,updated_at",
    )
    .single();
  if (error || !data)
    return json({ error: "A new conversation could not be created." }, 503);
  return json({ conversation: data }, 201);
}
