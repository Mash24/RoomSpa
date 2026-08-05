import Link from "next/link";
import { featuredServices, productPriceLabel } from "@/content/services";
import { whatsappHref } from "@/content/site";
import { THB_PER_USD } from "@/lib/currency";

export function HomePricing() {
  return (
    <section className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Pricing</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Clear rates in THB and USD
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Charged in Thai Baht. USD shown as an approximate guide (~{THB_PER_USD} THB = 1 USD). Full
            menu from classic Swedish to Nuru, Yoni, and Lingam.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {featuredServices.map((product) => (
            <li key={product.slug} className="border border-border bg-surface-elevated p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-3xl tracking-tight text-foreground">{product.name}</h3>
                <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted">
                  {product.duration}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{product.summary}</p>
              <p className="mt-6 font-display text-3xl tracking-tight text-accent">
                {productPriceLabel(product.amountThb)}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/book?service=${product.slug}`}
                  className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
                >
                  Book this
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted">
          Looking for Thai, deep tissue, four-hands, or tantric?{" "}
          <Link href="/pricing" className="text-accent underline">
            See full pricing
          </Link>{" "}
          or{" "}
          <Link href="/services" className="text-accent underline">
            browse all services
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
