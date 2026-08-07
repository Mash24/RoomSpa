import { site } from "@/content/site";
import { coverageAreas } from "@/content/coverage";
import { catalogServices } from "@/content/services";
import { faqItems } from "@/content/pages";
import type { ServiceFaq } from "@/content/service-faqs";
import type { PublicReview } from "@/lib/reviews/types";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        alternateName: "GetRoomSpa",
        url: site.url,
        email: site.contact.email,
        telephone: site.contact.whatsapp,
        logo: `${site.url}/icon`,
        sameAs: [],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        publisher: { "@id": `${site.url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${site.url}/services?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function LocalBusinessJsonLd(input?: {
  aggregate?: { ratingValue: number; reviewCount: number } | null;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    alternateName: "GetRoomSpa",
    description: site.description,
    url: site.url,
    email: site.contact.email,
    telephone: site.contact.whatsapp,
    image: `${site.url}/opengraph-image`,
    priceRange: "฿฿",
    areaServed: coverageAreas.map((area) => ({
      "@type": "Place",
      name: `${area.name}, ${area.city}`,
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chiang Mai",
      addressCountry: "TH",
    },
    makesOffer: catalogServices
      .filter((service) => service.bookable)
      .map((service) => ({
        "@type": "Offer",
        priceCurrency: "THB",
        price: service.amountThb,
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.summary,
          url: `${site.url}/services/${service.slug}`,
        },
      })),
  };

  if (input?.aggregate) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.aggregate.ratingValue,
      reviewCount: input.aggregate.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return <JsonLd data={data} />;
}

export function FaqJsonLd({ faqs = faqItems }: { faqs?: ServiceFaq[] | typeof faqItems }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${site.url}${item.path === "/" ? "" : item.path}`,
        })),
      }}
    />
  );
}

export function ServiceJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  amountThb: number;
  duration: string;
  url?: string;
  areaServed?: string;
  aggregate?: { ratingValue: number; reviewCount: number } | null;
  reviews?: PublicReview[];
  videoUrl?: string;
  videoPoster?: string;
}) {
  const pageUrl = input.url ?? `${site.url}/services/${input.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: pageUrl,
    provider: {
      "@type": "HealthAndBeautyBusiness",
      name: site.name,
      url: site.url,
    },
    areaServed: input.areaServed ?? "Chiang Mai, Thailand",
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: input.amountThb,
      availability: "https://schema.org/InStock",
      url: pageUrl,
    },
    termsOfService: `${site.url}/faq`,
    additionalProperty: {
      "@type": "PropertyValue",
      name: "Duration",
      value: input.duration,
    },
  };

  if (input.aggregate) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.aggregate.ratingValue,
      reviewCount: input.aggregate.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (input.reviews && input.reviews.length > 0) {
    data.review = input.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
      author: { "@type": "Person", name: review.authorName },
      reviewBody: review.body,
      datePublished: review.createdAt,
    }));
  }

  if (input.videoUrl) {
    data.subjectOf = {
      "@type": "VideoObject",
      name: `${input.name} preview`,
      description: input.description,
      contentUrl: `${site.url}${input.videoUrl}`,
      thumbnailUrl: input.videoPoster ? `${site.url}${input.videoPoster}` : undefined,
      uploadDate: "2026-08-01",
    };
  }

  return <JsonLd data={data} />;
}

export function BlogPostingJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: input.title,
        description: input.description,
        datePublished: input.datePublished,
        dateModified: input.dateModified || input.datePublished,
        author: { "@type": "Organization", name: site.name },
        publisher: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
        },
        mainEntityOfPage: `${site.url}/blog/${input.slug}`,
        url: `${site.url}/blog/${input.slug}`,
      }}
    />
  );
}
