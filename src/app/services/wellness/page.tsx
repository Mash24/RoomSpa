import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceImage } from "@/components/media/service-image";
import {
  getServicePriceTiers,
  productPriceLabel,
  serviceCategories,
} from "@/content/services";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { getPublicCatalog } from "@/lib/catalog/public";
import { getServicePath } from "@/lib/catalog/service-paths";
import { filterWellnessCatalog } from "@/lib/catalog/wellness";
import {
  buildServiceImageMap,
  getServiceImageRows,
  mergeServiceMedia,
} from "@/lib/media/resolve-service-media";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const WELLNESS_HERO = "/media/services/stills/v-spa.jpg";

export const metadata: Metadata = buildPageMetadata({
  title: "Wellness Massage | In-room mobile massage Chiang Mai",
  description:
    "Swedish, Thai, deep tissue, hot oil, sports, prenatal, and couples massage — professional wellness massage at your hotel, condo, or home in Chiang Mai.",
  path: "/services/wellness",
});

export default async function WellnessServicesPage() {
  const catalog = await getPublicCatalog();
  const wellness = filterWellnessCatalog(catalog);
  const imageMap = buildServiceImageMap(await getServiceImageRows());
  const wellnessCategories = serviceCategories.filter(
    (category) => category.id !== "sensual" && wellness.some((s) => s.category === category.id),
  );

  return (
    <div>
      <section className="relative overflow-x-clip border-b border-border">
        <div className="absolute inset-0">
          <Image
            src={WELLNESS_HERO}
            alt="Wellness in-room massage — calm spa atmosphere, professional care"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 xs:px-5 md:px-8 md:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Wellness Massage · Chiang Mai
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            Classic & therapeutic massage in your room
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Swedish, Thai, deep tissue, hot oil, sports, prenatal, and more — professional wellness
            massage delivered to your hotel, condo, or home.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              Book wellness massage
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="Wellness categories"
        className="sticky top-[calc(3.75rem+env(safe-area-inset-top))] z-30 border-b border-border bg-background/95 backdrop-blur-md md:top-[calc(4.25rem+env(safe-area-inset-top))]"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 scrollbar-hide xs:px-5 md:px-8">
          {wellnessCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="inline-flex min-h-10 shrink-0 items-center rounded-sm border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
            >
              {category.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 xs:px-5 md:space-y-20 md:px-8 md:py-16">
        {wellnessCategories.map((category) => {
          const services = wellness.filter((service) => service.category === category.id);

          return (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-[calc(7.5rem+env(safe-area-inset-top))] md:scroll-mt-[calc(8rem+env(safe-area-inset-top))]"
            >
              <h2 className="font-display text-[1.65rem] tracking-tight text-foreground xs:text-3xl md:text-4xl">
                {category.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                {category.summary}
              </p>

              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => {
                  const media = mergeServiceMedia(service.slug, imageMap.get(service.slug), service.name);
                  const from = getServicePriceTiers(service)[60];
                  return (
                    <li key={service.slug} className="group min-w-0">
                      <Link
                        href={getServicePath(service)}
                        className="relative block aspect-[4/3] overflow-hidden rounded-sm bg-surface ring-1 ring-border transition group-hover:ring-accent/40"
                      >
                        <ServiceImage
                          media={media}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="transition duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <p className="font-display text-xl tracking-tight text-foreground">
                            {service.name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted">{service.summary}</p>
                          <p className="mt-2 text-sm font-medium text-accent">
                            From {productPriceLabel(from)}
                          </p>
                        </div>
                      </Link>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/book?service=${service.slug}`}
                          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
                        >
                          Book
                        </Link>
                        <Link
                          href={getServicePath(service)}
                          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-sm border border-border px-3 py-2 text-sm transition hover:border-accent hover:text-accent"
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

        <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Looking for Signature Experiences?{" "}
            <Link href="/services/signature" className="text-accent underline-offset-2 hover:underline">
              Explore Signature →
            </Link>
          </p>
          <WhatsAppLink
            cta="wellness"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            WhatsApp us
          </WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
