import Image from "next/image";
import Link from "next/link";
import {
  getServiceFromAmount,
  productPriceLabel,
  type CatalogService,
} from "@/content/services";
import { getServicePath } from "@/lib/catalog/service-paths";

type Props = {
  services: CatalogService[];
};

const SIGNATURE_BACKDROP = "/media/marketing/home-hero-sensual.jpg";

/** Compact signature teaser — full menu lives on /services/signature only. */
export function HomeSignaturePreview({ services }: Props) {
  const picks = services.slice(0, 4);

  return (
    <section className="sensual-zone relative overflow-x-clip">
      <div className="absolute inset-0">
        <Image
          src={SIGNATURE_BACKDROP}
          alt="Signature Experiences — warm light, private atmosphere, intimate touch"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%] sm:object-[center_35%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,10,9,0.5) 0%, rgba(12,10,9,0.28) 38%, rgba(12,10,9,0.55) 100%), linear-gradient(105deg, rgba(12,10,9,0.55) 0%, rgba(12,10,9,0.1) 50%, rgba(12,10,9,0.4) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="page-gutter page-section relative mx-auto max-w-6xl xl:max-w-7xl">
        <div className="max-w-xl xl:max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#c9a86c] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] xs:text-xs">
            Signature Experiences
          </p>
          <h2 className="mt-3 font-display text-[1.65rem] leading-tight tracking-tight text-[#f5f0e8] drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] min-[360px]:text-[1.85rem] xs:text-4xl md:text-5xl">
            What guests ask for most
          </h2>
          <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-[#f5f0e8]/88 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] xs:text-base">
            Tantric, Nuru, body-to-body, Yoni, Lingam, and couples — consent-led, discreet, and
            unhurried in your room across Thailand.
          </p>
        </div>

        <ul className="mt-8 divide-y divide-[#c9a86c]/20 border-y border-[#c9a86c]/20 xs:mt-10">
          {picks.map((service) => {
            const from = getServiceFromAmount(service);
            return (
              <li
                key={service.slug}
                className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:py-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[1.25rem] tracking-tight text-[#f5f0e8] xs:text-xl md:text-2xl">
                    {service.name}
                  </p>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#f5f0e8]/80 line-clamp-2">
                    {service.summary}
                  </p>
                  <p className="mt-2.5 text-sm font-medium text-[#c9a86c]">
                    From {productPriceLabel(from)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:justify-end">
                  <Link
                    href={`/book?service=${service.slug}`}
                    className="sensual-btn-primary inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium sm:min-w-[5.5rem]"
                  >
                    Book
                  </Link>
                  <Link
                    href={getServicePath(service)}
                    className="sensual-btn-outline inline-flex min-h-11 items-center justify-center rounded-sm border px-4 py-2.5 text-sm sm:min-w-[5.5rem]"
                  >
                    Explore
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 xs:mt-10">
          <Link
            href="/services/signature"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[#f5f0e8] underline decoration-[#c9a86c]/50 underline-offset-4 transition hover:decoration-[#c9a86c]"
          >
            Full Signature menu →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** @deprecated Use HomeSignaturePreview */
export { HomeSignaturePreview as HomeSensualServices };
