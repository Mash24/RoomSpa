/** @deprecated Prefer `@/content/services` — kept as a thin re-export for existing imports. */
export {
  catalogProducts,
  catalogServices,
  featuredServices,
  getCatalogProduct,
  productPriceLabel,
  serviceAcceptsCardNow,
} from "@/content/services";

/** Empty — full catalog is live; kept so older UI imports do not break. */
export const comingSoonProducts = [] as const;
