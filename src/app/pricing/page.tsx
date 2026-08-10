import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getServicePriceTiers,
  serviceCategories,
} from "@/content/services";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { whatsappHref } from "@/content/site";
import { getPublicCatalog } from "@/lib/catalog/public";
import { formatThb } from "@/lib/currency";

export const dynamic = "force-dynamic";

/** Hands-on massage still — visibly sensual, darkened for price typography. */
const PRICING_BACKDROP = "/media/marketing/pricing-sensual-body.jpg";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RoomSpa in-room massage pricing for 60 min, 90 min, and 2 hours in Chiang Mai — private sessions delivered to your hotel, condo, or home.",
};

export default async function PricingPage() {
  const catalog = await getPublicCatalog();
  const fromPrice = catalog.length
    ? Math.min(...catalog.map((p) => getServicePriceTiers(p)[60]))
    : 0;

  return (
    <section className="relative min-h-[100svh] overflow-x-clip text-white">
      <div className="absolute inset-0">
        <Image
          src={PRICING_BACKDROP}
          alt="Private in-room massage — warm hands, soft light, quiet luxury"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%] sm:object-[center_32%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,8,7,0.45) 0%, rgba(6,8,7,0.28) 35%, rgba(6,8,7,0.4) 70%, rgba(6,8,7,0.55) 100%), linear-gradient(90deg, rgba(6,8,7,0.5) 0%, rgba(6,8,7,0.18) 50%, rgba(6,8,7,0.35) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-12 xs:px-5 xs:pt-14 sm:pb-12 md:px-8 md:pb-16 md:pt-20">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] xs:text-xs">
          Pricing · Chiang Mai
        </p>
        <h1 className="mt-3 max-w-xl font-display text-[2rem] leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] xs:text-4xl sm:text-5xl md:text-6xl">
          Choose your length. We’ll come to you.
        </h1>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] xs:mt-4 xs:text-base md:text-lg">
          Soft light, warm oil, and a private session in your hotel, condo, or home — 60 minutes, 90
          minutes, or a full two hours.
        </p>
        <div className="mt-6 flex flex-col gap-3 xs:mt-7 xs:flex-row xs:flex-wrap xs:items-center xs:gap-x-6">
          <Link
            href="/book"
            className="inline-flex min-h-11 items-center text-sm font-medium text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
          >
            Book a private massage
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-medium text-white/85 transition hover:text-white"
          >
            WhatsApp us
          </a>
        </div>

        <p className="mt-10 max-w-xl text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] xs:mt-12 md:mt-14 md:text-base">
          Every treatment is delivered to your room. Pay by card when you book, pay later, or cash on
          arrival.
        </p>

        <div className="mt-8 space-y-12 xs:mt-10 md:mt-12 md:space-y-16">
          {serviceCategories.map((category) => {
            const products = catalog.filter((p) => p.category === category.id);
            if (products.length === 0) return null;

            return (
              <div key={category.id}>
                <h2 className="font-display text-[1.65rem] tracking-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)] xs:text-2xl md:text-3xl">
                  {category.title}
                </h2>
                <ul className="mt-2">
                  {products.map((product) => (
                    <li
                      key={product.slug}
                      className="border-b border-white/10 py-5 last:border-b-0 md:py-6"
                    >
                      <div className="flex items-baseline justify-between gap-3 sm:hidden">
                        <p className="min-w-0 font-display text-lg leading-snug tracking-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
                          {product.name}
                        </p>
                        <Link
                          href={`/book?service=${product.slug}`}
                          className="shrink-0 text-sm font-medium tracking-wide text-white underline decoration-white/35 underline-offset-4"
                        >
                          Book
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                        <div className="hidden min-w-0 sm:block sm:max-w-xs sm:pb-1">
                          <p className="font-display text-xl tracking-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)] md:text-2xl">
                            {product.name}
                          </p>
                        </div>
                        <div className="w-full min-w-0 flex-1 sm:max-w-md">
                          <ServicePriceTiers service={product} onDark />
                        </div>
                        <Link
                          href={`/book?service=${product.slug}`}
                          className="mt-3 hidden min-h-10 shrink-0 items-center text-sm font-medium tracking-wide text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white sm:mt-0 sm:inline-flex"
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

        {fromPrice > 0 ? (
          <p className="mt-10 text-sm leading-relaxed text-white/80 xs:mt-12">
            From {formatThb(fromPrice)}. Want something tailored?{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-white/35 underline-offset-2 transition hover:decoration-white"
            >
              WhatsApp us
            </a>
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}
