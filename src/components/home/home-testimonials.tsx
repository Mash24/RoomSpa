"use client";

import { useRef } from "react";
import Link from "next/link";

export type HomeTestimonialItem = {
  quote: string;
  name: string;
  detail: string;
};

type Props = {
  items: HomeTestimonialItem[];
  fromGuests?: boolean;
};

export function HomeTestimonials({ items, fromGuests = false }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 380), behavior: "smooth" });
  };

  return (
    <section className="bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Reviews</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
              Guests keep coming back
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              {fromGuests
                ? "Recent feedback from guests who booked RoomSpa at their hotel, condo, or home."
                : "Travelers, expats, and couples choose RoomSpa for privacy and calm — without leaving the room."}
            </p>
            <Link
              href="/reviews"
              className="mt-4 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
            >
              Read & write reviews →
            </Link>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-accent hover:text-accent"
              aria-label="Scroll reviews left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-accent hover:text-accent"
              aria-label="Scroll reviews right"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide md:px-8"
      >
        {items.map((item) => (
          <blockquote
            key={`${item.name}-${item.quote.slice(0, 24)}`}
            className="w-[85vw] shrink-0 snap-start border-t border-border bg-surface-elevated p-6 sm:w-[340px] md:w-[380px]"
          >
            <p className="font-display text-2xl leading-snug tracking-tight text-foreground">
              “{item.quote}”
            </p>
            <footer className="mt-6">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{item.detail}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
