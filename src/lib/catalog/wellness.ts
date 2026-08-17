import type { CatalogService } from "@/content/services";
import { isWellnessExperience } from "@/lib/catalog/experience-tier";

/** Wellness-only catalog slice — never includes signature/sensual services. */
export function filterWellnessCatalog(catalog: CatalogService[]) {
  return catalog.filter(isWellnessExperience);
}
