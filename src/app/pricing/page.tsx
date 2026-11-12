import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignatureIntro } from "@/components/signature/signature-intro";
import { SensualZone } from "@/components/sensual/sensual-zone";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { catalogServices, serviceCategories, type CatalogService } from "@/content/services";
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
const CATALOG_LOAD_TIMEOUT_MS = 5000;

async function loadCatalogForPricing() {
  try {
    return await Promise.race([
      getPublicCatalog(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Pricing catalog timed out")), CATALOG_LOAD_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return catalogServices.filter((service) => service.bookable);
  }
}

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing | Signature & wellness Thailand",
  description:
    "Signature Experiences and wellness massage pricing — 60, 90, and 120 minute private in-room sessions across Thailand.",
  path: "/pricing",
});

function PricingServiceRow({
  product,
  onDark = false,
  index,
}: {
  product: CatalogService;
  onDark?: boolean;
  index?: number;
}) {
  return (
    <li
      className={
        onDark
          ? "group border-b border-[#c9a86c]/12 py-5 last:border-b-0 md:py-6"
          : "group border-b border-border py-5 last:border-b-0 md:py-6"
      }
    >
      <div className="flex items-baseline justify-between gap-3 sm:hidden">
        <p
          className={`min-w-0 font-display text-lg leading-snug tracking-tight ${
            onDark ? "text-[#f5f0e8]" : "text-foreground"
          }`}
        >
          {index !== undefined ? (
            <span className="mr-2 text-xs font-sans font-medium tracking-[0.12em] text-accent/70">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <Link
            href={getServicePath(product)}
            className={`transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              onDark ? "hover:text-[#c9a86c]" : ""
            }`}
          >
            {product.name}
          </Link>
        </p>
        <Link
          href={`/book?service=${product.slug}`}
          className={`inline-flex min-h-11 min-w-[4.25rem] shrink-0 items-center justify-center rounded-sm px-2 text-sm font-medium underline underline-offset-4 ${
            onDark
              ? "text-[#f5f0e8] decoration-[#c9a86c]/40"
              : "text-accent decoration-accent/30"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
          Book
        </Link>
      </div>
      <div className="mt-3 sm:mt-0 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="hidden min-w-0 sm:flex sm:max-w-xs sm:items-baseline sm:gap-4 sm:pb-1">
          {index !== undefined ? (
            <span className="shrink-0 text-[0.65rem] font-medium tracking-[0.16em] text-accent/70">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
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
        <div className="w-full min-w-0 flex-1 sm:max-w-lg">
          <ServicePriceTiers service={product} onDark={onDark} />
        </div>
        <Link
          href={`/book?service=${product.slug}`}
          className={`mt-3 hidden min-h-11 min-w-[4.25rem] shrink-0 items-center justify-center rounded-sm px-2 text-sm font-medium underline underline-offset-4 sm:mt-0 sm:inline-flex ${
            onDark
              ? "text-[#f5f0e8]/85 decoration-[#c9a86c]/30 hover:text-[#f5f0e8] hover:decoration-[#c9a86c]"
              : "text-muted decoration-border hover:text-accent hover:decoration-accent"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
          Book
        </Link>
      </div>
    </li>
  );
}

export default async function PricingPage() {
  const catalog = await loadCatalogForPricing();
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
    <div className="overflow-x-clip">
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="absolute inset-0">
          <Image
            src={WELLNESS_HERO}
            alt="RoomSpa in-room massage pricing — professional wellness care"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 xs:px-5 sm:grid-cols-[1fr_auto] sm:items-end md:px-8 md:py-20">
          <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted">
            <Link href="/" className="transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Home</Link>
            <span className="mx-2 text-border" aria-hidden>/</span>
            <span className="text-accent">Pricing</span>
          </p>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.24em] text-accent">The RoomSpa rate card</p>
          <h1 className="mt-4 max-w-2xl font-display text-[2.65rem] leading-[0.92] tracking-tight text-foreground xs:text-5xl md:text-7xl">
            A private massage, brought to your room.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Clear rates for discreet in-room care across Thailand. Choose your style and duration;
            we bring the experience to your hotel, condo, or home.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 pt-4 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted">
            <span><span className="mr-2 text-accent">✦</span>In-room service</span>
            <span><span className="mr-2 text-accent">✦</span>60 · 90 · 120 min</span>
            <span><span className="mr-2 text-accent">✦</span>Clear before touch</span>
          </div>
          </div>
          <div className="hidden border-l border-border/70 pl-8 sm:block">
            <p className="font-display text-4xl text-foreground">{wellness.length + signature.length}</p>
            <p className="mt-1 max-w-[8rem] text-xs uppercase tracking-[0.16em] text-muted">ways to make the room feel better</p>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-14 xs:px-5 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {experienceTierLabels.wellness}
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground md:text-4xl">
                The wellness rate card
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
                    {products.map((product, index) => (
                      <PricingServiceRow key={product.slug} product={product} index={index} />
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
                {signature.map((product, index) => (
                  <PricingServiceRow key={product.slug} product={product} index={index} onDark />
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

      <section className="bg-surface px-4 py-14 xs:px-5 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 border-y border-border py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Ready when you are</p>
            <h2 className="mt-2 max-w-xl font-display text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Choose a duration. We&apos;ll bring the rest.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Tell us where you are staying and what you need. We&apos;ll help you find the right session.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Start your booking
            </Link>
            <WhatsAppLink
              cta="pricing-closing"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ask on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
