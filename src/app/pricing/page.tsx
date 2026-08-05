import type { Metadata } from "next";
import Link from "next/link";
import {
  catalogProducts,
  productPriceLabel,
  serviceAcceptsCardNow,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { THB_PER_USD } from "@/lib/currency";
import { formatThb } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoomSpa mobile massage pricing in THB and approximate USD — classic, therapeutic, couples, Nuru, Yoni, Lingam, and more.",
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Transparent rates, dual currency
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        You pay in THB. USD is an approximate guide (~{THB_PER_USD} THB = 1 USD). For photos and
        videos of each treatment, see{" "}
        <Link href="/services" className="text-accent underline">
          Services
        </Link>
        . Travel fees may apply outside core coverage areas.
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
              <ul className="mt-5 divide-y divide-border border border-border bg-surface-elevated">
                {products.map((product) => (
                  <li
                    key={product.slug}
                    className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {product.duration}
                        {!serviceAcceptsCardNow(product) ? " · cash / card later" : " · cash / card"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <p className="font-display text-xl text-accent sm:text-2xl">
                        {productPriceLabel(product.amountThb)}
                      </p>
                      <Link
                        href={`/book?service=${product.slug}`}
                        className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
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
        Starting from {formatThb(Math.min(...catalogProducts.map((p) => p.amountThb)))}. Need a
        custom length or combo?{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          WhatsApp us
        </a>
        .
      </p>
    </section>
  );
}
