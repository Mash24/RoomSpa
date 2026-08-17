import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinks } from "@/components/seo/related-links";
import { ReviewSnapshot } from "@/components/seo/review-snapshot";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/json-ld";
import { MediaEmbed } from "@/components/media/media-embed";
import { getServiceFaqs } from "@/content/service-faqs";
import { ServiceImage } from "@/components/media/service-image";
import { SensualServiceDetail } from "@/components/sensual/sensual-service-detail";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import {
  getServicePriceTiers,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { TherapistStrip } from "@/components/therapists/therapist-strip";
import { getTherapistsForService } from "@/lib/therapists/public";
import {
  experienceTierLabels,
  getExperienceTier,
  type ExperienceTier,
} from "@/lib/catalog/experience-tier";
import { getServicePath } from "@/lib/catalog/service-paths";
import { getRelatedServicesInTier } from "@/lib/catalog/related";
import { getPublicCatalog } from "@/lib/catalog/public";
import { getPublishedMediaForServiceSlug } from "@/lib/media/public";
import { resolveServiceMedia } from "@/lib/media/resolve-service-media";
import { aggregateRating, getApprovedReviews, getApprovedReviewsForService } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";

type Props = {
  slug: string;
  expectedTier?: ExperienceTier;
};

export async function ServiceDetailContent({ slug, expectedTier }: Props) {
  const catalog = await getPublicCatalog();
  const service = catalog.find((item) => item.slug === slug);
  if (!service || !service.bookable) notFound();

  const tier = getExperienceTier(service);
  if (expectedTier && tier !== expectedTier) notFound();

  const servicePath = getServicePath(service);
  const tierPath = `/services/${tier}`;
  const tierLabel = experienceTierLabels[tier];

  const media = await resolveServiceMedia(service.slug, undefined, service.name);
  const libraryMedia = await getPublishedMediaForServiceSlug(service.slug);
  const category = serviceCategories.find((item) => item.id === service.category);
  const faqs = getServiceFaqs(service.slug).slice(0, 5);
  const serviceReviews = await getApprovedReviewsForService(service.slug, 6);
  const hasServiceReviews = serviceReviews.length > 0;
  const generalReviews = hasServiceReviews ? [] : await getApprovedReviews(4);
  const displayReviews = hasServiceReviews ? serviceReviews : generalReviews;
  const overallReviews = hasServiceReviews ? serviceReviews : await getApprovedReviews(50);
  const aggregate = aggregateRating(overallReviews);
  const teaser = await getTodayAvailabilityTeaser();
  const related = getRelatedServicesInTier(catalog, service, 3);
  const therapists = await getTherapistsForService(service.slug, { limit: 6 });
  const bookHref = `/book?service=${service.slug}&duration=60`;
  const bookLabel = `Book ${service.name}`;

  if (service.category === "sensual") {
    return (
      <>
        <ServiceJsonLd
          name={service.name}
          description={service.details}
          slug={service.slug}
          amountThb={service.amountThb}
          duration={service.duration}
          aggregate={hasServiceReviews ? aggregate : null}
          reviews={hasServiceReviews ? serviceReviews : undefined}
          videoUrl={media.video}
          videoPoster={media.image}
          url={servicePath}
        />
        <FaqJsonLd faqs={faqs} />
        <BreadcrumbJsonLd
          items={[
            { name: "Home", path: "/" },
            { name: tierLabel, path: tierPath },
            { name: service.name, path: servicePath },
          ]}
        />
        <SensualServiceDetail
          service={service}
          media={media}
          libraryMedia={libraryMedia}
          faqs={faqs}
          displayReviews={displayReviews}
          hasServiceReviews={hasServiceReviews}
          related={related}
          bookHref={bookHref}
          bookLabel={bookLabel}
          teaser={teaser}
          therapists={therapists}
        />
      </>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <ServiceJsonLd
        name={service.name}
        description={service.details}
        slug={service.slug}
        amountThb={service.amountThb}
        duration={service.duration}
        aggregate={hasServiceReviews ? aggregate : null}
        reviews={hasServiceReviews ? serviceReviews : undefined}
        videoUrl={media.video}
        videoPoster={media.image}
        url={servicePath}
      />
      <FaqJsonLd faqs={faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: tierLabel, path: tierPath },
          { name: service.name, path: servicePath },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tierLabel, href: tierPath },
          { label: service.name },
        ]}
      />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {category?.title ?? "Service"} · Chiang Mai · In-room
      </p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        {service.name}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{service.summary}</p>

      {aggregate ? (
        <p className="mt-3 text-sm text-muted">
          <span className="text-accent">★★★★★</span> {aggregate.ratingValue}
          {hasServiceReviews
            ? ` · ${aggregate.reviewCount} ${service.name} review${aggregate.reviewCount === 1 ? "" : "s"}`
            : ` · ${aggregate.reviewCount} RoomSpa review${aggregate.reviewCount === 1 ? "" : "s"}`}
        </p>
      ) : null}

      <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-surface">
        <ServiceImage
          media={media}
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          variant="hero"
        />
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">{service.details}</p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-foreground md:text-base">
        No taxi. No waiting room. No trip across Chiang Mai — your therapist comes to your hotel,
        condo, or home.
      </p>

      <div className="mt-8">
        <AvailabilityBanner teaser={teaser} bookHref={bookHref} bookLabel={bookLabel} />
      </div>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Duration & pricing</p>
        <ServicePriceTiers className="mt-3" service={service} />
        <p className="mt-3 text-sm text-muted">
          From {productPriceLabel(getServicePriceTiers(service)[60])} · Oils, towels, and equipment
          provided
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap">
        <Link
          href={bookHref}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
        >
          {bookLabel}
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          WhatsApp
        </a>
      </div>
      <p className="mt-2 text-xs text-muted">Same-day availability · Instant confirmation</p>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
          What to expect
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted md:text-base">
          <li>Professional massage therapist at your place</li>
          <li>Hotel, condo, or home — we come to you</li>
          <li>Oils, towels, and setup provided</li>
          <li>Same-day booking when slots are open</li>
          <li>Instant email confirmation with reference + PIN</li>
        </ul>
      </section>

      {libraryMedia.length > 0 ? (
        <section className="mt-14 border-t border-border pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
              Videos & photos
            </h2>
            <Link href="/gallery" className="text-sm font-medium text-accent">
              Full gallery →
            </Link>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {libraryMedia.slice(0, 4).map((item) => (
              <li key={item.id}>
                <MediaEmbed
                  url={item.mediaUrl}
                  kind={item.kind}
                  title={item.title}
                  description={item.description}
                  thumbnailUrl={item.thumbnailUrl}
                />
                <p className="mt-3 font-display text-lg text-foreground">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
          Questions
        </h2>
        <dl className="mt-5 space-y-5">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {displayReviews.length > 0 ? (
        <div className="mt-10">
          <ReviewSnapshot
            reviews={displayReviews}
            heading={
              hasServiceReviews ? `${service.name} reviews` : "What guests say about RoomSpa"
            }
          />
        </div>
      ) : null}

      <TherapistStrip
        title={`Therapists offering ${service.name}`}
        therapists={therapists}
        viewAllHref={`/therapists?service=${service.slug}`}
      />

      {related.length > 0 ? (
        <div className="mt-10">
          <RelatedLinks
            title={
              tier === "signature" ? "More Signature experiences" : "Related wellness services"
            }
            links={related.map((item) => ({
              href: getServicePath(item),
              label: item.name,
              hint: productPriceLabel(item.amountThb),
            }))}
          />
        </div>
      ) : null}
    </article>
  );
}
