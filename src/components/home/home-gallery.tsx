"use client";

import Image from "next/image";
import { useRef } from "react";
import { gallery } from "@/content/marketing";

export function HomeGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 420), behavior: "smooth" });
  };

  return (
    <section className="bg-surface px-4 py-12 xs:px-5 xs:py-14 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Atmosphere</p>
            <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
              Feel the room before you book
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
              Soft light, quiet focus, and professional care — delivered wherever you are staying.
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-accent hover:text-accent"
              aria-label="Scroll gallery left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-accent hover:text-accent"
              aria-label="Scroll gallery right"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide xs:mt-10 xs:gap-4 xs:px-5 md:px-8"
        style={{ scrollPaddingInline: "1rem" }}
      >
        {gallery.map((item) => (
          <figure
            key={item.src}
            className="relative h-[280px] w-[min(78vw,20rem)] shrink-0 snap-start overflow-hidden xs:h-[320px] sm:h-[380px] sm:w-[360px] md:w-[420px]"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 78vw, 420px"
              className="object-cover transition duration-700 hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-14 text-sm text-white xs:px-5 xs:pb-5 xs:pt-16">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
