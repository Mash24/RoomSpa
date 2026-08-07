import { catalogServices, productPriceLabel, type CatalogService } from "@/content/services";
import { cities, type CityDefinition } from "@/content/cities";
import { getAllBlogPosts } from "@/content/blog";

export type SeoLocation = {
  slug: string;
  name: string;
  /** Full phrase for titles: "in Nimman, Chiang Mai" */
  inPhrase: string;
  citySlug: string;
  cityName: string;
  type: "city" | "neighborhood";
  bookable: boolean;
  coverageSlug?: string;
  summary: string;
  nearbyHotels: string[];
};

function cityToLocations(city: CityDefinition): SeoLocation[] {
  const cityLoc: SeoLocation = {
    slug: city.slug,
    name: city.name,
    inPhrase: `in ${city.name}`,
    citySlug: city.slug,
    cityName: city.name,
    type: "city",
    bookable: city.status === "active",
    summary: city.summary,
    nearbyHotels:
      city.slug === "chiang-mai"
        ? [
            "Anantara Chiang Mai",
            "Eastin Tan Hotel Chiang Mai",
            "U Nimman Chiang Mai",
            "Shangri-La Chiang Mai",
            "Tamarind Village",
          ]
        : city.slug === "bangkok"
          ? ["Sukhumvit hotels", "Silom / Sathorn hotels", "Riverside hotels"]
          : ["Patong beach resorts", "Rawai / Nai Harn villas"],
  };

  const areas = city.neighborhoods.map((area) => ({
    slug: area.slug,
    name: area.name,
    inPhrase: `near ${area.name}, ${city.name}`,
    citySlug: city.slug,
    cityName: city.name,
    type: "neighborhood" as const,
    bookable: city.status === "active",
    coverageSlug: area.coverageSlug,
    summary: area.summary,
    nearbyHotels:
      area.slug === "nimman"
        ? ["U Nimman", "Eastin Tan", "Amora Tapae (nearby)", "Maya Lifestyle Mall area hotels"]
        : area.slug === "old-city"
          ? ["Tamarind Village", "Rachamankha", "Old City boutique guesthouses"]
          : area.slug === "airport-hang-dong"
            ? ["Airport hotels", "Hang Dong residences", "Southern corridor resorts"]
            : [`Hotels around ${area.name}`],
  }));

  return [cityLoc, ...areas];
}

export const seoLocations: SeoLocation[] = cities.flatMap(cityToLocations);

export function getSeoLocation(slug: string) {
  return seoLocations.find((loc) => loc.slug === slug);
}

/** Combinations we generate: all services × bookable locations; featured × coming-soon cities only. */
export function getServiceLocationParams() {
  const bookableServices = catalogServices.filter((s) => s.bookable);
  const featured = bookableServices.filter((s) => s.featured);
  const params: { slug: string; location: string }[] = [];

  for (const loc of seoLocations) {
    const services = loc.bookable ? bookableServices : featured;
    for (const service of services) {
      params.push({ slug: service.slug, location: loc.slug });
    }
  }

  return params;
}

export function topServicesForCity(limit = 8): CatalogService[] {
  const featured = catalogServices.filter((s) => s.bookable && s.featured);
  const rest = catalogServices.filter((s) => s.bookable && !s.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function averagePriceLabel(services: CatalogService[]) {
  if (services.length === 0) return productPriceLabel(0);
  const avg = Math.round(
    services.reduce((sum, s) => sum + s.amountThb, 0) / services.length,
  );
  return productPriceLabel(avg);
}

export function priceRangeLabel(services: CatalogService[]) {
  if (services.length === 0) return "";
  const amounts = services.map((s) => s.amountThb);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  if (min === max) return productPriceLabel(min);
  return `${productPriceLabel(min)} – ${productPriceLabel(max)}`;
}

export function relatedBlogLinks(keywords: string[], limit = 3) {
  const posts = getAllBlogPosts();
  const scored = posts.map((post) => {
    const hay = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
    const score = keywords.reduce((n, key) => (hay.includes(key.toLowerCase()) ? n + 1 : n), 0);
    return { post, score };
  });
  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.post);
}

export function relatedServices(service: CatalogService, limit = 4) {
  return catalogServices
    .filter((s) => s.bookable && s.slug !== service.slug)
    .sort((a, b) => {
      const aScore = a.category === service.category ? 1 : 0;
      const bScore = b.category === service.category ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}
