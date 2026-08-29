import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { processServiceImage, validateServiceImageFile } from "@/lib/media/process-service-image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Could not read upload." }, { status: 400 });
  }

  const file = form.get("file");
  const slug = String(form.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  const index = Number(form.get("index") ?? Date.now());

  if (!(file instanceof File) || !slug) {
    return NextResponse.json({ error: "File and therapist slug required." }, { status: 400 });
  }

  const validationError = validateServiceImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    const processed = await processServiceImage(Buffer.from(await file.arrayBuffer()), "signature");
    buffer = processed.card.buffer;
  } catch (processingError) {
    const reason = processingError instanceof Error ? processingError.message.toLowerCase() : "";
    const formatHint =
      reason.includes("unsupported") || reason.includes("input buffer")
        ? " This format could not be decoded; try JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG, or HEIC."
        : "";
    return NextResponse.json(
      { error: `Could not process image.${formatHint} Make sure it is valid and under 20 MB.` },
      { status: 400 },
    );
  }

  const path = `therapist-photos/${slug}/${index}.jpg`;
  const { error: uploadError } = await supabase.storage.from("media-library").upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const url = supabase.storage.from("media-library").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ url: `${url}?v=${Date.now()}`, path });
}
