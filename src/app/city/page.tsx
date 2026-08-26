import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { cities, cityStatusLabel } from "@/content/cities";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Locations | Signature massage Thailand",
  description:
    "RoomSpa private Signature massage across Thailand — book live cities online; enquire for Bangkok, Phuket, and expanding coverage.",
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
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Where we come to you
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        RoomSpa is built for private Signature Experiences across Thailand. Book online where
        therapists are live. For other cities, WhatsApp us — we&apos;re expanding with real supply,
        not empty pages.
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {cities.map((city) => (
          <li key={city.slug} className="py-5">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-2xl text-foreground">{city.name}</h2>
              <span className="text-xs uppercase tracking-[0.14em] text-muted">
                {cityStatusLabel(city.status)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{city.country}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{city.summary}</p>
            <Link
              href={`/city/${city.slug}`}
              className="mt-3 inline-flex text-sm font-medium text-accent"
            >
              {city.status === "active"
                ? `View ${city.name}`
                : city.status === "enquiries"
                  ? `Enquire for ${city.name}`
                  : `Learn more`}{" "}
              →
            </Link>
          </li>
        ))}
      </ul>

      <WhatsAppLink cta="cities-index" className="mt-8 inline-flex text-sm text-accent underline">
        Ask about another city (including outside Thailand)
      </WhatsAppLink>
    </section>
  );
}
