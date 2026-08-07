import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { cities, getCity } from "@/content/cities";
import { catalogServices, productPriceLabel } from "@/content/services";
import { site, whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);
  if (!city) return {};
  return buildPageMetadata({
    title: city.seoTitle,
    description: city.seoDescription,
    path: `/city/${city.slug}`,
  });
}

export default async function CityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);
  if (!city) notFound();

  const featured = catalogServices.filter((s) => s.bookable && s.featured).slice(0, 6);
  const live = city.status === "active";

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Cities", path: "/city" },
          { name: city.name, path: `/city/${city.slug}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `In-room massage in ${city.name}`,
          description: city.summary,
          provider: { "@type": "Organization", name: site.name, url: site.url },
          areaServed: city.name,
          url: `${site.url}/city/${city.slug}`,
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/city" },
          { label: city.name },
        ]}
      />

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {live ? "Live coverage" : "Coming soon"}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {city.headline}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{city.summary}</p>

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight text-foreground">Neighborhoods</h2>
        <ul className="mt-6 space-y-4">
          {city.neighborhoods.map((area) => (
            <li key={area.slug} className="border border-border bg-surface-elevated p-5">
              <h3 className="font-display text-xl text-foreground">{area.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{area.summary}</p>
              <Link
                href={`/city/${city.slug}/${area.slug}`}
                className="mt-4 inline-flex text-sm font-medium text-accent"
              >
                {area.name} massage guide
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {live ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight text-foreground">
            Popular services in {city.name}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {featured.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="block border border-border p-4 transition hover:border-accent"
                >
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="mt-1 text-sm text-accent">{productPriceLabel(service.amountThb)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        {live ? (
          <Link
            href="/book"
            className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            Book in {city.name}
          </Link>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            Join waitlist on WhatsApp
          </a>
        )}
        <Link
          href="/services"
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm transition hover:border-accent hover:text-accent"
        >
          All services
        </Link>
      </div>
    </article>
  );
}
