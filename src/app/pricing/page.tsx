import type { Metadata } from "next";
import Link from "next/link";
import { catalogProducts, comingSoonProducts, productPriceLabel } from "@/content/pricing";
import { whatsappHref } from "@/content/site";
import { THB_PER_USD } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoomSpa massage pricing in Thai Baht and approximate USD — Swedish and Couples sessions delivered to your hotel, condo, or home.",
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Pricing</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Transparent rates, dual currency
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        You pay in THB. USD is shown as an approximate guide (~{THB_PER_USD} THB = 1 USD). Travel fees may apply
        outside core coverage areas.
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {catalogProducts.map((product) => (
          <li key={product.slug} className="border border-border bg-surface-elevated p-7 md:p-8">
            <h2 className="font-display text-3xl tracking-tight text-foreground">{product.name}</h2>
            <p className="mt-2 text-sm text-muted">{product.duration}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">{product.summary}</p>
            <p className="mt-6 font-display text-3xl text-accent">{productPriceLabel(product.amountThb)}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
              >
                Book this
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
              >
                WhatsApp us
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <p className="text-sm text-muted">More services coming soon:</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {comingSoonProducts.map((product) => (
            <span
              key={product.slug}
              className="rounded-sm border border-dashed border-border px-4 py-2 text-sm text-muted"
            >
              {product.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
