import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { cities, coverageForNeighborhood, getNeighborhood } from "@/content/cities";
import { catalogServices } from "@/content/services";
import { site, whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ city: string; area: string }>;
};

export function generateStaticParams() {
  return cities.flatMap((city) =>
    city.neighborhoods.map((area) => ({ city: city.slug, area: area.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, area: areaSlug } = await params;
  const match = getNeighborhood(citySlug, areaSlug);
  if (!match) return {};
  const { city, area } = match;
  return buildPageMetadata({
    title: `${area.name} massage | In-room ${city.name}`,
    description: `${area.summary} Book RoomSpa mobile massage in ${area.name}, ${city.name}.`,
    path: `/city/${city.slug}/${area.slug}`,
  });
}

export default async function NeighborhoodPage({ params }: PageProps) {
  const { city: citySlug, area: areaSlug } = await params;
  const match = getNeighborhood(citySlug, areaSlug);
  if (!match) notFound();

  const { city, area } = match;
  const coverage = coverageForNeighborhood(area.coverageSlug);
  const live = city.status === "active";
  const picks = catalogServices.filter((s) => s.bookable).slice(0, 8);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/city" },
          { name: city.name, path: `/city/${city.slug}` },
          { name: area.name, path: `/city/${city.slug}/${area.slug}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `In-room massage near ${area.name}`,
          description: area.summary,
          provider: { "@type": "Organization", name: site.name },
          areaServed: `${area.name}, ${city.name}`,
          url: `${site.url}/city/${city.slug}/${area.slug}`,
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Locations", href: "/city" },
          { label: city.name, href: `/city/${city.slug}` },
          { label: area.name },
        ]}
      />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {city.name} · {live ? "Available" : "Soon"}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Massage near {area.name}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{area.summary}</p>

      {coverage ? (
        <p className="mt-4 text-sm text-muted">
          Travel fee:{" "}
          {coverage.travelFeeThb === 0 ? "Included" : `฿${coverage.travelFeeThb}`}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-2.5 xs:flex-row">
        {live ? (
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            Book for {area.name}
          </Link>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            WhatsApp waitlist
          </a>
        )}
        <Link
          href={`/city/${city.slug}`}
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm"
        >
          All {city.name} areas
        </Link>
      </div>

      {live ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Popular services</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {picks.slice(0, 5).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="block py-3.5 text-sm font-medium text-foreground transition hover:text-accent"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
