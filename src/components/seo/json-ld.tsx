import { site } from "@/content/site";
import { coverageAreas } from "@/content/coverage";
import { catalogServices } from "@/content/services";
import { faqItems } from "@/content/pages";

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

export function LocalBusinessJsonLd() {
  const data = {
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

  return <JsonLd data={data} />;
}

export function FaqJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
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
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: input.name,
        description: input.description,
        url: `${site.url}/services/${input.slug}`,
        provider: {
          "@type": "HealthAndBeautyBusiness",
          name: site.name,
          url: site.url,
        },
        areaServed: "Chiang Mai, Thailand",
        offers: {
          "@type": "Offer",
          priceCurrency: "THB",
          price: input.amountThb,
          availability: "https://schema.org/InStock",
        },
        termsOfService: `${site.url}/faq`,
        additionalProperty: {
          "@type": "PropertyValue",
          name: "Duration",
          value: input.duration,
        },
      }}
    />
  );
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
