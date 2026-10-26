import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/server/admin-auth";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\u0000-\u0020]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const access = await getAdminAccess();
  if (!access)
    return NextResponse.json(
      { error: "Admin access is required." },
      { status: 401 },
    );
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return NextResponse.json(
      { error: "The admin data service is unavailable." },
      { status: 503 },
    );
  const rows: Array<Record<string, unknown>> = [];
  for (let from = 0; from < 100_000; from += 1000) {
    const { data, error } = await supabase
      .from("crm_clients")
      .select(
        "id,name,phone,email,city,occupation,goals,notes,follow_up_status,created_at,updated_at",
      )
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (error)
      return NextResponse.json(
        { error: "Client records could not be exported." },
        { status: 503 },
      );
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const columns = [
    "name",
    "phone",
    "email",
    "city",
    "occupation",
    "goals",
    "notes",
    "follow_up_status",
    "created_at",
    "updated_at",
  ] as const;
  const lines = [
    columns.map(csvCell).join(","),
    ...rows.map((row) =>
      columns.map((column) => csvCell(row[column])).join(","),
    ),
  ];
  return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="wealthtogether-clients.csv"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
