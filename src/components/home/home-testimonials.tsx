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
  const shown = items;

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 340), behavior: "smooth" });
  };

  return (
    <section className="bg-background px-4 py-12 xs:px-5 xs:py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Reviews</p>
            <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
              What guests say
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              {fromGuests
                ? "Straight from guests who booked RoomSpa at their hotel, condo, or home."
                : "Calm, private, and easy to book — without leaving your room."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/reviews#write-review"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              Share your visit
            </Link>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground transition hover:border-accent hover:text-accent"
                aria-label="Scroll reviews left"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground transition hover:border-accent hover:text-accent"
                aria-label="Scroll reviews right"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide xs:px-5 md:px-8"
      >
        {shown.map((item) => (
          <blockquote
            key={`${item.name}-${item.quote.slice(0, 24)}`}
            className="w-[78vw] shrink-0 snap-start border-t border-border bg-surface-elevated p-5 sm:w-[300px] md:w-[320px]"
          >
            <p className="font-display text-xl leading-snug tracking-tight text-foreground md:text-2xl">
              “{item.quote}”
            </p>
            <footer className="mt-4">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted">{item.detail}</p>
            </footer>
          </blockquote>
        ))}

        <div className="flex w-[78vw] shrink-0 snap-start flex-col justify-between border border-dashed border-accent/40 bg-accent-soft/40 p-5 sm:w-[300px] md:w-[320px]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Your turn</p>
            <p className="mt-3 font-display text-2xl leading-snug tracking-tight text-foreground md:text-3xl">
              Had a session in your room?
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tell the next guest what it felt like — arrival, pressure, privacy, the whole visit.
            </p>
          </div>
          <Link
            href="/reviews#write-review"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border border-accent bg-background px-4 py-2.5 text-sm font-medium text-accent transition hover:bg-accent hover:text-accent-foreground"
          >
            Add your review →
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 xs:px-5 md:px-8">
        <Link href="/reviews" className="text-sm font-medium text-accent transition hover:opacity-80">
          All reviews →
        </Link>
        <Link
          href="/reviews#write-review"
          className="text-sm text-muted underline-offset-4 transition hover:text-accent hover:underline"
        >
          Write one in under a minute
        </Link>
      </div>
    </section>
  );
}
