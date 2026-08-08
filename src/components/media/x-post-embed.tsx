"use client";

import { useEffect, useState } from "react";
import { AutoplayVideo } from "@/components/media/autoplay-video";
import { extractXStatusId } from "@/lib/media/urls";

type Resolved = {
  videoUrl: string | null;
  posterUrl: string | null;
  photoUrls: string[];
};

type Props = {
  url: string;
  title: string;
  className?: string;
};

/**
 * Play X/Twitter post media on-site.
 * Uses FxEmbed-resolved MP4s instead of official widgets — those often show
 * "Not found" for sensitive/adult posts that RoomSpa links.
 */
export function XPostEmbed({ url, title, className = "" }: Props) {
  const statusId = extractXStatusId(url);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!statusId) {
      setError(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`/api/media/x-resolve?url=${encodeURIComponent(url)}`);
        const data = (await res.json()) as Resolved & { error?: string };
        if (cancelled) return;

        if (!res.ok || (!data.videoUrl && !(data.photoUrls?.length > 0))) {
          setError(true);
          return;
        }

        setResolved({
          videoUrl: data.videoUrl ?? null,
          posterUrl: data.posterUrl ?? null,
          photoUrls: data.photoUrls ?? [],
        });
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, statusId]);

  if (!statusId || error) {
    return (
      <div className={`rounded-sm border border-border bg-surface px-4 py-8 text-sm text-muted ${className}`}>
        <p>This X video couldn’t be loaded here.</p>
        <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-medium text-accent">
          Open on X →
        </a>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div
        className={`flex min-h-[280px] items-center justify-center rounded-sm border border-border bg-surface text-sm text-muted ${className}`}
      >
        Loading video…
      </div>
    );
  }

  if (resolved.videoUrl) {
    return (
      <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
        <AutoplayVideo
          src={resolved.videoUrl}
          poster={resolved.posterUrl || ""}
          label={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  if (resolved.photoUrls[0]) {
    return (
      <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolved.photoUrls[0]}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`rounded-sm border border-border bg-surface px-4 py-8 text-sm text-muted ${className}`}>
      <p>No playable video on this post.</p>
      <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-medium text-accent">
        Open on X →
      </a>
    </div>
  );
}
