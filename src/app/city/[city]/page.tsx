import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ReviewSnapshot } from "@/components/seo/review-snapshot";
import { BreadcrumbJsonLd, FaqJsonLd, JsonLd } from "@/components/seo/json-ld";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { cities, cityStatusLabel, getCity } from "@/content/cities";
import { faqItems } from "@/content/pages";
import { productPriceLabel } from "@/content/services";
import { site } from "@/content/site";
import {
  getPublicSignatureServices,
  getPublicWellnessServices,
} from "@/lib/catalog/public";
import { getServicePath } from "@/lib/catalog/service-paths";
import { aggregateRating, getApprovedReviews } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";
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
  const enquiries = city.status === "enquiries";
  const [wellnessPicks, signaturePicks] = await Promise.all([
    getPublicWellnessServices(4),
    getPublicSignatureServices(4),
  ]);
  const reviews = await getApprovedReviews(4);
  const aggregate = aggregateRating(reviews);
  const teaser = live ? await getTodayAvailabilityTeaser() : null;
  const localFaqs = [
    {
      question: `Do you offer Signature in-room massage in ${city.name}?`,
      answer: live
        ? `Yes. We come to hotels, condos, and homes across ${city.neighborhoods.map((n) => n.name).join(", ")} for Signature Experiences and wellness massage.`
        : enquiries
          ? `We're accepting ${city.name} enquiries now. WhatsApp us with your area and preferred Signature treatment — availability varies while we grow local therapists.`
          : `Coming soon in ${city.name}. WhatsApp us for updates, or book a live city today.`,
    },
    ...faqItems.slice(0, 3),
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/city" },
          { name: city.name, path: `/city/${city.slug}` },
        ]}
      />
      <FaqJsonLd faqs={localFaqs} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Signature in-room massage in ${city.name}`,
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
          { label: "Locations", href: "/city" },
          { label: city.name },
        ]}
      />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {cityStatusLabel(city.status)}
      </p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        {city.headline}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{city.summary}</p>

      {teaser ? (
        <div className="mt-8">
          <AvailabilityBanner teaser={teaser} />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-2.5 xs:flex-row">
        {live ? (
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            Book in {city.name}
          </Link>
        ) : (
          <WhatsAppLink
            cta={`city-${city.slug}`}
            cityHint={city.name}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            {enquiries ? `Enquire for ${city.name}` : "WhatsApp us"}
          </WhatsAppLink>
        )}
        <Link
          href="/services/signature"
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm"
        >
          Signature menu
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
          Neighborhoods
        </h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {city.neighborhoods.map((area) => (
            <li key={area.slug} className="py-4">
              <Link
                href={`/city/${city.slug}/${area.slug}`}
                className="font-medium text-foreground transition hover:text-accent"
              >
                {area.name}
              </Link>
              <p className="mt-1 text-sm text-muted">{area.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      {live ? (
        <section className="mt-12 space-y-10">
          {signaturePicks.length > 0 ? (
            <div>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                  Signature Experiences
                </h2>
                <Link href="/services/signature" className="text-sm text-accent hover:underline">
                  All Signature →
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {signaturePicks.map((service) => (
                  <li key={service.slug} className="flex items-center justify-between gap-4 py-4">
                    <Link
                      href={getServicePath(service)}
                      className="font-medium text-foreground transition hover:text-accent"
                    >
                      {service.name}
                    </Link>
                    <span className="shrink-0 text-sm text-accent">
                      From {productPriceLabel(service.amountThb)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {wellnessPicks.length > 0 ? (
            <div>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                  Wellness Massage
                </h2>
                <Link href="/services/wellness" className="text-sm text-accent hover:underline">
                  All wellness →
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {wellnessPicks.map((service) => (
                  <li key={service.slug} className="flex items-center justify-between gap-4 py-4">
                    <Link
                      href={getServicePath(service)}
                      className="font-medium text-foreground transition hover:text-accent"
                    >
                      {service.name}
                    </Link>
                    <span className="shrink-0 text-sm text-accent">
                      From {productPriceLabel(service.amountThb)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <div className="mt-10">
          <ReviewSnapshot reviews={reviews} heading="Guest reviews" />
        </div>
      ) : null}

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">Questions</h2>
        <dl className="mt-5 space-y-5">
          {localFaqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
