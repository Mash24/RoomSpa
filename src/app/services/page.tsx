import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AutoplayVideo } from "@/components/media/autoplay-video";
import {
  categoryMedia,
  getServiceMedia,
  servicesIntroVideo,
} from "@/content/service-media";
import {
  getServicesByCategory,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Services | Mobile massage menu Chiang Mai",
  description:
    "Mobile massage with video guides — Swedish, Thai, deep tissue, couples, Nuru, Yoni, Lingam, and more at your hotel, condo, or home in Chiang Mai.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div>
      <section className="relative min-h-[52vh] overflow-hidden bg-[#121816] text-white md:min-h-[62vh]">
        <AutoplayVideo
          src={servicesIntroVideo.src}
          poster={servicesIntroVideo.poster}
          label="RoomSpa massage atmosphere"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
        <div className="relative mx-auto flex min-h-[52vh] max-w-6xl flex-col justify-end px-5 pb-12 pt-28 md:min-h-[62vh] md:px-8 md:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">Services</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight md:text-6xl">
            Massage that comes to your room
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Classic, therapeutic, couples, and consent-led sensual sessions — watch the feel of each
            category, then book the treatment you want.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex rounded-sm bg-white px-5 py-3 text-sm font-medium text-[#1a221c] transition hover:bg-white/90"
            >
              Book an appointment
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-sm border border-white/35 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="Service categories"
        className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 md:px-8">
          {serviceCategories.map((category) => (
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

      <div className="mx-auto max-w-6xl space-y-24 px-5 py-16 md:px-8 md:py-24">
        {serviceCategories.map((category) => {
          const services = getServicesByCategory(category.id);
          const media = categoryMedia[category.id];
          if (services.length === 0) return null;

          return (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  <AutoplayVideo
                    src={media.video}
                    poster={media.poster}
                    label={media.caption}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                    {category.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">
                    {category.summary}
                  </p>
                  {category.id === "sensual" ? (
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      Consent first. These are professional bodywork sessions — not escort services.
                      You can pause or stop anytime.
                    </p>
                  ) : null}
                </div>
              </div>

              <ul className="mt-10 grid gap-8 sm:grid-cols-2">
                {services.map((service) => {
                  const media = getServiceMedia(service.slug);
                  return (
                    <li
                      key={service.slug}
                      id={service.slug}
                      className="scroll-mt-28 overflow-hidden border border-border bg-surface-elevated"
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
                      <div className="relative aspect-[21/9] border-t border-border bg-surface">
                        <AutoplayVideo
                          src={media.video}
                          poster={media.image}
                          label={`${service.name} video`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-5 md:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-2xl tracking-tight text-foreground">
                          <Link href={`/services/${service.slug}`} className="transition hover:text-accent">
                            {service.name}
                          </Link>
                        </h3>
                          <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted">
                            {service.duration}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted">{service.summary}</p>
                        <p className="mt-4 font-display text-2xl text-accent">
                          {productPriceLabel(service.amountThb)}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-4">
                          <Link
                            href={`/services/${service.slug}`}
                            className="inline-flex text-sm font-medium text-foreground/80 transition hover:text-accent"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/book?service=${service.slug}`}
                            className="inline-flex text-sm font-medium text-accent transition hover:opacity-80"
                          >
                            Book {service.name}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <div className="flex flex-col gap-4 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Full rate list lives on Pricing. Questions about a sensual or therapeutic session?
            Message us before you book.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex rounded-sm border border-border px-4 py-2.5 text-sm transition hover:border-accent hover:text-accent"
            >
              Pricing
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
