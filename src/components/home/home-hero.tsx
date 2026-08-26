import Image from "next/image";
import Link from "next/link";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { site } from "@/content/site";

/** Signature-forward hero — intimate, private atmosphere. */
const HERO_IMAGE = "/media/marketing/home-hero-sensual.jpg";

export function HomeHero() {
  const { hero } = site;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#0c0a09] text-[#f5f0e8]">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Private Signature massage — warm light, intimate atmosphere, delivered to your room"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] animate-slow-zoom sm:object-[center_35%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,10,9,0.62) 0%, rgba(12,10,9,0.4) 42%, rgba(12,10,9,0.55) 78%, rgba(12,10,9,0.78) 100%), linear-gradient(105deg, rgba(12,10,9,0.55) 0%, rgba(12,10,9,0.12) 50%, rgba(12,10,9,0.5) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] xs:px-5 sm:pb-20 md:justify-center md:px-8 md:pb-24 md:pt-24">
        <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.22em] text-[#c9a86c] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
          {hero.eyebrow}
        </p>

        <p className="animate-fade-up delay-1 mt-3 font-display text-[2.35rem] leading-[0.95] tracking-tight text-[#f5f0e8] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] min-[360px]:text-[2.75rem] xs:mt-4 xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
          {hero.brand}
        </p>

        <h1 className="animate-fade-up delay-2 mt-3 max-w-xl font-display text-[1.35rem] font-normal leading-snug tracking-tight text-[#f5f0e8] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] xs:mt-4 xs:text-2xl sm:text-3xl md:text-4xl">
          {hero.headline}
        </h1>

        <p className="animate-fade-up delay-3 mt-4 max-w-lg text-[0.9rem] leading-relaxed text-[#f5f0e8]/88 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] xs:text-base">
          {hero.support}
        </p>

        <div className="animate-fade-up delay-4 mt-6 flex w-full flex-col gap-2.5 xs:mt-7 xs:gap-3 sm:max-w-lg sm:flex-row sm:items-center">
          <Link
            href={hero.primaryCta.href}
            className="sensual-btn-primary inline-flex min-h-12 flex-1 items-center justify-center rounded-sm px-5 py-3.5 text-sm font-medium sm:flex-none"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="sensual-btn-outline inline-flex min-h-12 flex-1 items-center justify-center rounded-sm border px-5 py-3.5 text-sm font-medium sm:flex-none"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
        <WhatsAppLink
          cta="hero"
          className="animate-fade-up delay-4 mt-3 inline-flex text-sm text-[#c9a86c] underline decoration-[#c9a86c]/40 underline-offset-4 transition hover:decoration-[#c9a86c]"
        >
          Or WhatsApp us →
        </WhatsAppLink>
      </div>
    </section>
  );
}
