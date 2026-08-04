import { dualPriceLabel } from "@/lib/currency";

/** Active Stripe catalog products (sandbox). Env overrides win when set. */
export const catalogProducts = [
  {
    slug: "swedish",
    name: "Swedish Massage",
    summary:
      "Classic full-body therapy to relax the body, ease muscle tension, and boost circulation using flowing massage movements.",
    duration: "60 min",
    amountThb: 800,
    stripeProductId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_SWEDISH ?? "prod_V0lNbo1klB5AQn",
    stripePriceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_SWEDISH ?? "price_1U0jqz2E50DqFYh5G4dF1w1M",
    featured: true,
  },
  {
    slug: "couples",
    name: "Couples Massage",
    summary:
      "A shared spa experience for two people with simultaneous treatments in the same private room — for couples, friends, or family.",
    duration: "60 min",
    amountThb: 2500,
    stripeProductId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_COUPLES ?? "prod_V0lPwaRImIqAPQ",
    stripePriceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLES ?? "price_1U0jsJ2E50DqFYh5EItwggZ4",
    featured: true,
  },
] as const;

export const comingSoonProducts = [
  { slug: "deep-tissue", name: "Deep Tissue", note: "Coming soon" },
  { slug: "aromatherapy", name: "Aromatherapy", note: "Coming soon" },
] as const;

export function productPriceLabel(amountThb: number) {
  return dualPriceLabel(amountThb);
}

export function getCatalogProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}
