import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

/** Upload a file to Supabase Storage bucket `media-library` and return a public URL. */
export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
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
