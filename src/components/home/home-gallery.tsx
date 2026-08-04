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
    <section className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Atmosphere</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
              Feel the room before you book
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              Soft light, quiet focus, and professional care — delivered wherever you are staying.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
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
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide md:px-8"
        style={{ scrollPaddingInline: "1.25rem" }}
      >
        {gallery.map((item) => (
          <figure
            key={item.src}
            className="relative h-[320px] w-[78vw] shrink-0 snap-start overflow-hidden sm:h-[380px] sm:w-[360px] md:w-[420px]"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 78vw, 420px"
              className="object-cover transition duration-700 hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-16 text-sm text-white">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
