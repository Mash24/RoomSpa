import type { Metadata } from "next";
import Link from "next/link";
import { MediaEmbed } from "@/components/media/media-embed";
import { classifyMediaUrl } from "@/lib/media/urls";
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
        <ul className="mt-10 grid gap-10 sm:grid-cols-2">
          {items.map((item) => {
            const serviceName = item.serviceNames[0] || "RoomSpa";
            const primarySlug = item.serviceSlugs[0];
            const source = classifyMediaUrl(item.mediaUrl, item.kind);
            // X / YouTube / Vimeo embeds already carry their own captions — don't repeat CMS title.
            const showCaption = source === "direct-video" || source === "direct-image";

            return (
              <li key={item.id} className="min-w-0">
                {primarySlug ? (
                  <Link
                    href={`/services/${primarySlug}`}
                    className="text-xs font-medium uppercase tracking-[0.16em] text-accent transition hover:opacity-80"
                  >
                    {serviceName}
                  </Link>
                ) : (
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
                    {serviceName}
                  </p>
                )}
                <div className="mt-3">
                  <MediaEmbed
                    url={item.mediaUrl}
                    kind={item.kind}
                    title={item.title}
                    description={item.description}
                    thumbnailUrl={item.thumbnailUrl}
                  />
                </div>
                {showCaption && item.title ? (
                  <p className="mt-3 font-display text-xl tracking-tight text-foreground">
                    {item.title}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
