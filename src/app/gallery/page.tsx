import type { Metadata } from "next";
import { GalleryGrid } from "@/components/media/gallery-grid";
import { getPublishedGalleryMedia } from "@/lib/media/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery | In-room massage Chiang Mai",
  description: "Videos and photos of RoomSpa treatments for hotels, condos, and homes in Chiang Mai.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const items = await getPublishedGalleryMedia();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Gallery</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        See our treatments
      </h1>
      <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
        A closer look at the massages we bring to your room.
      </p>

      {items.length === 0 ? (
        <p className="mt-12 text-sm text-muted">New videos coming soon.</p>
      ) : (
        <GalleryGrid items={items} />
      )}
    </section>
  );
}
