"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const TREATMENTS = [
  { label: "Swedish Massage", slug: "swedish" },
  { label: "Thai Massage", slug: "thai" },
  { label: "Deep Tissue", slug: "deep-tissue" },
  { label: "Couples Massage", slug: "couples" },
] as const;

const DURATIONS = [
  { label: "60 min", value: "60" },
  { label: "90 min", value: "90" },
  { label: "120 min", value: "120" },
] as const;

const PLACE_TYPES = ["Hotel", "Condo", "Home"] as const;

/**
 * Homepage booking strip — platform cue without stuffing the hero.
 * Sends guests into /book with service + duration prefilled.
 */
export function HomeBookStrip() {
  const [treatment, setTreatment] = useState<string>(TREATMENTS[0].slug);
  const [duration, setDuration] = useState<string>(DURATIONS[0].value);
  const [placeType, setPlaceType] = useState<(typeof PLACE_TYPES)[number]>("Hotel");

  const href = useMemo(() => {
    const params = new URLSearchParams({
      service: treatment,
      duration,
    });
    return `/book?${params.toString()}`;
  }, [treatment, duration]);

  return (
    <section className="border-b border-border bg-surface-elevated">
      <div className="mx-auto max-w-6xl px-4 py-7 xs:px-5 md:px-8 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Book your massage
            </p>
            <p className="mt-2 font-display text-2xl tracking-tight text-foreground md:text-3xl">
              We come to your room tonight
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">City</span>
                <span className="mt-1.5 flex min-h-11 items-center border border-border bg-background px-3 text-sm font-medium text-foreground">
                  Chiang Mai
                </span>
              </label>

              <label className="block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">Treatment</span>
                <select
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-background px-3 text-sm text-foreground"
                >
                  {TREATMENTS.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">Duration</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-background px-3 text-sm text-foreground"
                >
                  {DURATIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">We come to</span>
                <select
                  value={placeType}
                  onChange={(e) => setPlaceType(e.target.value as (typeof PLACE_TYPES)[number])}
                  className="mt-1.5 block min-h-11 w-full border border-border bg-background px-3 text-sm text-foreground"
                >
                  {PLACE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <Link
            href={href}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Check availability →
          </Link>
        </div>
      </div>
    </section>
  );
}
