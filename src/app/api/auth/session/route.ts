import { NextResponse } from "next/server";

import { getAuthIdentity } from "@/lib/server/user-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json(
      { user: null },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { user: identity },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
