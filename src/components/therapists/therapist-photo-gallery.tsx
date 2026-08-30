"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PublicTherapistMedia } from "@/lib/therapists/types";

type Props = {
  photos: PublicTherapistMedia[];
  displayName: string;
  dark?: boolean;
};

export function TherapistPhotoGallery({ photos, displayName, dark = false }: Props) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos.length) {
    return (
      <div className={`flex aspect-[3/4] items-center justify-center rounded-sm text-sm ${
        dark ? "bg-[#161311] text-[#f5f0e8]/60 ring-1 ring-[#c9a86c]/20" : "bg-surface text-muted ring-1 ring-border"
      }`}>
        Photos coming soon
      </div>
    );
  }

  function showPhoto(index: number) {
    const nextIndex = Math.max(0, Math.min(index, photos.length - 1));
    const slide = scrollerRef.current?.children[nextIndex] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(nextIndex);
  }

  return (
    <div>
      <div className="group relative">
        <ul
          ref={scrollerRef}
          onScroll={(event) => {
            const width = event.currentTarget.clientWidth;
            if (!width) return;
            const nextIndex = Math.round(event.currentTarget.scrollLeft / width);
            if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
          }}
          aria-label={`${displayName} photos`}
          className={`scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-sm ${
            dark ? "bg-[#161311] ring-1 ring-[#c9a86c]/20" : "bg-surface ring-1 ring-border"
          }`}
        >
          {photos.map((photo, index) => (
            <li key={photo.id} className="relative w-full shrink-0 snap-center aspect-[3/4] bg-[#0c0a09]">
              <Image
                src={photo.url}
                alt={photo.altText || `${displayName} — photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-contain"
                priority={index === 0}
              />
            </li>
          ))}
        </ul>

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => showPhoto(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/55 px-3 py-2 text-lg text-white transition hover:bg-black/75 disabled:opacity-0 sm:block"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => showPhoto(activeIndex + 1)}
              disabled={activeIndex === photos.length - 1}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/55 px-3 py-2 text-lg text-white transition hover:bg-black/75 disabled:opacity-0 sm:block"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 gap-1.5" aria-label="Choose photo">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => showPhoto(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? `w-7 ${dark ? "bg-[#c9a86c]" : "bg-accent"}`
                    : `w-1.5 ${dark ? "bg-[#f5f0e8]/35" : "bg-border"}`
                }`}
              />
            ))}
          </div>
          <span className={`shrink-0 text-xs ${dark ? "text-[#f5f0e8]/60" : "text-muted"}`}>
            {activeIndex + 1} / {photos.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}
