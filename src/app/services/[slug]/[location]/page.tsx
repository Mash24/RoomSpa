import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinks } from "@/components/seo/related-links";
import { ReviewSnapshot } from "@/components/seo/review-snapshot";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { getServiceFaqs } from "@/content/service-faqs";
import { getServiceMedia } from "@/content/service-media";
import { getCatalogProduct, productPriceLabel } from "@/content/services";
import { site, whatsappHref } from "@/content/site";
import { aggregateRating, getApprovedReviews, getApprovedReviewsForService } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";
import {
  getServiceLocationParams,
  getSeoLocation,
  relatedBlogLinks,
  relatedServices,
  seoLocations,
} from "@/lib/seo/locations";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string; location: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getServiceLocationParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, location: locationSlug } = await params;
  const service = getCatalogProduct(slug);
  const location = getSeoLocation(locationSlug);
  if (!service || !location) return {};

  return buildPageMetadata({
    title: `${service.name} ${location.inPhrase} | In-room massage`,
    description: `Book ${service.name} ${location.inPhrase}. ${location.summary} ${service.duration} from ${productPriceLabel(service.amountThb)}.`,
    path: `/services/${service.slug}/${location.slug}`,
  });
}

export default async function ServiceLocationPage({ params }: PageProps) {
  const { slug, location: locationSlug } = await params;
  const service = getCatalogProduct(slug);
  const location = getSeoLocation(locationSlug);
  if (!service?.bookable || !location) notFound();

  const media = getServiceMedia(service.slug);
  const faqs = [
    {
      question: `Can I book ${service.name} ${location.inPhrase}?`,
      answer: location.bookable
        ? `Yes. Choose ${service.name} on the booking form and select the matching Chiang Mai coverage for ${location.name}.`
        : `${location.cityName} coverage is coming soon. Book Chiang Mai today or join the WhatsApp waitlist.`,
    },
    ...getServiceFaqs(service.slug).slice(0, 4),
  ];
  const serviceReviews = await getApprovedReviewsForService(service.slug, 6);
  const displayReviews =
    serviceReviews.length > 0 ? serviceReviews : await getApprovedReviews(4);
  const aggregate = aggregateRating(displayReviews);
  const teaser = location.bookable ? await getTodayAvailabilityTeaser() : null;
  const pagePath = `/services/${service.slug}/${location.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <ServiceJsonLd
        name={`${service.name} ${location.inPhrase}`}
        description={`${service.details} Available ${location.inPhrase}.`}
        slug={service.slug}
        amountThb={service.amountThb}
        duration={service.duration}
        url={`${site.url}${pagePath}`}
        areaServed={`${location.name}, ${location.cityName}`}
        aggregate={aggregate}
        reviews={displayReviews}
        videoUrl={media.video}
        videoPoster={media.image}
      />
      <FaqJsonLd faqs={faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
          { name: location.name, path: pagePath },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name, href: `/services/${service.slug}` },
          { label: location.name },
        ]}
      />

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {location.bookable ? "Bookable area" : "Coming soon"} · {location.cityName}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {service.name} {location.inPhrase}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        {service.summary} {location.summary}
      </p>

      <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-surface">
        <Image
          src={media.image}
          alt={`${media.imageAlt} — ${location.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
          priority
        />
      </div>

      {teaser ? (
        <div className="mt-8">
          <AvailabilityBanner
            teaser={teaser}
            bookHref={`/book?service=${service.slug}`}
          />
        </div>
      ) : null}

      <p className="mt-6 font-display text-3xl text-accent">
        {productPriceLabel(service.amountThb)}
        <span className="ml-2 text-base text-muted">· {service.duration}</span>
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-foreground">Nearby stays we often visit</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {location.nearbyHotels.map((hotel) => (
            <li key={hotel}>{hotel}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-foreground">FAQ</h2>
        <dl className="mt-5 space-y-5">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10">
        <ReviewSnapshot reviews={displayReviews} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {location.bookable ? (
          <Link
            href={`/book?service=${service.slug}`}
            className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            Book {service.name}
          </Link>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            WhatsApp waitlist
          </a>
        )}
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm"
        >
          Service details
        </Link>
        <Link
          href={`/city/${location.citySlug}`}
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm"
        >
          {location.cityName} guide
        </Link>
      </div>

      <div className="mt-12 space-y-10">
        <RelatedLinks
          title="More areas"
          links={seoLocations
            .filter((loc) => loc.slug !== location.slug && loc.citySlug === location.citySlug)
            .map((loc) => ({
              href: `/services/${service.slug}/${loc.slug}`,
              label: `${service.name} ${loc.inPhrase}`,
            }))}
        />
        <RelatedLinks
          title="Related services"
          links={relatedServices(service, 4).map((item) => ({
            href: `/services/${item.slug}/${location.slug}`,
            label: `${item.name} ${location.inPhrase}`,
          }))}
        />
        <RelatedLinks
          title="Guides"
          links={relatedBlogLinks([service.name, location.name, "hotel"], 3).map((post) => ({
            href: `/blog/${post.slug}`,
            label: post.title,
          }))}
        />
      </div>
    </article>
  );
}
