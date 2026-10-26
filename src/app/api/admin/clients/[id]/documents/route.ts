import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAdminAccess } from "@/lib/server/admin-auth";
import { publishCrmChanged } from "@/lib/server/crm-realtime";
import { sameOriginError } from "@/lib/server/request-security";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function matchesSignature(type: string, bytes: Uint8Array) {
  if (type === "application/pdf")
    return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (type.includes("spreadsheetml") || type === "application/vnd.ms-excel") {
    return (
      (bytes[0] === 0x50 && bytes[1] === 0x4b) ||
      (bytes[0] === 0xd0 && bytes[1] === 0xcf)
    );
  }
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  if (type === "image/webp")
    return (
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const access = await getAdminAccess();
  if (!access)
    return NextResponse.json(
      { error: "Admin access is required." },
      { status: 401 },
    );
  if (access.role === "viewer")
    return NextResponse.json(
      { error: "Your role cannot change client records." },
      { status: 403 },
    );
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const supabase = createSupabaseAdminClient();
  if (!supabase)
    return NextResponse.json(
      { error: "The admin data service is unavailable." },
      { status: 503 },
    );
  let storagePath = "";
  try {
    const form = await request.formData();
    const entry = form.get("file");
    if (
      !(entry instanceof File) ||
      entry.size < 1 ||
      entry.size > MAX_FILE_SIZE ||
      !allowedTypes.has(entry.type)
    ) {
      return NextResponse.json(
        { error: "Choose a PDF, Excel file or image up to 10 MB." },
        { status: 400 },
      );
    }
    const bytes = new Uint8Array(await entry.arrayBuffer());
    if (!matchesSignature(entry.type, bytes))
      return NextResponse.json(
        { error: "The file contents do not match the selected file type." },
        { status: 400 },
      );
    const safeName =
      entry.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 200) ||
      "document";
    storagePath = `${id}/${randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("crm-client-documents")
      .upload(storagePath, bytes, {
        contentType: entry.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) throw uploadError;
    const { data, error } = await supabase
      .from("crm_client_documents")
      .insert({
        client_id: id,
        uploaded_by: access.userId,
        storage_path: storagePath,
        file_name: safeName,
        mime_type: entry.type,
        file_size: entry.size,
      })
      .select("id,file_name,mime_type,file_size,created_at")
      .single();
    if (error) throw error;
    await publishCrmChanged();
    return NextResponse.json(
      { document: data },
      {
        status: 201,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      },
    );
  } catch {
    if (storagePath)
      await supabase.storage.from("crm-client-documents").remove([storagePath]);
    return NextResponse.json(
      { error: "The document could not be uploaded." },
      { status: 503 },
    );
  }
}
