import type { Metadata } from "next";
import Link from "next/link";
import {
  getServicePriceTiers,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { whatsappHref } from "@/content/site";
import { getPublicCatalog } from "@/lib/catalog/public";
import { THB_PER_USD, formatThb } from "@/lib/currency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoomSpa mobile massage pricing for 60 min, 90 min, and 2 hours — THB with approximate USD.",
};

export default async function PricingPage() {
  const catalog = await getPublicCatalog();
  const fromPrice = catalog.length
    ? Math.min(...catalog.map((p) => getServicePriceTiers(p)[60]))
    : 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Clear prices, three lengths
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        60 min, 90 min, or 2 hours. Pay in THB (USD guide ~{THB_PER_USD}:1). Cash or card.
      </p>

      <div className="mt-10 space-y-12 md:mt-14">
        {serviceCategories.map((category) => {
          const products = catalog.filter((p) => p.category === category.id);
          if (products.length === 0) return null;

          return (
            <div key={category.id}>
              <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                {category.title}
              </h2>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {products.map((product) => (
                  <li key={product.slug} className="py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 sm:max-w-xs">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="mt-1 text-sm text-muted">In-room · Chiang Mai</p>
                      </div>
                      <div className="w-full flex-1 sm:max-w-md">
                        <ServicePriceTiers service={product} />
                      </div>
                      <Link
                        href={`/book?service=${product.slug}`}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground"
                      >
                        Book
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {fromPrice > 0 ? (
        <p className="mt-10 text-sm text-muted">
          From {formatThb(fromPrice)} for 60 minutes. Custom length?{" "}
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
            WhatsApp us
          </a>
          .
        </p>
      ) : null}
    </section>
  );
}
