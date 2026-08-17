import type { CatalogService, ServiceCategoryId } from "@/content/services";

/** Top-level merchandising tier — maps to DB `category` values, not a separate column. */
export type ExperienceTier = "wellness" | "signature";

export const experienceTierLabels: Record<ExperienceTier, string> = {
  wellness: "Wellness Massage",
  signature: "Signature Experiences",
};

/** DB category for all signature / sensual services. */
export const SIGNATURE_CATEGORY_ID: ServiceCategoryId = "sensual";

/** Wellness sub-categories shown in admin when tier is wellness. */
export const WELLNESS_CATEGORY_IDS: ServiceCategoryId[] = [
  "classic",
  "therapeutic",
  "shared",
];

export function getExperienceTier(
  service: Pick<CatalogService, "category">,
): ExperienceTier {
  return service.category === SIGNATURE_CATEGORY_ID ? "signature" : "wellness";
}

export function isSignatureExperience(
  service: Pick<CatalogService, "category">,
) {
  return getExperienceTier(service) === "signature";
}

export function isWellnessExperience(
  service: Pick<CatalogService, "category">,
) {
  return getExperienceTier(service) === "wellness";
}

export function tierToCategory(
  tier: ExperienceTier,
  wellnessSubCategory: ServiceCategoryId = "classic",
): ServiceCategoryId {
  if (tier === "signature") return SIGNATURE_CATEGORY_ID;
  return WELLNESS_CATEGORY_IDS.includes(wellnessSubCategory)
    ? wellnessSubCategory
    : "classic";
}

export function categoryToTier(category: ServiceCategoryId): ExperienceTier {
  return category === SIGNATURE_CATEGORY_ID ? "signature" : "wellness";
}
