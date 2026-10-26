import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isIP } from "node:net";
import type { ZodType } from "zod";

export function hasValidOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export function sameOriginError(request: NextRequest) {
  return hasValidOrigin(request)
    ? null
    : NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
}

export function getClientAddress(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp)) return realIp;

  const forwardedIps = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((address) => address.trim())
    .reverse();
  return forwardedIps?.find((address) => isIP(address)) ?? "unknown";
}

export type JsonBodyReadResult =
  | { ok: true; body: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" };

export async function readJsonBody(
  request: NextRequest,
  maximumBytes: number,
): Promise<JsonBodyReadResult> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    return { ok: false, reason: "too_large" };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, reason: "invalid_json" };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return {
      ok: true,
      body: JSON.parse(new TextDecoder().decode(bytes)) as unknown,
    };
  } catch {
    await reader.cancel().catch(() => undefined);
    return { ok: false, reason: "invalid_json" };
  }
}

export async function parseJsonRequest<T>(
  request: NextRequest,
  maximumBytes: number,
  schema: ZodType<T>,
  messages: {
    tooLarge: string;
    invalidJson: string;
    invalidData: string;
  },
) {
  const body = await readJsonBody(request, maximumBytes);
  if (!body.ok) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            body.reason === "too_large"
              ? messages.tooLarge
              : messages.invalidJson,
        },
        { status: body.reason === "too_large" ? 413 : 400 },
      ),
    };
  }

  const parsed = schema.safeParse(body.body);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? messages.invalidData,
        },
        { status: 400 },
      ),
    };
  }
  return { ok: true as const, data: parsed.data };
}
