import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { cities } from "@/content/cities";
import { whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Cities we serve | In-room massage Thailand",
  description:
    "RoomSpa mobile massage by city — live in Chiang Mai (Old City, Nimman, Airport). Bangkok and Phuket coming soon.",
  path: "/city",
});

export default function CitiesIndexPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Cities", path: "/city" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cities" }]} />

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-accent">Coverage</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Cities we serve
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Start with Chiang Mai — hotel, condo, and home massage with live booking. Bangkok and Phuket
        are next on the roadmap.
      </p>

      <ul className="mt-12 space-y-4">
        {cities.map((city) => (
          <li key={city.slug} className="border border-border bg-surface-elevated p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl text-foreground">{city.name}</h2>
              <span className="text-xs uppercase tracking-[0.14em] text-muted">
                {city.status === "active" ? "Live booking" : "Coming soon"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{city.summary}</p>
            <Link
              href={`/city/${city.slug}`}
              className="mt-5 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
            >
              {city.status === "active" ? `Explore ${city.name}` : `View ${city.name} plans`}
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="mt-10 inline-flex text-sm text-accent underline"
      >
        Request a city on WhatsApp
      </a>
    </section>
  );
}
