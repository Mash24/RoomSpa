import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinks } from "@/components/seo/related-links";
import { ReviewSnapshot } from "@/components/seo/review-snapshot";
import { BreadcrumbJsonLd, FaqJsonLd, JsonLd } from "@/components/seo/json-ld";
import { cities, getCity } from "@/content/cities";
import { faqItems } from "@/content/pages";
import { catalogServices, productPriceLabel } from "@/content/services";
import { site, whatsappHref } from "@/content/site";
import { aggregateRating, getApprovedReviews } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";
import {
  averagePriceLabel,
  priceRangeLabel,
  relatedBlogLinks,
  topServicesForCity,
} from "@/lib/seo/locations";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ city: string }>;
};

export const dynamic = "force-dynamic";

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

  const live = city.status === "active";
  const topServices = topServicesForCity(8);
  const allBookable = catalogServices.filter((s) => s.bookable);
  const reviews = await getApprovedReviews(8);
  const aggregate = aggregateRating(reviews);
  const teaser = live ? await getTodayAvailabilityTeaser() : null;
  const blogs = relatedBlogLinks([city.name, "hotel", "massage", "Chiang Mai"], 4);
  const localFaqs = [
    {
      question: `Do you offer in-room massage in ${city.name}?`,
      answer: live
        ? `Yes. RoomSpa books mobile massage across ${city.neighborhoods.map((n) => n.name).join(", ")}.`
        : `Not yet live — ${city.name} is on our roadmap. Join the WhatsApp waitlist or book Chiang Mai today.`,
    },
    ...faqItems.slice(0, 4),
  ];

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Cities", path: "/city" },
          { name: city.name, path: `/city/${city.slug}` },
        ]}
      />
      <FaqJsonLd faqs={localFaqs} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `In-room massage in ${city.name}`,
          description: city.summary,
          provider: { "@type": "Organization", name: site.name, url: site.url },
          areaServed: city.name,
          url: `${site.url}/city/${city.slug}`,
          ...(aggregate
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: aggregate.ratingValue,
                  reviewCount: aggregate.reviewCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
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

      {teaser ? (
        <div className="mt-8">
          <AvailabilityBanner teaser={teaser} />
        </div>
      ) : null}

      {live ? (
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="border border-border bg-surface-elevated p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Price range</p>
            <p className="mt-2 font-display text-xl text-accent">{priceRangeLabel(allBookable)}</p>
          </div>
          <div className="border border-border bg-surface-elevated p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Typical average</p>
            <p className="mt-2 font-display text-xl text-foreground">{averagePriceLabel(allBookable)}</p>
          </div>
          <div className="border border-border bg-surface-elevated p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Neighborhoods</p>
            <p className="mt-2 font-display text-xl text-foreground">{city.neighborhoods.length}</p>
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight text-foreground">Popular neighborhoods</h2>
        <ul className="mt-6 space-y-4">
          {city.neighborhoods.map((area) => (
            <li key={area.slug} className="border border-border bg-surface-elevated p-5">
              <h3 className="font-display text-xl text-foreground">{area.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{area.summary}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link href={`/city/${city.slug}/${area.slug}`} className="font-medium text-accent">
                  {area.name} guide
                </Link>
                {live ? (
                  <Link href={`/services/thai/${area.slug}`} className="text-muted hover:text-accent">
                    Thai massage here
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {live ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight text-foreground">
            Top searched services in {city.name}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {topServices.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}/${city.slug}`}
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

      {live ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight text-foreground">
            Hotels & stays we often visit
          </h2>
          <p className="mt-3 text-sm text-muted">
            Examples of areas guests book from — not an exclusive partnership list. Tell us your hotel
            name when you book.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {(city.slug === "chiang-mai"
              ? [
                  "Anantara Chiang Mai",
                  "Shangri-La Chiang Mai",
                  "U Nimman Chiang Mai",
                  "Eastin Tan Hotel",
                  "Tamarind Village",
                  "Old City boutique hotels & Nimman condos",
                ]
              : []
            ).map((hotel) => (
              <li key={hotel}>{hotel}</li>
            ))}
          </ul>
          <div className="mt-6 aspect-[16/9] overflow-hidden border border-border bg-surface">
            <iframe
              title={`Map of ${city.name}`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${city.name}, Thailand`)}&z=12&output=embed`}
            />
          </div>
        </section>
      ) : null}

      <div className="mt-10">
        <ReviewSnapshot reviews={reviews} heading={`${city.name} guest reviews`} />
      </div>

      <section className="mt-12 border-t border-border pt-10">
        <h2 className="font-display text-3xl tracking-tight text-foreground">FAQ</h2>
        <dl className="mt-6 space-y-6">
          {localFaqs.map((item) => (
            <div key={item.question}>
              <dt className="font-display text-xl text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedLinks
        title="Guides"
        links={blogs.map((post) => ({ href: `/blog/${post.slug}`, label: post.title }))}
      />

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
