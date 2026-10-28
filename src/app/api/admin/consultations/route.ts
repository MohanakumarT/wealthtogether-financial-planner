import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  consultationInputSchema,
  consultationStatusSchema,
} from "@/features/admin/schema";
import { getAdminAccess } from "@/lib/server/admin-auth";
import {
  parseJsonRequest,
  sameOriginError,
} from "@/lib/server/request-security";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { publishCrmChanged } from "@/lib/server/crm-realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function GET() {
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);
  try {
    const [requests, consultations] = await Promise.all([
  supabase
    .from("bookings")
    .select(
      "booking_id,booking_reference,client_id,name,email,phone,service,price,preferred_date,preferred_time,time_zone,notes,booking_status,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500),
      supabase
        .from("crm_consultations")
        .select(
          "id,client_id,topic,scheduled_at,status,notes,created_at,client:crm_clients(name,email)",
        )
        .order("scheduled_at", { ascending: true })
        .limit(500),
    ]);
    if (requests.error || consultations.error)
      throw requests.error ?? consultations.error;
    return json({
      requests:
      (requests.data ?? []).map((item) => ({
      id: item.booking_id,
      booking_reference: item.booking_reference,
      client_id:  item.client_id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      topic: item.service,
      preferred_date: item.preferred_date,
      preferred_time: item.preferred_time,
      time_zone: item.time_zone,
      notes: item.notes,
      price: item.price,
      status: item.booking_status.toLowerCase(),
      created_at: item.created_at,
      })),
      consultations: consultations.data ?? [],
    });
  } catch (error) {
    console.error("Admin consultations GET failed:");
    console.dir(error, { depth: null });

    return json({ error: "Consultation records could not be loaded." }, 503);
  }
}

export async function POST(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  if (access.role === "viewer")
    return json(
      { error: "Your role cannot change consultation records." },
      403,
    );
  const parsed = await parseJsonRequest(
    request,
    8_000,
    consultationInputSchema.extend({ clientId: z.uuid() }),
    {
      tooLarge: "This consultation record is too large.",
      invalidJson: "Enter valid consultation details.",
      invalidData: "Check the consultation details and try again.",
    },
  );
  if (!parsed.ok) return parsed.response;
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);
  try {
    const { data, error } = await supabase
      .from("crm_consultations")
      .insert({
        client_id: parsed.data.clientId,
        topic: parsed.data.topic,
        scheduled_at: parsed.data.scheduledAt,
        status: parsed.data.status,
        notes: parsed.data.notes,
      })
      .select("id")
      .single();
    if (error) throw error;
    await publishCrmChanged();
    return json({ id: data.id }, 201);
  } catch {
    return json({ error: "This consultation could not be saved." }, 503);
  }
}

export async function PATCH(request: NextRequest) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access) return json({ error: "Admin access is required." }, 401);
  if (access.role === "viewer")
    return json(
      { error: "Your role cannot change consultation records." },
      403,
    );
  const parsed = await parseJsonRequest(
    request,
    2_000,
    z
      .object({
        id: z.uuid(),
        source: z.enum(["request", "manual"]),
        status: consultationStatusSchema.shape.status,
      })
      .superRefine((value, context) => {
        const validManual = ["booked", "completed", "cancelled"].includes(
          value.status,
        );
        const validRequest = [
          "pending",
          "confirmed",
          "completed",
          "cancelled",
        ].includes(value.status);
        if (value.source === "manual" ? !validManual : !validRequest) {
          context.addIssue({
            code: "custom",
            path: ["status"],
            message: "Choose a valid consultation status.",
          });
        }
      }),
    {
      tooLarge: "Invalid status update.",
      invalidJson: "Enter a valid status update.",
      invalidData: "Choose a valid consultation status.",
    },
  );
  if (!parsed.ok) return parsed.response;
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return json({ error: "The admin data service is unavailable." }, 503);
  try {
    const table =
      parsed.data.source === "request"
        ? "bookings"
        : "crm_consultations";
    // Update the status
const { error } = await supabase
  .from(table)
  .update(
    parsed.data.source === "request"
      ? { booking_status: parsed.data.status }
      : { status: parsed.data.status }
  )
  .eq(
    parsed.data.source === "request"
      ? "booking_id"
      : "id",
    parsed.data.id,
  );

if (error) throw error;

// STEP 2: Only create/link client if booking isn't already linked
if (
  parsed.data.source === "request" &&
  parsed.data.status === "confirmed"
) {
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_id", parsed.data.id)
    .single();

  if (bookingError) throw bookingError;

  if (!booking.client_id) {
    console.log("Booking has no linked client. Will create CRM client...");
  } else {
    console.log("Booking already linked to client:", booking.client_id);
  }
}
    if (error) throw error;
    await publishCrmChanged();
    return json({ saved: true });
  } catch {
    return json(
      { error: "The consultation status could not be updated." },
      503,
    );
  }
}
