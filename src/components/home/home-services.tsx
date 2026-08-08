import Link from "next/link";
import {
  getServicePriceTiers,
  productPriceLabel,
  type CatalogService,
} from "@/content/services";

type Props = {
  services: CatalogService[];
};

export function HomeServices({ services }: Props) {
  const picks = services.slice(0, 4);

  return (
    <section className="bg-background px-4 py-12 xs:px-5 xs:py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Services</p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            Popular treatments
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
            Delivered to your hotel, condo, or home. Full menu on Services.
          </p>
        </div>

        <ul className="mt-8 divide-y divide-border border-y border-border">
          {picks.map((service) => {
            const from = getServicePriceTiers(service)[60];
            return (
              <li
                key={service.slug}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-xl tracking-tight text-foreground md:text-2xl">
                    {service.name}
                  </p>
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
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm text-foreground transition hover:border-accent hover:text-accent sm:flex-none"
                  >
                    Details
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <Link
            href="/services"
            className="inline-flex text-sm font-medium text-accent transition hover:opacity-80"
          >
            See all services →
          </Link>
        </div>
      </div>
    </section>
  );
}
