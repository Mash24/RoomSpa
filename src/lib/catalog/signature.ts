import type { CatalogService } from "@/content/services";
import { isSignatureExperience } from "@/lib/catalog/experience-tier";

/** Signature-only catalog slice — never includes wellness services. */
export function filterSignatureCatalog(catalog: CatalogService[]) {
  return catalog.filter(isSignatureExperience);
}

/** @deprecated Use filterSignatureCatalog */
export { filterSignatureCatalog as filterSensualCatalog };
