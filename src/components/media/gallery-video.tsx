"use client";

import { useEffect, useRef } from "react";
import { useGalleryPlayback } from "@/components/media/gallery-playback";

type Props = {
  id: string;
  src: string;
  poster?: string;
  label?: string;
  /** Start this clip when the gallery loads (first video only). */
  autoplay?: boolean;
  className?: string;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72L19 12 8 5.14Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" />
    </svg>
  );
}

/**
 * Gallery video with exclusive playback: only one clip plays at a time.
 * First video can autoplay; others wait for play/pause control.
 */
export function GalleryVideo({
  id,
  src,
  poster = "",
  label,
  autoplay = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const { playingId, play, toggle } = useGalleryPlayback();
  const isPlaying = playingId === id;
  const didAutoplay = useRef(false);

  useEffect(() => {
    if (!autoplay || didAutoplay.current) return;
    didAutoplay.current = true;
    play(id);
  }, [autoplay, id, play]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isPlaying) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [isPlaying, src]);

  return (
    <div className={`relative aspect-video overflow-hidden bg-surface ${className}`}>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster={poster || undefined}
        muted
        loop
        playsInline
        preload={autoplay ? "auto" : "metadata"}
        aria-label={label}
      >
        <source src={src} type="video/mp4" />
      </video>

      {!isPlaying ? (
        <button
          type="button"
          onClick={() => play(id)}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
          aria-label={`Play ${label || "video"}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow-sm">
            <PlayIcon />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => toggle(id)}
          className="absolute bottom-3 left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/70"
          aria-label={`Pause ${label || "video"}`}
        >
          <PauseIcon />
        </button>
      )}
    </div>
  );
}
