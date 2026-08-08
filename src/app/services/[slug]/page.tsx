import type { Metadata } from "next";
import Image from "next/image";
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
import { getServiceMedia } from "@/content/service-media";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import {
  catalogServices,
  getServicePriceTiers,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { getPublicCatalog, getPublicCatalogProduct } from "@/lib/catalog/public";
import { getPublishedMediaForServiceSlug } from "@/lib/media/public";
import { aggregateRating, getApprovedReviews, getApprovedReviewsForService } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return catalogServices.filter((s) => s.bookable).map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublicCatalogProduct(slug);
  if (!service) return {};

  return buildPageMetadata({
    title: `${service.name} Chiang Mai | In-room mobile massage`,
    description: `${service.summary} Book ${service.name} at your hotel, condo, or home in Chiang Mai. From ${productPriceLabel(service.amountThb)}.`,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const catalog = await getPublicCatalog();
  const service = catalog.find((item) => item.slug === slug);
  if (!service || !service.bookable) notFound();

  const media = getServiceMedia(service.slug);
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
  const related = catalog
    .filter((item) => item.category === service.category && item.slug !== service.slug)
    .slice(0, 3);
  const bookHref = `/book?service=${service.slug}&duration=60`;
  const bookLabel = `Book ${service.name}`;

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
      />
      <FaqJsonLd faqs={faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {category?.title ?? "Service"} · Chiang Mai · In-room
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {service.name}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{service.summary}</p>

      {aggregate ? (
        <p className="mt-3 text-sm text-muted">
          <span className="text-accent">★★★★★</span> {aggregate.ratingValue}
          {hasServiceReviews ? ` · ${aggregate.reviewCount} ${service.name} review${aggregate.reviewCount === 1 ? "" : "s"}` : ` · ${aggregate.reviewCount} RoomSpa review${aggregate.reviewCount === 1 ? "" : "s"}`}
        </p>
      ) : null}

      <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-surface">
        <Image
          src={media.image}
          alt={media.imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">{service.details}</p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-foreground md:text-base">
        No taxi. No waiting room. No trip across Chiang Mai — your therapist comes to your hotel,
        condo, or home.
      </p>

      {service.category === "sensual" ? (
        <p className="mt-4 text-sm text-muted">
          Consent-led professional bodywork with clear boundaries. You can pause or stop anytime.
        </p>
      ) : null}

      <div className="mt-8">
        <AvailabilityBanner
          teaser={teaser}
          bookHref={bookHref}
          bookLabel={bookLabel}
        />
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

      {related.length > 0 ? (
        <div className="mt-10">
          <RelatedLinks
            title="You may also like"
            links={related.map((item) => ({
              href: `/services/${item.slug}`,
              label: item.name,
              hint: productPriceLabel(item.amountThb),
            }))}
          />
        </div>
      ) : null}
    </article>
  );
}
