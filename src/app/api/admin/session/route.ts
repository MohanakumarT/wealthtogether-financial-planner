import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getAdminAccess();
  return NextResponse.json(
    access ? { role: access.role } : { error: "Admin access is required." },
    {
      status: access ? 200 : 403,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}
