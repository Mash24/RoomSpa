import Link from "next/link";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { featuredServices, productPriceLabel } from "@/content/services";

export function HomePricing() {
  return (
    <section className="bg-surface px-4 py-12 xs:px-5 xs:py-14 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Pricing</p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            Clear rates
          </h2>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
            Pick a treatment and length. Pay cash or card.
          </p>
        </div>

        <ul className="mt-8 grid gap-5 xs:mt-10 xs:gap-6 md:mt-12 md:grid-cols-2">
          {featuredServices.map((product) => (
            <li
              key={product.slug}
              className="border border-border bg-surface-elevated p-5 xs:p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 font-display text-2xl tracking-tight text-foreground xs:text-3xl">
                  {product.name}
                </h3>
                <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.14em] text-muted xs:text-xs">
                  {product.duration}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{product.summary}</p>
              <p className="mt-5 font-display text-2xl tracking-tight text-accent xs:mt-6 xs:text-3xl">
                {productPriceLabel(product.amountThb)}
              </p>
              <div className="mt-6 flex flex-col gap-2.5 xs:mt-7 xs:gap-3 sm:flex-row">
                <Link
                  href={`/book?service=${product.slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
                >
                  Book this
                </Link>
                <WhatsAppLink
                  cta="home-pricing"
                  serviceSlug={product.slug}
                  className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  WhatsApp
                </WhatsAppLink>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted">
          <Link href="/pricing" className="text-accent underline">
            Full pricing
          </Link>{" "}
          ·{" "}
          <Link href="/services" className="text-accent underline">
            All services
          </Link>
        </p>
      </div>
    </section>
  );
}
