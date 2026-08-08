"use client";

import {
  classifyMediaUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
} from "@/lib/media/urls";
import { AutoplayVideo } from "@/components/media/autoplay-video";

type Props = {
  url: string;
  kind?: "image" | "video";
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  className?: string;
};

export function MediaEmbed({
  url,
  kind,
  title,
  description,
  thumbnailUrl,
  className = "",
}: Props) {
  const source = classifyMediaUrl(url, kind);

  if (source === "direct-video") {
    return (
      <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
        <AutoplayVideo
          src={url}
          poster={thumbnailUrl || ""}
          label={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  if (source === "youtube") {
    const embed = youtubeEmbedUrl(url);
    if (embed) {
      return (
        <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
          <iframe
            src={embed}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
  }

  if (source === "vimeo") {
    const embed = vimeoEmbedUrl(url);
    if (embed) {
      return (
        <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
          <iframe
            src={embed}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
  }

  if (source === "direct-image") {
    return (
      <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`group relative flex aspect-video flex-col justify-end overflow-hidden bg-surface p-5 transition hover:bg-surface-elevated ${className}`}
    >
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition group-hover:opacity-50"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(70% 60% at 20% 20%, rgba(126,184,164,0.35), transparent 55%), linear-gradient(160deg, #1a2420, #121816)",
          }}
        />
      )}
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.16em] text-white/60">External video</p>
        <p className="mt-2 font-display text-xl text-white">{title}</p>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-white/70">{description}</p>
        ) : null}
        <p className="mt-3 text-sm font-medium text-[#7eb8a4]">Open link →</p>
      </div>
    </a>
  );
}
