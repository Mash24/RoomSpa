import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinks } from "@/components/seo/related-links";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { getServiceFaqs } from "@/content/service-faqs";
import { ServiceImage } from "@/components/media/service-image";
import { getCatalogProduct, productPriceLabel } from "@/content/services";
import { site } from "@/content/site";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { getRelatedServicesInTier } from "@/lib/catalog/related";
import { getPublicCatalog, getPublicCatalogProduct } from "@/lib/catalog/public";
import { resolveServiceMedia } from "@/lib/media/resolve-service-media";
import {
  experienceTierLabels,
  getExperienceTier,
  type ExperienceTier,
} from "@/lib/catalog/experience-tier";
import { getServiceLocationPath, getServicePath } from "@/lib/catalog/service-paths";
import { aggregateRating, getApprovedReviews, getApprovedReviewsForService } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";
import { getSeoLocation } from "@/lib/seo/locations";

type Props = {
  slug: string;
  locationSlug: string;
  expectedTier?: ExperienceTier;
};

export async function ServiceLocationContent({ slug, locationSlug, expectedTier }: Props) {
  const catalog = await getPublicCatalog();
  const service = catalog.find((item) => item.slug === slug) ?? getCatalogProduct(slug);
  const location = getSeoLocation(locationSlug);
  if (!service?.bookable || !location) notFound();

  const tier = getExperienceTier(service);
  if (expectedTier && tier !== expectedTier) notFound();

  const servicePath = getServicePath(service);
  const pagePath = getServiceLocationPath(service, location.slug);
  const tierPath = `/services/${tier}`;
  const tierLabel = experienceTierLabels[tier];

  const media = await resolveServiceMedia(service.slug, undefined, service.name);
  const faqs = [
    {
      question: `Can I book ${service.name} ${location.inPhrase}?`,
      answer: location.bookable
        ? `Yes. Choose ${service.name} on the booking form and select coverage for ${location.name}.`
        : `${location.cityName} coverage is coming soon. Book Chiang Mai today, or WhatsApp us to hear when we launch.`,
    },
    ...getServiceFaqs(service.slug).slice(0, 3),
  ];
  const serviceReviews = await getApprovedReviewsForService(service.slug, 4);
  const hasServiceReviews = serviceReviews.length > 0;
  const aggregate = hasServiceReviews
    ? aggregateRating(serviceReviews)
    : aggregateRating(await getApprovedReviews(50));
  const teaser = location.bookable ? await getTodayAvailabilityTeaser() : null;
  const related = getRelatedServicesInTier(catalog, service, 3);
  const bookHref = `/book?service=${service.slug}`;
  const bookLabel = `Book ${service.name}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <ServiceJsonLd
        name={`${service.name} ${location.inPhrase}`}
        description={`${service.details} Available ${location.inPhrase}.`}
        slug={service.slug}
        amountThb={service.amountThb}
        duration={service.duration}
        url={`${site.url}${pagePath}`}
        areaServed={`${location.name}, ${location.cityName}`}
        aggregate={hasServiceReviews ? aggregate : null}
        reviews={hasServiceReviews ? serviceReviews : undefined}
        videoUrl={media.video}
        videoPoster={media.image}
      />
      <FaqJsonLd faqs={faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: tierLabel, path: tierPath },
          { name: service.name, path: servicePath },
          { name: location.name, path: pagePath },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tierLabel, href: tierPath },
          { label: service.name, href: servicePath },
          { label: location.name },
        ]}
      />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {location.bookable ? "Available" : "Coming soon"} · {location.cityName}
      </p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        {service.name} {location.inPhrase}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        {service.summary} {location.summary}
      </p>

      <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-surface">
        <ServiceImage
          media={{ ...media, imageAlt: `${service.name} ${location.inPhrase}` }}
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          variant="hero"
        />
      </div>

      {teaser ? (
        <div className="mt-8">
          <AvailabilityBanner teaser={teaser} bookHref={bookHref} bookLabel={bookLabel} />
        </div>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-muted">{service.details}</p>
      <p className="mt-3 text-sm font-medium text-foreground">
        No taxi. No waiting room. Your therapist comes to you {location.inPhrase}.
      </p>

      <p className="mt-6 text-sm text-muted">From {productPriceLabel(service.amountThb)}</p>

      <div className="mt-8 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap">
        {location.bookable ? (
          <Link
            href={bookHref}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            {bookLabel}
          </Link>
        ) : (
          <WhatsAppLink
            cta="service-location"
            cityHint={`${location.name}, ${location.cityName}`}
            serviceSlug={service.slug}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            WhatsApp us
          </WhatsAppLink>
        )}
        <Link
          href={servicePath}
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm"
        >
          Full details
        </Link>
      </div>
      {location.bookable ? (
        <p className="mt-2 text-xs text-muted">Same-day availability · Instant confirmation</p>
      ) : null}

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">Questions</h2>
        <dl className="mt-5 space-y-5">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length > 0 ? (
        <div className="mt-10">
          <RelatedLinks
            title={
              tier === "signature" ? "More Signature experiences" : "Related wellness services"
            }
            links={related.map((item) => ({
              href: getServicePath(item),
              label: item.name,
            }))}
          />
        </div>
      ) : null}
    </article>
  );
}

export async function buildServiceLocationMetadata(
  slug: string,
  locationSlug: string,
): Promise<Metadata> {
  const service = (await getPublicCatalogProduct(slug)) ?? getCatalogProduct(slug);
  const location = getSeoLocation(locationSlug);
  if (!service || !location) return {};

  const { buildPageMetadata } = await import("@/lib/seo/metadata");
  return buildPageMetadata({
    title: `${service.name} ${location.inPhrase} | In-room massage`,
    description: `Book ${service.name} ${location.inPhrase}. ${location.summary} From ${productPriceLabel(service.amountThb)}.`,
    path: getServiceLocationPath(service, location.slug),
  });
}
