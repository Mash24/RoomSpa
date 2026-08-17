import Image from "next/image";
import Link from "next/link";
import { site, whatsappHref } from "@/content/site";

/** Neutral premium spa still — balanced brand, not signature-first. */
const HERO_IMAGE = "/media/services/stills/v-spa.jpg";

export function HomeHero() {
  const { hero } = site;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#121816] text-white">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Private in-room massage — calm spa atmosphere, soft light, premium care"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-slow-zoom"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,8,7,0.58) 0%, rgba(6,8,7,0.38) 42%, rgba(6,8,7,0.52) 78%, rgba(6,8,7,0.72) 100%), linear-gradient(105deg, rgba(6,8,7,0.5) 0%, rgba(6,8,7,0.15) 50%, rgba(6,8,7,0.45) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.14] mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] xs:px-5 sm:pb-20 md:justify-center md:px-8 md:pb-24 md:pt-24">
        <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.22em] text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
          {hero.eyebrow}
        </p>

        <p className="animate-fade-up delay-1 mt-3 font-display text-[2.35rem] leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] min-[360px]:text-[2.75rem] xs:mt-4 xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
          {hero.brand}
        </p>

        <h1 className="animate-fade-up delay-2 mt-3 max-w-xl font-display text-[1.35rem] font-normal leading-snug tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] xs:mt-4 xs:text-2xl sm:text-3xl md:text-4xl">
          {hero.headline}
        </h1>

        <p className="animate-fade-up delay-3 mt-4 max-w-lg text-[0.9rem] leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] xs:text-base">
          {hero.support}
        </p>

        <div className="animate-fade-up delay-4 mt-6 flex w-full flex-col gap-2.5 xs:mt-7 xs:gap-3 sm:max-w-md sm:flex-row sm:items-center">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm bg-white px-5 py-3.5 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 sm:flex-none"
          >
            {hero.primaryCta.label}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm border border-white/35 px-5 py-3.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 sm:flex-none"
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
