import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  processServiceImage,
  validateServiceImageFile,
  type ServiceImageTier,
} from "@/lib/media/process-service-image";

export const runtime = "nodejs";
export const maxDuration = 60;

function sanitizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return /^[a-z0-9]{1,8}$/.test(extension) ? extension : "img";
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read upload." }, { status: 400 });
  }

  const file = form.get("file");
  const slug = sanitizeSlug(String(form.get("slug") || ""));
  const tierRaw = String(form.get("tier") || "wellness");
  const tier: ServiceImageTier = tierRaw === "signature" ? "signature" : "wellness";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: "Service slug is required before uploading." }, { status: 400 });
  }

  const validationError = validateServiceImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  let processed: Awaited<ReturnType<typeof processServiceImage>>;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    processed = await processServiceImage(bytes, tier);
  } catch (processingError) {
    const reason = processingError instanceof Error ? processingError.message.toLowerCase() : "";
    const formatHint =
      reason.includes("unsupported") || reason.includes("input buffer")
        ? " This format could not be decoded; try JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG, or HEIC."
        : "";

    // Keep valid image uploads usable even when a particular format cannot be
    // smart-cropped by sharp. The public cards already use object-cover, so
    // the original can still render without blocking the admin workflow.
    const originalPath = `service-heroes/${slug}/original-${Date.now()}.${safeExtension(file)}`;
    const { error: originalUploadError } = await supabase.storage
      .from("media-library")
      .upload(originalPath, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });
    if (!originalUploadError) {
      const originalUrl = supabase.storage.from("media-library").getPublicUrl(originalPath).data.publicUrl;
      return NextResponse.json({
        url: `${originalUrl}?v=${Date.now()}`,
        heroUrl: `${originalUrl}?v=${Date.now()}`,
        imageFit: "cover" as const,
        fallbackOriginal: true,
      });
    }

    return NextResponse.json(
      { error: `Could not process this image.${formatHint} Make sure it is a valid image under 20 MB.` },
      { status: 400 },
    );
  }

  const cardPath = `service-heroes/${slug}/card.jpg`;
  const heroPath = `service-heroes/${slug}/hero.jpg`;

  const [cardUpload, heroUpload] = await Promise.all([
    supabase.storage.from("media-library").upload(cardPath, processed.card.buffer, {
      contentType: processed.contentType,
      upsert: true,
    }),
    supabase.storage.from("media-library").upload(heroPath, processed.hero.buffer, {
      contentType: processed.contentType,
      upsert: true,
    }),
  ]);

  const uploadError = cardUpload.error || heroUpload.error;
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

  const bucket = supabase.storage.from("media-library");
  const cardUrl = bucket.getPublicUrl(cardPath).data.publicUrl;
  const heroUrl = bucket.getPublicUrl(heroPath).data.publicUrl;
  const cacheBust = `?v=${Date.now()}`;

  return NextResponse.json({
    url: `${cardUrl}${cacheBust}`,
    heroUrl: `${heroUrl}${cacheBust}`,
    cardPath,
    heroPath,
    width: processed.card.width,
    height: processed.card.height,
    imageFit: "cover" as const,
  });
}
