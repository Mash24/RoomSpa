import type { Metadata } from "next";
import Link from "next/link";
import { MediaEmbed } from "@/components/media/media-embed";
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
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        See our treatments
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        A closer look at the massages we bring to your room.
      </p>

      {items.length === 0 ? (
        <p className="mt-12 text-sm text-muted">New videos coming soon.</p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const label =
              item.serviceNames.length > 0 ? item.serviceNames.join(" · ") : "RoomSpa";
            const primarySlug = item.serviceSlugs[0];

            return (
              <li key={item.id} className="min-w-0">
                <MediaEmbed
                  url={item.mediaUrl}
                  kind={item.kind}
                  title={item.title}
                  description={item.description}
                  thumbnailUrl={item.thumbnailUrl}
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
      )}
    </section>
  );
}
