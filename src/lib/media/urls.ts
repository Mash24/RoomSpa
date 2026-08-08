export type MediaSourceKind =
  | "direct-video"
  | "direct-image"
  | "youtube"
  | "vimeo"
  | "x"
  | "external";

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)(\?|$)/i;

function isXHost(host: string) {
  return host === "x.com" || host === "twitter.com" || host === "mobile.twitter.com" || host === "mobile.x.com";
}

export function classifyMediaUrl(url: string, declaredKind?: "image" | "video"): MediaSourceKind {
  const trimmed = url.trim();
  if (!trimmed) return declaredKind === "image" ? "direct-image" : "external";

  try {
    const parsed = new URL(trimmed, "https://example.com");
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname;

    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("vimeo.com")) return "vimeo";
    if (isXHost(host) && /\/status(?:es)?\/\d+/i.test(path)) return "x";
    if (VIDEO_EXT.test(path) || VIDEO_EXT.test(trimmed)) return "direct-video";
    if (IMAGE_EXT.test(path) || IMAGE_EXT.test(trimmed)) return "direct-image";
    if (declaredKind === "image") return "direct-image";
    if (declaredKind === "video" && trimmed.startsWith("/") && VIDEO_EXT.test(trimmed)) {
      return "direct-video";
    }
    return "external";
  } catch {
    if (VIDEO_EXT.test(trimmed)) return "direct-video";
    if (IMAGE_EXT.test(trimmed)) return "direct-image";
    return declaredKind === "image" ? "direct-image" : "external";
  }
}

/** Status ID from an X/Twitter post URL. */
export function extractXStatusId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!isXHost(host)) return null;
    return parsed.pathname.match(/\/status(?:es)?\/(\d+)/i)?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Candidate URLs to try with X oEmbed / widgets.
 * Username paths embed more reliably than `/i/status/{id}` alone.
 */
export function xStatusUrlCandidates(url: string): string[] {
  const id = extractXStatusId(url);
  if (!id) return [];

  const candidates: string[] = [];
  const trimmed = url.trim();
  candidates.push(trimmed);

  try {
    const parsed = new URL(trimmed);
    const user = parsed.pathname.match(/^\/([^/]+)\/status/i)?.[1];
    if (user && user !== "i") {
      candidates.push(`https://twitter.com/${user}/status/${id}`);
      candidates.push(`https://x.com/${user}/status/${id}`);
    }
  } catch {
    // ignore
  }

  candidates.push(`https://twitter.com/i/status/${id}`);
  candidates.push(`https://x.com/i/status/${id}`);

  return [...new Set(candidates)];
}

/** Official Tweet iframe embed by status ID. */
export function xTweetEmbedSrc(url: string): string | null {
  const id = extractXStatusId(url);
  if (!id) return null;
  return `https://platform.twitter.com/embed/Tweet.html?${new URLSearchParams({
    id,
    lang: "en",
    theme: "light",
    dnt: "true",
  }).toString()}`;
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const short = parsed.pathname.match(/\/shorts\/([^/]+)/)?.[1];
      if (short) return `https://www.youtube.com/embed/${short}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function vimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  } catch {
    return null;
  }
}

export function isHttpUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}
