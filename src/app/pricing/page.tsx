import type { Metadata } from "next";
import Link from "next/link";
import {
  catalogProducts,
  getServicePriceTiers,
  serviceCategories,
} from "@/content/services";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { whatsappHref } from "@/content/site";
import { THB_PER_USD, formatThb } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoomSpa mobile massage pricing for 60 min, 90 min, and 2 hours — THB with approximate USD.",
};

export default function PricingPage() {
  const fromPrice = Math.min(
    ...catalogProducts.map((p) => getServicePriceTiers(p)[60]),
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        60 min · 90 min · 2 hours
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        Pick a length when you book. You pay in THB (USD is a guide at ~{THB_PER_USD} THB = 1 USD).
        Cash or card. Travel fees may apply outside core coverage.
      </p>

      <div className="mt-12 space-y-12">
        {serviceCategories.map((category) => {
          const products = catalogProducts.filter((p) => p.category === category.id);
          if (products.length === 0) return null;

          return (
            <div key={category.id}>
              <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                {category.title}
              </h2>
              <ul className="mt-5 space-y-4">
                {products.map((product) => (
                  <li
                    key={product.slug}
                    className="border border-border bg-surface-elevated px-4 py-5 md:px-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0 lg:max-w-sm">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="mt-1 text-sm text-muted">Cash or card · in-room Chiang Mai</p>
                      </div>
                      <div className="w-full max-w-xl flex-1">
                        <ServicePriceTiers service={product} />
                      </div>
                      <Link
                        href={`/book?service=${product.slug}`}
                        className="inline-flex shrink-0 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
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

      <p className="mt-10 text-sm text-muted">
        Starting from {formatThb(fromPrice)} for 60 minutes. Need a custom length or combo?{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          WhatsApp us
        </a>
        .
      </p>
    </section>
  );
}
