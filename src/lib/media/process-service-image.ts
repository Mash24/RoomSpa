export type ServiceImageTier = "signature" | "wellness";

/**
 * Target frames match public card aspects:
 * - Signature cards: 3:4 (portrait)
 * - Wellness cards: 4:3 (landscape)
 */
const FRAMES: Record<ServiceImageTier, { width: number; height: number }> = {
  signature: { width: 1200, height: 1600 },
  wellness: { width: 1200, height: 900 },
};

/** Detail hero — 16:10, used on service detail pages (desktop). */
const HERO_FRAME = { width: 1600, height: 1000 };

const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export function validateServiceImageFile(file: File) {
  if (!file.type.startsWith("image/") && !ALLOWED_MIME.has(file.type)) {
    return "Only image files are supported (JPEG, PNG, WebP, GIF, AVIF).";
  }
  if (file.size > MAX_INPUT_BYTES) {
    return "Images must be 20 MB or smaller.";
  }
  return null;
}

async function cropToFrame(input: Buffer, width: number, height: number) {
  // Load sharp only when an authenticated upload actually needs processing.
  // A top-level native import can crash the whole Vercel function during
  // initialization before the route has a chance to return JSON.
  const { default: sharp } = await import("sharp");
  return sharp(input)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position: "attention",
    })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

export type ProcessedServiceImages = {
  card: { buffer: Buffer; width: number; height: number };
  hero: { buffer: Buffer; width: number; height: number };
  contentType: string;
};

/**
 * Normalizes any upload to tier-sized JPEGs:
 * - auto-rotates from EXIF
 * - smart-crops (cover + attention) to card and hero aspects
 * - scales down oversized sources; upscales tiny uploads so frames always fill
 */
export async function processServiceImage(
  input: Buffer,
  tier: ServiceImageTier,
): Promise<ProcessedServiceImages> {
  const frame = FRAMES[tier];

  const [cardBuffer, heroBuffer] = await Promise.all([
    cropToFrame(input, frame.width, frame.height),
    cropToFrame(input, HERO_FRAME.width, HERO_FRAME.height),
  ]);

  return {
    card: { buffer: cardBuffer, width: frame.width, height: frame.height },
    hero: { buffer: heroBuffer, width: HERO_FRAME.width, height: HERO_FRAME.height },
    contentType: "image/jpeg",
  };
}
