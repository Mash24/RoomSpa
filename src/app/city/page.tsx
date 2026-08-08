import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { cities } from "@/content/cities";
import { whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Locations | In-room massage Thailand",
  description:
    "RoomSpa mobile massage by location — live in Chiang Mai. Bangkok and Phuket coming soon.",
  path: "/city",
});

export default function CitiesIndexPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/city" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Locations" }]} />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">Locations</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Where we come to you
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Live booking in Chiang Mai. Bangkok and Phuket are next.
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {cities.map((city) => (
          <li key={city.slug} className="py-5">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-2xl text-foreground">{city.name}</h2>
              <span className="text-xs uppercase tracking-[0.14em] text-muted">
                {city.status === "active" ? "Live" : "Soon"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{city.summary}</p>
            <Link
              href={`/city/${city.slug}`}
              className="mt-3 inline-flex text-sm font-medium text-accent"
            >
              {city.status === "active" ? `View ${city.name}` : `See plans`} →
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex text-sm text-accent underline"
      >
        Request a city on WhatsApp
      </a>
    </section>
  );
}
