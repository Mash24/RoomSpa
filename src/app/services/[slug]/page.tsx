import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoplayVideo } from "@/components/media/autoplay-video";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinks } from "@/components/seo/related-links";
import { ReviewSnapshot } from "@/components/seo/review-snapshot";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/json-ld";
import { getServiceFaqs } from "@/content/service-faqs";
import { getServiceMedia } from "@/content/service-media";
import {
  catalogServices,
  getCatalogProduct,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { aggregateRating, getApprovedReviews, getApprovedReviewsForService } from "@/lib/reviews/fetch";
import { getTodayAvailabilityTeaser } from "@/lib/seo/availability-teaser";
import {
  relatedBlogLinks,
  relatedServices,
  seoLocations,
} from "@/lib/seo/locations";
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
  const service = getCatalogProduct(slug);
  if (!service) return {};

  return buildPageMetadata({
    title: `${service.name} Chiang Mai | In-room mobile massage`,
    description: `${service.summary} Book ${service.name} at your hotel, condo, or home in Chiang Mai. ${service.duration} from ${productPriceLabel(service.amountThb)}.`,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getCatalogProduct(slug);
  if (!service || !service.bookable) notFound();

  const media = getServiceMedia(service.slug);
  const category = serviceCategories.find((item) => item.id === service.category);
  const faqs = getServiceFaqs(service.slug);
  const serviceReviews = await getApprovedReviewsForService(service.slug, 8);
  const displayReviews =
    serviceReviews.length > 0 ? serviceReviews : await getApprovedReviews(4);
  const aggregate = aggregateRating(displayReviews);
  const teaser = await getTodayAvailabilityTeaser();
  const related = relatedServices(service, 4);
  const blogs = relatedBlogLinks([service.name, service.category, "Chiang Mai", "hotel"], 3);
  const areaLinks = seoLocations
    .filter((loc) => loc.bookable)
    .slice(0, 6)
    .map((loc) => ({
      href: `/services/${service.slug}/${loc.slug}`,
      label: `${service.name} ${loc.inPhrase}`,
      hint: loc.bookable ? "Bookable coverage" : "Coming soon",
    }));

  return (
    <article className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <ServiceJsonLd
        name={service.name}
        description={service.details}
        slug={service.slug}
        amountThb={service.amountThb}
        duration={service.duration}
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
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {category?.title ?? "Service"} · Chiang Mai
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{service.summary}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">{service.details}</p>

          <div className="mt-6">
            <AvailabilityBanner teaser={teaser} bookHref={`/book?service=${service.slug}`} />
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-border bg-surface-elevated p-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Duration</dt>
              <dd className="mt-2 font-display text-2xl text-foreground">{service.duration}</dd>
            </div>
            <div className="border border-border bg-surface-elevated p-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">From</dt>
              <dd className="mt-2 font-display text-2xl text-accent">
                {productPriceLabel(service.amountThb)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/book?service=${service.slug}`}
              className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              Book {service.name}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              WhatsApp questions
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface">
            <Image
              src={media.image}
              alt={media.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-video overflow-hidden bg-surface">
            <AutoplayVideo
              src={media.video}
              poster={media.image}
              label={`${service.name} preview`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-3xl tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <dl className="mt-6 space-y-6">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-display text-xl text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted md:text-base">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10">
        <ReviewSnapshot reviews={displayReviews} heading={`${service.name} reviews`} />
      </div>

      <div className="mt-10 space-y-10">
        <RelatedLinks
          title="Book this service by area"
          links={areaLinks}
        />
        <RelatedLinks
          title="Related services"
          links={related.map((item) => ({
            href: `/services/${item.slug}`,
            label: item.name,
            hint: productPriceLabel(item.amountThb),
          }))}
        />
        <RelatedLinks
          title="Guides"
          links={blogs.map((post) => ({
            href: `/blog/${post.slug}`,
            label: post.title,
          }))}
        />
      </div>
    </article>
  );
}
