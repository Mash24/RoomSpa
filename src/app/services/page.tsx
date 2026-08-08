import type { Metadata } from "next";
import Link from "next/link";
import {
  getServicePriceTiers,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { getPublicCatalog } from "@/lib/catalog/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Services | In-room massage Chiang Mai",
  description:
    "Mobile massage menu for hotels, condos, and homes in Chiang Mai — classic, therapeutic, couples, and private sessions.",
  path: "/services",
});

export default async function ServicesPage() {
  const catalog = await getPublicCatalog();
  const visibleCategories = serviceCategories.filter((category) =>
    catalog.some((service) => service.category === category.id),
  );

  return (
    <div>
      <section className="border-b border-border bg-surface px-4 py-14 xs:px-5 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Services</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Massage that comes to your room
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Choose a treatment, pick a length, and we come to you in Chiang Mai.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              Book now
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              Pricing
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="Service categories"
        className="sticky top-[3.75rem] z-30 border-b border-border bg-background/95 backdrop-blur-md md:top-[4.25rem]"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 xs:px-5 md:px-8">
          {visibleCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="shrink-0 rounded-sm border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
            >
              {category.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 xs:px-5 md:space-y-20 md:px-8 md:py-16">
        {visibleCategories.map((category) => {
          const services = catalog.filter((service) => service.category === category.id);

          return (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                {category.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                {category.summary}
              </p>
              {category.id === "sensual" ? (
                <p className="mt-3 max-w-2xl text-sm text-muted">
                  Consent first — professional bodywork, not escort services. Pause or stop anytime.
                </p>
              ) : null}

              <ul className="mt-6 divide-y divide-border border-y border-border">
                {services.map((service) => {
                  const from = getServicePriceTiers(service)[60];
                  return (
                    <li
                      key={service.slug}
                      id={service.slug}
                      className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/services/${service.slug}`}
                          className="font-display text-xl tracking-tight text-foreground transition hover:text-accent md:text-2xl"
                        >
                          {service.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted line-clamp-2">{service.summary}</p>
                        <p className="mt-2 text-sm text-accent">From {productPriceLabel(from)}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/book?service=${service.slug}`}
                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground sm:flex-none"
                        >
                          Book
                        </Link>
                        <Link
                          href={`/services/${service.slug}`}
                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm transition hover:border-accent hover:text-accent sm:flex-none"
                        >
                          Details
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Questions before you book?</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}
