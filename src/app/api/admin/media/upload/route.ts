import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

/**
 * Legacy proxy upload — kept as a small-file fallback.
 * Prefer browser → Supabase Storage direct upload from the admin media panel.
 */
export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not read upload body (often because the file is too large for the server). Upload from the admin panel uses direct Storage instead — refresh and try again, or paste an external link.",
      },
      { status: 413 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > 4.5 * 1024 * 1024) {
    return NextResponse.json(
      {
        error:
          "This API path only accepts files under ~4.5 MB. Use the admin panel’s direct Storage upload (or paste a link).",
      },
      { status: 413 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `library/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("media-library").upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json(
      {
        error: uploadError.message.includes("Bucket not found")
          ? "Storage bucket missing. Run supabase/migrations/20260808_cms_services_media.sql"
          : uploadError.message,
      },
      { status: 400 },
    );
  }

  const { data } = supabase.storage.from("media-library").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
