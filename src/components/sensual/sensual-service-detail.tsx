import Link from "next/link";
import { AvailabilityBanner } from "@/components/seo/availability-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinks } from "@/components/seo/related-links";
import { ReviewSnapshot } from "@/components/seo/review-snapshot";
import { MediaEmbed } from "@/components/media/media-embed";
import { ServiceImage } from "@/components/media/service-image";
import { SensualZone } from "@/components/sensual/sensual-zone";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import type { ServiceMedia } from "@/content/service-media";
import type { PublicTherapist } from "@/lib/therapists/types";
import { TherapistStrip } from "@/components/therapists/therapist-strip";
import type { CatalogService } from "@/content/services";
import { getServicePriceTiers, productPriceLabel } from "@/content/services";
import { whatsappHref } from "@/content/site";
import { getServicePath } from "@/lib/catalog/service-paths";
import type { PublicMediaItem } from "@/lib/media/public";
import type { PublicReview } from "@/lib/reviews/types";

type Faq = { question: string; answer: string };

type Props = {
  service: CatalogService;
  media: ServiceMedia;
  libraryMedia: PublicMediaItem[];
  faqs: Faq[];
  displayReviews: PublicReview[];
  hasServiceReviews: boolean;
  related: CatalogService[];
  bookHref: string;
  bookLabel: string;
  teaser: Awaited<ReturnType<typeof import("@/lib/seo/availability-teaser").getTodayAvailabilityTeaser>>;
  therapists?: PublicTherapist[];
};

export function SensualServiceDetail({
  service,
  media,
  libraryMedia,
  faqs,
  displayReviews,
  hasServiceReviews,
  related,
  bookHref,
  bookLabel,
  teaser,
  therapists = [],
}: Props) {
  return (
    <SensualZone>
      <article className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Signature Experiences", href: "/services/signature" },
            { label: service.name },
          ]}
        />

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-[#c9a86c]">
          Signature Experiences · Chiang Mai · In-room
        </p>
        <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-[#f5f0e8] xs:text-4xl md:text-5xl">
          {service.name}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#f5f0e8]/80 md:text-lg">{service.summary}</p>

        <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-sm bg-[#161311] ring-1 ring-[#c9a86c]/20 sm:aspect-[16/10]">
          <ServiceImage media={media} priority sizes="(max-width: 768px) 100vw, 720px" variant="hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09]/50 via-transparent to-[#0c0a09]/15 pointer-events-none" />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-[#f5f0e8]/75 md:text-base">{service.details}</p>
        <p className="mt-4 text-sm text-[#f5f0e8]/65">
          Consent-led intimate bodywork in your hotel, condo, or home — discreet arrival, clear
          boundaries, unhurried touch.
        </p>

        <div className="mt-8">
          <AvailabilityBanner
            teaser={teaser}
            bookHref={bookHref}
            bookLabel={bookLabel}
          />
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#c9a86c]">Duration & pricing</p>
          <ServicePriceTiers className="mt-3" service={service} onDark />
          <p className="mt-3 text-sm text-[#f5f0e8]/65">
            From {productPriceLabel(getServicePriceTiers(service)[60])} · Private setup provided
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap">
          <Link
            href={bookHref}
            className="sensual-btn-primary inline-flex min-h-12 items-center justify-center rounded-sm px-5 py-3 text-sm font-medium"
          >
            {bookLabel}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="sensual-btn-outline inline-flex min-h-12 items-center justify-center rounded-sm border px-5 py-3 text-sm font-medium"
          >
            WhatsApp — discreet
          </a>
        </div>

        {libraryMedia.length > 0 ? (
          <section className="mt-14 border-t border-[#c9a86c]/15 pt-8">
            <h2 className="font-display text-2xl tracking-tight text-[#f5f0e8] md:text-3xl">
              Signature atmosphere
            </h2>
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
                  <p className="mt-3 font-display text-lg text-[#f5f0e8]">{item.title}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14 border-t border-[#c9a86c]/15 pt-8">
          <h2 className="font-display text-2xl tracking-tight text-[#f5f0e8] md:text-3xl">Questions</h2>
          <dl className="mt-5 space-y-5">
            {faqs.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-[#f5f0e8]">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#f5f0e8]/70">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {displayReviews.length > 0 ? (
          <div className="mt-10 [&_.text-foreground]:text-[#f5f0e8] [&_.text-muted]:text-[#f5f0e8]/65">
            <ReviewSnapshot
              reviews={displayReviews}
              heading={hasServiceReviews ? `${service.name} reviews` : "Guest reviews"}
            />
          </div>
        ) : null}

        <TherapistStrip
          title={`Therapists offering ${service.name}`}
          therapists={therapists}
          dark
          viewAllHref={`/therapists?service=${service.slug}`}
        />

        {related.length > 0 ? (
          <div className="mt-10 [&_a]:text-[#c9a86c] [&_h3]:text-[#f5f0e8]">
            <RelatedLinks
              title="More Signature experiences"
              links={related.map((item) => ({
                href: getServicePath(item),
                label: item.name,
                hint: productPriceLabel(item.amountThb),
              }))}
            />
          </div>
        ) : null}

        <p className="mt-12 border-t border-[#c9a86c]/15 pt-8 text-xs leading-relaxed text-[#f5f0e8]/45">
          Professional intimate bodywork only — not escort services. Boundaries agreed before touch.
        </p>
      </article>
    </SensualZone>
  );
}
