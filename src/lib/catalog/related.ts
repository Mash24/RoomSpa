import type { CatalogService } from "@/content/services";
import { getExperienceTier } from "@/lib/catalog/experience-tier";

/**
 * Related services within the same experience tier only —
 * Signature never recommends Wellness and vice versa.
 */
export function getRelatedServicesInTier(
  catalog: CatalogService[],
  service: Pick<CatalogService, "slug" | "category" | "bookable">,
  limit = 3,
) {
  const tier = getExperienceTier(service);
  return catalog
    .filter(
      (item) =>
        item.bookable &&
        item.slug !== service.slug &&
        getExperienceTier(item) === tier,
    )
    .slice(0, limit);
}
