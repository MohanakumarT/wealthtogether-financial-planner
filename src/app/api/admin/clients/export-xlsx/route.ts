import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { getAdminAccess } from "@/lib/server/admin-auth";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadRows(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  table: string,
  columns: string,
) {
  const rows: Array<Record<string, unknown>> = [];
  const pageSize = 1000;
  for (let from = 0; from < 100_000; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("id")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as unknown as Array<Record<string, unknown>>));
    if (!data || data.length < pageSize) break;
  }
  return rows;
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
  try {
    const [
      clients,
      goals,
      investments,
      insurance,
      tasks,
      activities,
      documents,
      consultations,
      enquiries,
    ] = await Promise.all([
      loadRows(
        supabase,
        "crm_clients",
        "id,name,phone,email,city,occupation,date_of_birth,income,risk_profile,status,priority,follow_up_status,next_follow_up_at,monthly_revenue,goals,notes,created_at,updated_at",
      ),
      loadRows(
        supabase,
        "crm_client_goals",
        "client_id,goal_type,title,target_amount,current_amount,target_date,status,notes,created_at",
      ),
      loadRows(
        supabase,
        "crm_client_investments",
        "client_id,investment_type,name,invested_amount,current_value,monthly_sip,investment_date,notes,created_at",
      ),
      loadRows(
        supabase,
        "crm_client_insurance",
        "client_id,insurance_type,provider,policy_name,cover_amount,annual_premium,renewal_date,notes,created_at",
      ),
      loadRows(
        supabase,
        "crm_tasks",
        "client_id,title,details,due_at,priority,status,created_at,updated_at",
      ),
      loadRows(
        supabase,
        "crm_client_activities",
        "client_id,activity_type,title,details,occurred_at,created_at",
      ),
      loadRows(
        supabase,
        "crm_client_documents",
        "client_id,file_name,mime_type,file_size,created_at",
      ),
      loadRows(
        supabase,
        "crm_consultations",
        "client_id,topic,scheduled_at,status,notes,created_at",
      ),
      loadRows(
        supabase,
        "consultation_requests",
        "client_id,name,email,phone,topic,preferred_date,preferred_time,time_zone,status,notes,created_at",
      ),
    ]);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "WealthTogether Investments";
    workbook.title = "WealthTogether CRM export";
    workbook.subject = "Private client CRM records";
    const sheets = [
      ["Clients", clients],
      ["Goals", goals],
      ["Investments", investments],
      ["Insurance", insurance],
      ["Follow-up tasks", tasks],
      ["Interactions", activities],
      ["Documents", documents],
      ["Consultations", consultations],
      ["Enquiries", enquiries],
    ] as const;
    for (const [name, rows] of sheets) {
      const sheet = workbook.addWorksheet(name);
      const keys = rows.length ? Object.keys(rows[0]) : [];
      sheet.columns = keys.map((key) => ({
        header: key,
        key,
        width: Math.max(14, Math.min(36, key.length + 4)),
      }));
      if (rows.length) sheet.addRows(rows);
      sheet.views = [{ state: "frozen", ySplit: 1 }];
      sheet.autoFilter = keys.length
        ? { from: { row: 1, column: 1 }, to: { row: 1, column: keys.length } }
        : undefined;
      const header = sheet.getRow(1);
      header.font = { bold: true, color: { argb: "FFFFFFFF" } };
      header.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF081B3A" },
      };
    }
    const bytes = await workbook.xlsx.writeBuffer();
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="wealthtogether-crm-export.xlsx"',
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "CRM records could not be exported." },
      { status: 503 },
    );
  }
}
