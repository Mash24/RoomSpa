import Image from "next/image";
import Link from "next/link";
import { site, whatsappHref } from "@/content/site";

const HERO_IMAGE = "/media/services/stills/v-spa.jpg";

export function HomeHero() {
  const { hero } = site;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#121816] text-white">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Therapist preparing an in-room massage at a guest stay in Chiang Mai"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] animate-slow-zoom sm:object-center"
        />
        <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        <div
          className="absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] xs:px-5 sm:pb-20 md:justify-center md:px-8 md:pb-24 md:pt-24">
        <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.22em] text-white/75">
          In-room massage · Chiang Mai
        </p>

        <p className="animate-fade-up delay-1 mt-4 font-display text-[2.75rem] leading-[0.95] tracking-tight text-white xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
          {hero.brand}
        </p>

        <h1 className="animate-fade-up delay-2 mt-4 max-w-xl font-display text-[1.45rem] font-normal leading-snug tracking-tight text-white/95 xs:text-2xl sm:text-3xl md:mt-5 md:text-4xl">
          {hero.headline}
        </h1>

        <p className="animate-fade-up delay-3 mt-3 max-w-md text-[0.95rem] leading-relaxed text-white/75 xs:mt-4 xs:text-base md:text-lg">
          {hero.support}
        </p>

        <p className="animate-fade-up delay-3 mt-4 text-sm font-medium tracking-wide text-white/90">
          Hotel · Condo · Home
          <span className="mx-2 text-white/35" aria-hidden>
            ·
          </span>
          We come to you
        </p>

        <div className="animate-fade-up delay-4 mt-7 flex w-full flex-col gap-2.5 xs:mt-8 xs:gap-3 sm:max-w-md sm:flex-row sm:items-center">
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
