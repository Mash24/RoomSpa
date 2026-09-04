import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignatureIntro } from "@/components/signature/signature-intro";
import { SensualZone } from "@/components/sensual/sensual-zone";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { serviceCategories, type CatalogService } from "@/content/services";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { experienceTierLabels } from "@/lib/catalog/experience-tier";
import { getPublicCatalog } from "@/lib/catalog/public";
import { filterSignatureCatalog } from "@/lib/catalog/signature";
import { filterWellnessCatalog } from "@/lib/catalog/wellness";
import { formatThb } from "@/lib/currency";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getServicePath } from "@/lib/catalog/service-paths";

export const revalidate = 60;

const WELLNESS_HERO = "/media/services/stills/v-hands.jpg";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing | Signature & wellness Thailand",
  description:
    "Signature Experiences and wellness massage pricing — 60, 90, and 120 minute private in-room sessions across Thailand.",
  path: "/pricing",
});

function PricingServiceRow({
  product,
  onDark = false,
}: {
  product: CatalogService;
  onDark?: boolean;
}) {
  return (
    <li
      className={
        onDark
          ? "border-b border-[#c9a86c]/12 py-5 last:border-b-0 md:py-6"
          : "border-b border-border py-5 last:border-b-0 md:py-6"
      }
    >
      <div className="flex items-baseline justify-between gap-3 sm:hidden">
        <p
          className={`min-w-0 font-display text-lg leading-snug tracking-tight ${
            onDark ? "text-[#f5f0e8]" : "text-foreground"
          }`}
        >
          {product.name}
        </p>
        <Link
          href={`/book?service=${product.slug}`}
          className={`shrink-0 text-sm font-medium underline underline-offset-4 ${
            onDark
              ? "text-[#f5f0e8] decoration-[#c9a86c]/40"
              : "text-accent decoration-accent/30"
          }`}
        >
          Book
        </Link>
      </div>
      <div className="mt-3 sm:mt-0 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="hidden min-w-0 sm:block sm:max-w-xs sm:pb-1">
          <Link
            href={getServicePath(product)}
            className={`font-display text-xl tracking-tight transition md:text-2xl ${
              onDark
                ? "text-[#f5f0e8] hover:text-[#c9a86c]"
                : "text-foreground hover:text-accent"
            }`}
          >
            {product.name}
          </Link>
        </div>
        <div className="w-full min-w-0 flex-1 sm:max-w-md">
          <ServicePriceTiers service={product} onDark={onDark} />
        </div>
        <Link
          href={`/book?service=${product.slug}`}
          className={`mt-3 hidden min-h-10 shrink-0 items-center text-sm font-medium underline underline-offset-4 sm:mt-0 sm:inline-flex ${
            onDark
              ? "text-[#f5f0e8]/85 decoration-[#c9a86c]/30 hover:text-[#f5f0e8] hover:decoration-[#c9a86c]"
              : "text-muted decoration-border hover:text-accent hover:decoration-accent"
          }`}
        >
          Book
        </Link>
      </div>
    </li>
  );
}

export default async function PricingPage() {
  const catalog = await getPublicCatalog();
  const wellness = filterWellnessCatalog(catalog);
  const signature = filterSignatureCatalog(catalog);

  const wellnessCategories = serviceCategories.filter(
    (category) =>
      category.id !== "sensual" && wellness.some((s) => s.category === category.id),
  );

  const wellnessFrom = wellness.length
    ? Math.min(...wellness.map((p) => p.amountThb))
    : 0;
  const signatureFrom = signature.length
    ? Math.min(...signature.map((p) => p.amountThb))
    : 0;

  return (
    <div>
      {/* Page hero — neutral RoomSpa brand */}
      <section className="relative overflow-x-clip border-b border-border bg-surface">
        <div className="absolute inset-0">
          <Image
            src={WELLNESS_HERO}
            alt="RoomSpa in-room massage pricing — professional wellness care"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-14 xs:px-5 md:px-8 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Pricing · Chiang Mai
          </p>
          <h1 className="mt-3 max-w-xl font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            RoomSpa pricing
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            Two distinct experiences — Wellness Massage and Signature Experiences — each with 60, 90,
            and 120 minute options. We come to your hotel, condo, or home.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              Book a massage
            </Link>
            <WhatsAppLink
              cta="pricing"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              WhatsApp us
            </WhatsAppLink>
          </div>
        </div>
      </section>

      {/* Wellness pricing — light spa treatment */}
      <section className="bg-background px-4 py-14 xs:px-5 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {experienceTierLabels.wellness}
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground md:text-4xl">
                Classic & therapeutic massage
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted md:text-base">
                Swedish · Thai · Deep Tissue · Hot Oil · Sports · Prenatal · Couples · and more.
              </p>
            </div>
            <Link
              href="/services/wellness"
              className="inline-flex min-h-10 shrink-0 items-center text-sm font-medium text-accent underline underline-offset-4"
            >
              Explore Wellness →
            </Link>
          </div>

          <div className="mt-10 space-y-12 md:space-y-14">
            {wellnessCategories.map((category) => {
              const products = wellness.filter((p) => p.category === category.id);
              if (products.length === 0) return null;

              return (
                <div key={category.id}>
                  <h3 className="font-display text-xl tracking-tight text-foreground md:text-2xl">
                    {category.title}
                  </h3>
                  <ul className="mt-3">
                    {products.map((product) => (
                      <PricingServiceRow key={product.slug} product={product} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {wellnessFrom > 0 ? (
            <p className="mt-10 text-sm text-muted">
              Wellness from {formatThb(wellnessFrom)} · Pay by card when you book, pay later, or cash
              on arrival.
            </p>
          ) : null}
        </div>
      </section>

      {/* Signature threshold + pricing — same dark treatment as /services/signature */}
      <div id="signature">
      <SensualZone>
        <SignatureIntro />
        <section className="px-4 pb-16 pt-4 xs:px-5 md:px-8 md:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#c9a86c]">
                  {experienceTierLabels.signature}
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-[#f5f0e8] md:text-4xl">
                  Intimate private sessions
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#f5f0e8]/65 md:text-base">
                  Tantric · Nuru · Body-to-Body · Yoni · Lingam · Couples Sensual · and more.
                </p>
              </div>
              <Link
                href="/services/signature"
                className="inline-flex min-h-10 shrink-0 items-center text-sm font-medium text-[#f5f0e8] underline decoration-[#c9a86c]/40 underline-offset-4 transition hover:decoration-[#c9a86c]"
              >
                Explore Signature →
              </Link>
            </div>

            {signature.length === 0 ? (
              <p className="mt-10 text-sm text-[#f5f0e8]/60">
                Signature pricing updating — WhatsApp us for current rates.
              </p>
            ) : (
              <ul className="mt-10">
                {signature.map((product) => (
                  <PricingServiceRow key={product.slug} product={product} onDark />
                ))}
              </ul>
            )}

            {signatureFrom > 0 ? (
              <p className="mt-10 text-sm text-[#f5f0e8]/55">
                Signature from {formatThb(signatureFrom)} · Discreet arrival · Consent-led sessions.
              </p>
            ) : null}

            <p className="mt-8 max-w-xl border-t border-[#c9a86c]/15 pt-8 text-xs leading-relaxed text-[#f5f0e8]/45">
              Professional intimate bodywork only — not escort services. Boundaries agreed before
              touch.
            </p>
          </div>
        </section>
      </SensualZone>
      </div>
    </div>
  );
}
