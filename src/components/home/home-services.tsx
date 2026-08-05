import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { catalogProducts, productPriceLabel } from "@/content/services";
import { getServiceMedia } from "@/content/service-media";

const pricesBySlug = Object.fromEntries(
  catalogProducts.map((product) => [product.slug, product.amountThb]),
);

export function HomeServices() {
  return (
    <section className="bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Services</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Treatments that travel with you
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            A short look at popular sessions. Full menu with videos lives on the Services page.
          </p>
        </div>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2">
          {site.services.map((service, index) => {
            const price = pricesBySlug[service.slug];
            const media = getServiceMedia(service.slug);

            return (
              <li
                key={service.slug}
                className="animate-fade-up overflow-hidden border border-border bg-surface-elevated"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={media.image}
                    alt={media.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl tracking-tight text-foreground">
                      {service.title}
                    </h3>
                    <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted">
                      {service.duration}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                    {service.summary}
                  </p>
                  {price ? (
                    <p className="mt-4 text-sm font-medium text-accent">{productPriceLabel(price)}</p>
                  ) : null}
                  <Link
                    href={`/services#${service.slug}`}
                    className="mt-5 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
                  >
                    View details
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/services"
            className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            All services & videos
          </Link>
          <Link
            href="/pricing"
            className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            Full pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
