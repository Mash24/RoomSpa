import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=2400&q=80";

export function HomeHero() {
  const { hero } = site;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#121816] text-white">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Calm massage setting with soft natural light"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        <div
          className="absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{ backgroundImage: "var(--grain)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-24">
        <p className="animate-fade-up font-display text-5xl leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          {hero.brand}
        </p>
        <h1 className="animate-fade-up delay-1 mt-5 max-w-xl font-display text-2xl font-normal leading-snug tracking-tight text-white/95 sm:text-3xl md:mt-6 md:text-4xl">
          {hero.headline}
        </h1>
        <p className="animate-fade-up delay-2 mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
          {hero.support}
        </p>
        <div className="animate-fade-up delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex items-center justify-center rounded-sm bg-white px-6 py-3.5 text-sm font-medium text-[#1a221c] transition hover:bg-white/90"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-sm border border-white/35 px-6 py-3.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
