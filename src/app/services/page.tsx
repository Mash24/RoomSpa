import type { Metadata } from "next";
import Link from "next/link";
import {
  getServicesByCategory,
  productPriceLabel,
  serviceAcceptsCardNow,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Mobile massage at your hotel, condo, or home — Swedish, Thai, deep tissue, couples, Nuru, Yoni, Lingam, tantric, and more.",
};

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Services</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Every massage that travels well
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        From classic spa work to consent-led sensual and tantric sessions — all delivered in your
        private space. Boundaries are always confirmed before we begin.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Book an appointment
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Ask on WhatsApp
        </a>
      </div>

      <div className="mt-16 space-y-16">
        {serviceCategories.map((category) => {
          const services = getServicesByCategory(category.id);
          if (services.length === 0) return null;

          return (
            <div key={category.id} id={category.id}>
              <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                {category.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                {category.summary}
              </p>

              <ul className="mt-8 grid gap-6 md:grid-cols-2">
                {services.map((service) => (
                  <li
                    key={service.slug}
                    id={service.slug}
                    className="scroll-mt-28 border border-border bg-surface-elevated p-6 md:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-2xl tracking-tight text-foreground">
                        {service.name}
                      </h3>
                      <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted">
                        {service.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{service.summary}</p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">{service.details}</p>
                    <p className="mt-5 font-display text-2xl text-accent">
                      {productPriceLabel(service.amountThb)}
                    </p>
                    {!serviceAcceptsCardNow(service) ? (
                      <p className="mt-2 text-xs text-muted">
                        Book with cash or card later · online card-now coming for this service
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-muted">Cash · card later · card now</p>
                    )}
                    <Link
                      href={`/book?service=${service.slug}`}
                      className="mt-5 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
                    >
                      Book {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-16 border border-border bg-surface p-6 md:p-8">
        <h2 className="font-display text-2xl text-foreground">Consent & privacy</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          Sensual, Nuru, Yoni, Lingam, and tantric sessions are professional bodywork with clear
          consent. You can pause or stop at any time. We do not offer escort services. Hotel staff
          interactions stay discreet and professional.
        </p>
      </div>
    </section>
  );
}
