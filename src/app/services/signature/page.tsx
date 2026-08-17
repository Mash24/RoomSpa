import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignatureIntro } from "@/components/signature/signature-intro";
import { SensualZone } from "@/components/sensual/sensual-zone";
import { ServiceImage } from "@/components/media/service-image";
import {
  getServicePriceTiers,
  productPriceLabel,
} from "@/content/services";
import { whatsappHref } from "@/content/site";
import { getPublicCatalog } from "@/lib/catalog/public";
import { getServicePath } from "@/lib/catalog/service-paths";
import { filterSignatureCatalog } from "@/lib/catalog/signature";
import {
  buildServiceImageMap,
  getServiceImageRows,
  mergeServiceMedia,
} from "@/lib/media/resolve-service-media";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const SIGNATURE_HERO = "/media/marketing/pricing-sensual-dark.jpg";

export const metadata: Metadata = buildPageMetadata({
  title: "Signature Experiences | Private in-room Chiang Mai",
  description:
    "Tantric, Nuru, body-to-body, Yoni, Lingam, and couples sensual massage — private consent-led Signature Experiences at your hotel, condo, or home in Chiang Mai.",
  path: "/services/signature",
});

export default async function SignatureExperiencesPage() {
  const catalog = await getPublicCatalog();
  const signature = filterSignatureCatalog(catalog);
  const imageMap = buildServiceImageMap(await getServiceImageRows());

  return (
    <SensualZone>
      <section className="relative min-h-[100svh] overflow-x-clip">
        <div className="absolute inset-0">
          <Image
            src={SIGNATURE_HERO}
            alt="Signature Experiences — warm touch, private light, intimate atmosphere"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%] animate-slow-zoom sm:object-[center_35%]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,10,9,0.62) 0%, rgba(12,10,9,0.35) 45%, rgba(12,10,9,0.55) 75%, rgba(12,10,9,0.92) 100%), linear-gradient(90deg, rgba(12,10,9,0.65) 0%, rgba(12,10,9,0.15) 48%, rgba(12,10,9,0.5) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.14] mix-blend-soft-light"
            style={{ backgroundImage: "var(--grain)" }}
            aria-hidden
          />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 xs:px-5 md:justify-center md:px-8 md:pb-24 md:pt-32">
          <p className="animate-fade-up text-[0.62rem] font-medium uppercase tracking-[0.42em] text-[#c9a86c] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] xs:text-[0.7rem]">
            RoomSpa · Signature
          </p>
          <h1 className="animate-fade-up delay-1 mt-5 max-w-2xl font-display text-[2.25rem] leading-[1.02] tracking-tight text-[#f5f0e8] drop-shadow-[0_2px_20px_rgba(0,0,0,0.65)] xs:text-5xl sm:text-6xl md:text-7xl">
            Signature Experiences
          </h1>
          <p className="animate-fade-up delay-2 mt-5 max-w-md text-[0.95rem] leading-relaxed text-[#f5f0e8]/88 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] xs:text-base md:text-lg">
            A more intimate side of RoomSpa — private, consent-led sessions delivered discreetly to
            your hotel, condo, or home.
          </p>
          <div className="animate-fade-up delay-3 mt-8 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap xs:gap-3">
            <Link
              href="#signature-menu"
              className="sensual-btn-primary inline-flex min-h-12 items-center justify-center rounded-sm px-6 py-3.5 text-sm font-medium transition"
            >
              Explore experiences
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="sensual-btn-outline inline-flex min-h-12 items-center justify-center rounded-sm border px-6 py-3.5 text-sm font-medium transition"
            >
              WhatsApp — discreet
            </a>
          </div>
          <p className="animate-fade-up delay-4 mt-10 text-[0.65rem] uppercase tracking-[0.28em] text-[#f5f0e8]/45">
            Scroll to enter
          </p>
        </div>
      </section>

      <SignatureIntro />

      <section
        id="signature-menu"
        className="scroll-mt-[calc(5rem+env(safe-area-inset-top))] border-t border-[#c9a86c]/20 bg-[#0c0a09] px-4 py-14 xs:px-5 md:px-8 md:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#c9a86c]">
            The experiences
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-[#f5f0e8] xs:text-4xl md:text-5xl">
            Choose your session
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#f5f0e8]/65 md:text-base">
            Every session below is private, consent-led, and unhurried — 60, 90, or 120 minutes in
            your space.
          </p>

          {signature.length === 0 ? (
            <p className="mt-10 text-sm text-[#f5f0e8]/60">
              Sessions updating — WhatsApp us to book Signature Experiences tonight.
            </p>
          ) : (
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {signature.map((service) => {
                const media = mergeServiceMedia(service.slug, imageMap.get(service.slug), service.name);
                const from = getServicePriceTiers(service)[60];
                return (
                  <li key={service.slug} className="group min-w-0">
                    <Link
                      href={getServicePath(service)}
                      className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-[#161311] ring-1 ring-[#c9a86c]/15 transition duration-500 group-hover:ring-[#c9a86c]/40"
                    >
                      <ServiceImage
                        media={media}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="transition duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/35 to-[#0c0a09]/10" />
                      <div className="absolute inset-0 bg-[#c9a86c]/[0.04] mix-blend-soft-light opacity-0 transition duration-500 group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="font-display text-2xl tracking-tight text-[#f5f0e8]">
                          {service.name}
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#f5f0e8]/75">
                          {service.summary}
                        </p>
                        <p className="mt-3 text-sm font-medium text-[#c9a86c]">
                          From {productPriceLabel(from)}
                        </p>
                        <span className="mt-3 inline-block text-sm text-[#f5f0e8]/80 transition group-hover:text-[#c9a86c]">
                          Explore experience →
                        </span>
                      </div>
                    </Link>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/book?service=${service.slug}`}
                        className="sensual-btn-primary inline-flex min-h-11 flex-1 items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium transition"
                      >
                        Book
                      </Link>
                      <Link
                        href={getServicePath(service)}
                        className="sensual-btn-outline inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border px-4 py-2.5 text-sm transition"
                      >
                        Details
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-14 flex flex-col gap-4 border-t border-[#c9a86c]/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-relaxed text-[#f5f0e8]/50">
              Consent first — professional intimate bodywork, not escort services. Boundaries are
              agreed before touch. You can pause or stop anytime.
            </p>
            <Link
              href="/pricing#signature"
              className="inline-flex min-h-10 shrink-0 items-center text-sm text-[#f5f0e8]/70 underline decoration-[#c9a86c]/30 underline-offset-4 transition hover:text-[#f5f0e8] hover:decoration-[#c9a86c]"
            >
              View Signature pricing →
            </Link>
          </div>
        </div>
      </section>
    </SensualZone>
  );
}
