import type { CatalogService } from "@/content/services";
import { catalogServices } from "@/content/services";
import { getExperienceTier, type ExperienceTier } from "@/lib/catalog/experience-tier";

type ServiceLike = Pick<CatalogService, "slug" | "category">;

export function getServiceTierPath(tier: ExperienceTier): string {
  return `/services/${tier}`;
}

export function getServicePath(service: ServiceLike): string {
  const tier = getExperienceTier(service);
  return `${getServiceTierPath(tier)}/${service.slug}`;
}

export function getServiceLocationPath(service: ServiceLike, locationSlug: string): string {
  return `${getServicePath(service)}/${locationSlug}`;
}

export function getServicePathBySlug(slug: string): string {
  const service = catalogServices.find((s) => s.slug === slug);
  if (service) return getServicePath(service);
  return `/services/${slug}`;
}

export function parseServiceTierFromPath(tier: string): ExperienceTier | null {
  if (tier === "wellness" || tier === "signature") return tier;
  return null;
}
