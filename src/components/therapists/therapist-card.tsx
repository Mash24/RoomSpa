"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicTherapist } from "@/lib/therapists/types";
import {
  formatAvailableLocations,
  formatDistanceBadge,
  formatTherapistHeadline,
  therapistPrimaryPhoto,
} from "@/lib/therapists/public";
import { therapistBookHref, type TherapistBookContext } from "@/lib/therapists/booking-links";

type Props = {
  therapist: PublicTherapist;
  dark?: boolean;
  compact?: boolean;
  bookService?: string;
  bookContext?: TherapistBookContext;
};

export function TherapistCard({
  therapist,
  dark = false,
  compact = false,
  bookService,
  bookContext,
}: Props) {
  const photo = therapistPrimaryPhoto(therapist);
  const headline = formatTherapistHeadline(therapist);
  const locations = formatAvailableLocations(therapist);
  const distance = formatDistanceBadge(therapist.distanceKm);
  const bookHref = therapistBookHref(therapist.id, {
    ...bookContext,
    service: bookService || bookContext?.service,
    serviceFallback: therapist.serviceSlugs[0],
  });

  if (compact) {
    return (
      <article className="flex gap-3 rounded-sm border border-border bg-background p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface">
          {photo ? (
            <Image src={photo} alt={therapist.displayName} fill sizes="64px" className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg tracking-tight text-foreground">{therapist.displayName}</p>
          {therapist.serviceNames.length > 0 ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-accent">{therapist.serviceNames.slice(0, 3).join(" · ")}</p>
          ) : null}
          <p className="mt-1 text-xs text-muted">{locations}</p>
          {distance ? <p className="mt-1 text-xs font-medium text-accent">{distance}</p> : null}
          <div className="mt-2 flex gap-2">
            <Link
              href={`/therapists/${therapist.slug}`}
              className="inline-flex min-h-9 items-center justify-center rounded-sm border border-border px-2.5 text-xs font-medium hover:border-accent"
            >
              Profile
            </Link>
            <Link
              href={bookHref}
              className="inline-flex min-h-9 items-center justify-center rounded-sm bg-accent px-2.5 text-xs font-medium text-accent-foreground"
            >
              Book
            </Link>
          </div>
        </div>
      </article>
    );
  }

  const ring = dark ? "ring-[#c9a86c]/15 hover:ring-[#c9a86c]/40" : "ring-border hover:ring-accent/40";
  const bg = dark ? "bg-[#161311]" : "bg-surface-elevated";

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-sm ring-1 transition ${ring} ${bg}`}>
      <div className={`relative aspect-[3/4] shrink-0 ${dark ? "bg-[#0c0a09]" : "bg-surface"}`}>
        {photo ? (
          <Image
            src={photo}
            alt={therapist.displayName}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Photo coming soon</div>
        )}
        {distance ? (
          <span
            className={`absolute left-3 top-3 rounded-sm px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
              dark ? "bg-[#0c0a09]/90 text-[#c9a86c]" : "bg-background/95 text-accent"
            }`}
          >
            {distance}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-display text-xl tracking-tight ${dark ? "text-[#f5f0e8]" : "text-foreground"}`}>
            {therapist.displayName}
          </h3>
          {therapist.verified ? (
            <span className={`text-xs font-medium ${dark ? "text-[#c9a86c]" : "text-accent"}`}>✓ Verified</span>
          ) : null}
        </div>

        {headline ? (
          <p className={`mt-1 text-sm ${dark ? "text-[#f5f0e8]/70" : "text-muted"}`}>{headline}</p>
        ) : null}

        {therapist.height ? (
          <p className={`mt-0.5 text-sm ${dark ? "text-[#f5f0e8]/55" : "text-muted"}`}>{therapist.height}</p>
        ) : null}

        {therapist.serviceNames.length > 0 ? (
          <p className={`mt-3 line-clamp-2 text-sm leading-snug ${dark ? "text-[#c9a86c]/95" : "text-accent"}`}>
            {therapist.serviceNames.join(" · ")}
          </p>
        ) : null}

        {locations ? (
          <p className={`mt-2 text-sm leading-snug ${dark ? "text-[#f5f0e8]/75" : "text-muted"}`}>
            <span aria-hidden>📍 </span>
            {locations}
          </p>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            href={`/therapists/${therapist.slug}`}
            className={`inline-flex min-h-10 items-center justify-center rounded-sm text-sm font-medium transition ${
              dark
                ? "border border-[#c9a86c]/35 text-[#f5f0e8] hover:border-[#c9a86c]"
                : "border border-border text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            Profile
          </Link>
          <Link
            href={bookHref}
            className={`inline-flex min-h-10 items-center justify-center rounded-sm text-sm font-medium ${
              dark ? "sensual-btn-primary" : "bg-accent text-accent-foreground"
            }`}
          >
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}
