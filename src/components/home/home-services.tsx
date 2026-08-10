import Image from "next/image";
import Link from "next/link";
import {
  getServicePriceTiers,
  productPriceLabel,
  type CatalogService,
} from "@/content/services";

type Props = {
  services: CatalogService[];
};

/** Warm oil-drop still — sensual & different from /pricing body backdrop. */
const FEATURED_BACKDROP = "/media/marketing/home-featured-sensual.jpg";

export function HomeServices({ services }: Props) {
  const picks = services.slice(0, 6);

  return (
    <section className="relative overflow-x-clip text-white">
      <div className="absolute inset-0">
        <Image
          src={FEATURED_BACKDROP}
          alt="Warm oil poured for a private in-room massage"
          fill
          sizes="100vw"
          className="object-cover object-[center_40%] sm:object-[center_45%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,10,9,0.42) 0%, rgba(8,10,9,0.28) 32%, rgba(8,10,9,0.38) 68%, rgba(8,10,9,0.55) 100%), linear-gradient(105deg, rgba(8,10,9,0.48) 0%, rgba(8,10,9,0.14) 52%, rgba(8,10,9,0.32) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 xs:px-5 xs:py-14 md:px-8 md:py-20">
        <div className="max-w-xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] xs:text-xs">
            Private & sensual
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)] xs:text-4xl md:text-5xl">
            Featured experiences
          </h2>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)] xs:text-base md:text-lg">
            Consent-led private sessions delivered to your hotel, condo, or home — discreet and
            professional.
          </p>
        </div>

        <ul className="mt-8 divide-y divide-white/20 border-y border-white/20">
          {picks.map((service) => {
            const from = getServicePriceTiers(service)[60];
            return (
              <li
                key={service.slug}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-xl tracking-tight text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)] md:text-2xl">
                    {service.name}
                  </p>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/95 line-clamp-2 drop-shadow-[0_1px_10px_rgba(0,0,0,0.65)] md:text-[0.95rem]">
                    {service.summary}
                  </p>
                  <p className="mt-2.5 text-sm font-medium text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.65)]">
                    From {productPriceLabel(from)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/book?service=${service.slug}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm bg-white px-4 py-2.5 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 sm:flex-none"
                  >
                    Book
                  </Link>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-white/35 px-4 py-2.5 text-sm text-white transition hover:border-white hover:bg-white/10 sm:flex-none"
                  >
                    Details
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:gap-x-6">
          <Link
            href="/services#sensual"
            className="inline-flex min-h-11 items-center text-sm font-medium text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
          >
            Private & sensual →
          </Link>
          <Link
            href="/services#classic"
            className="inline-flex min-h-11 items-center text-sm font-medium text-white/75 transition hover:text-white"
          >
            Wellness & therapeutic →
          </Link>
        </div>
      </div>
    </section>
  );
}
