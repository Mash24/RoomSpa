"use client";

import Link from "next/link";
import { GalleryPlaybackProvider } from "@/components/media/gallery-playback";
import { MediaEmbed } from "@/components/media/media-embed";
import { classifyMediaUrl } from "@/lib/media/urls";
import type { PublicMediaItem } from "@/lib/media/public";

function isNativeGalleryVideo(item: PublicMediaItem) {
  if (item.kind === "image") return false;
  const source = classifyMediaUrl(item.mediaUrl, item.kind);
  return source === "direct-video" || source === "x";
}

export function GalleryGrid({ items }: { items: PublicMediaItem[] }) {
  const firstVideoId = items.find(isNativeGalleryVideo)?.id ?? null;

  return (
    <GalleryPlaybackProvider initialPlayingId={firstVideoId}>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const label =
            item.serviceNames.length > 0 ? item.serviceNames.join(" · ") : "RoomSpa";
          const primarySlug = item.serviceSlugs[0];
          const native = isNativeGalleryVideo(item);

          return (
            <li key={item.id} className="min-w-0">
              <MediaEmbed
                url={item.mediaUrl}
                kind={item.kind}
                title={item.title}
                description={item.description}
                thumbnailUrl={item.thumbnailUrl}
                galleryPlayback={
                  native
                    ? {
                        id: item.id,
                        autoplay: item.id === firstVideoId,
                      }
                    : undefined
                }
              />
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-accent">
                {label}
              </p>
              <h2 className="mt-1 font-display text-xl tracking-tight text-foreground">
                {item.title}
              </h2>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-3">
                  {item.description}
                </p>
              ) : null}
              {primarySlug ? (
                <Link
                  href={`/services/${primarySlug}`}
                  className="mt-3 inline-flex text-sm font-medium text-accent"
                >
                  View service →
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </GalleryPlaybackProvider>
  );
}
