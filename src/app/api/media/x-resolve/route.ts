import { NextResponse } from "next/server";
import { extractXStatusId } from "@/lib/media/urls";

export const dynamic = "force-dynamic";

type FxVideo = {
  type?: string;
  url?: string;
  thumbnail_url?: string;
  formats?: Array<{
    url?: string;
    bitrate?: number;
    container?: string;
  }>;
};

type FxMedia = {
  videos?: FxVideo[];
  photos?: Array<{ url?: string }>;
  all?: Array<FxVideo & { type?: string; url?: string }>;
};

function pickBestMp4(video: FxVideo): string | null {
  const formats = (video.formats ?? []).filter(
    (f) => f.url && (f.container === "mp4" || /\.mp4(\?|$)/i.test(f.url)),
  );
  if (formats.length) {
    // Prefer ~720p–1080p; avoid huge 4K when possible.
    const sorted = [...formats].sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
    const mid = sorted.find((f) => (f.bitrate ?? 0) > 0 && (f.bitrate ?? 0) <= 3_000_000);
    return (mid ?? sorted[0])?.url ?? null;
  }
  return video.url && /\.mp4(\?|$)/i.test(video.url) ? video.url : video.url ?? null;
}

function extractFromMedia(media: FxMedia | null | undefined) {
  if (!media) return { videoUrl: null as string | null, posterUrl: null as string | null, photoUrls: [] as string[] };

  const videos = [
    ...(media.videos ?? []),
    ...(media.all ?? []).filter((item) => item.type === "video" || item.type === "gif"),
  ];

  let videoUrl: string | null = null;
  let posterUrl: string | null = null;
  for (const video of videos) {
    const url = pickBestMp4(video);
    if (url) {
      videoUrl = url;
      posterUrl = video.thumbnail_url ?? null;
      break;
    }
  }

  const photoUrls = [
    ...(media.photos ?? []).map((p) => p.url).filter(Boolean),
    ...(media.all ?? []).filter((item) => item.type === "photo").map((p) => p.url).filter(Boolean),
  ] as string[];

  return { videoUrl, posterUrl, photoUrls: [...new Set(photoUrls)] };
}

/**
 * Resolve an X/Twitter status to a playable MP4 (and poster).
 * Official X embeds often show "Not found" for sensitive/adult posts;
 * FxEmbed still returns the underlying media URLs.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const statusId = extractXStatusId(raw);
  if (!statusId) {
    return NextResponse.json({ error: "Not an X/Twitter status URL." }, { status: 400 });
  }

  const endpoints = [
    `https://api.fxtwitter.com/status/${statusId}`,
    `https://api.fxtwitter.com/2/status/${statusId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: "application/json", "User-Agent": "RoomSpaGallery/1.0" },
        next: { revalidate: 1800 },
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        code?: number;
        tweet?: { media?: FxMedia; possibly_sensitive?: boolean };
        status?: { media?: FxMedia; possibly_sensitive?: boolean };
      };

      if (data.code && data.code >= 400) continue;

      const media = data.tweet?.media ?? data.status?.media;
      const extracted = extractFromMedia(media);
      if (!extracted.videoUrl && extracted.photoUrls.length === 0) continue;

      return NextResponse.json({
        statusId,
        videoUrl: extracted.videoUrl,
        posterUrl: extracted.posterUrl,
        photoUrls: extracted.photoUrls,
      });
    } catch {
      // try next endpoint
    }
  }

  return NextResponse.json(
    { error: "Could not load media from this X post. It may be private or deleted." },
    { status: 404 },
  );
}
