"use client";

import Image from "next/image";
import Link from "next/link";
import type { TherapistBookContext } from "@/lib/therapists/booking-links";
import { therapistBookHref } from "@/lib/therapists/booking-links";
import type { PublicTherapist } from "@/lib/therapists/types";
import { therapistPrimaryPhoto } from "@/lib/therapists/public";

type Props = {
  therapist: PublicTherapist;
  dark?: boolean;
  compact?: boolean;
  bookService?: string;
  bookContext?: TherapistBookContext;
  galleryMode?: boolean;
};

export function TherapistCard({
  therapist,
  dark = false,
  compact = false,
  bookService,
  bookContext,
  galleryMode = false,
}: Props) {
  const photo = therapistPrimaryPhoto(therapist);
  const requestHref = therapistBookHref(therapist.id, {
    ...bookContext,
    service: bookContext?.service || bookService,
    serviceFallback: bookService || therapist.serviceSlugs[0],
  });

  if (galleryMode) {
    return (
      <Link
        href={`/therapists/${therapist.slug}`}
        className="group block"
      >
        <article>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#191715]">
            {photo ? (
              <Image
                src={photo}
                alt={therapist.displayName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#B8B0A3]">
                Photo coming soon
              </div>
            )}
          </div>
          <div className="pt-4">
            <h3 className="font-display text-2xl tracking-tight text-[#F5F1E8] transition group-hover:text-[#C8A96B] md:text-[1.65rem]">
              {therapist.displayName}
            </h3>
            {therapist.city ? (
              <p className="mt-1 text-sm tracking-wide text-[#B8B0A3]">{therapist.city}</p>
            ) : null}
          </div>
        </article>
      </Link>
    );
  }

  if (dark && !compact) {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-[#211F1C] ring-1 ring-[rgba(200,169,107,0.18)] transition hover:ring-[rgba(200,169,107,0.4)]">
        <Link href={`/therapists/${therapist.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#191715]">
          {photo ? (
            <Image
              src={photo}
              alt={therapist.displayName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#B8B0A3]">Photo coming soon</div>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-2xl tracking-tight text-[#F5F1E8]">{therapist.displayName}</h3>
          {therapist.city ? <p className="mt-1 text-sm text-[#B8B0A3]">{therapist.city}</p> : null}
          <Link
            href={`/therapists/${therapist.slug}`}
            className="mt-auto pt-5 text-sm font-medium text-[#C8A96B] underline-offset-4 hover:underline"
          >
            View profile →
          </Link>
        </div>
      </article>
    );
  }

  if (compact) {
    return (
      <article className="flex gap-3 rounded-sm border border-border bg-background p-3">
        <Link href={`/therapists/${therapist.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface">
          {photo ? (
            <Image src={photo} alt={therapist.displayName} fill sizes="64px" className="object-cover" />
          ) : null}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/therapists/${therapist.slug}`} className="font-display text-lg tracking-tight text-foreground hover:underline">
            {therapist.displayName}
          </Link>
          {therapist.serviceNames.length > 0 ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-accent">{therapist.serviceNames.slice(0, 3).join(" · ")}</p>
          ) : null}
          <p className="mt-1 text-xs text-muted">{therapist.city}</p>
          <Link href={requestHref} className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
            Request →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-sm bg-surface-elevated ring-1 ring-border transition hover:ring-accent/40">
      <div className="relative aspect-[3/4] shrink-0 bg-surface">
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
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl tracking-tight text-foreground">{therapist.displayName}</h3>
        {therapist.serviceNames.length > 0 ? (
          <p className="mt-3 line-clamp-2 text-sm text-accent">{therapist.serviceNames.join(" · ")}</p>
        ) : null}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            href={`/therapists/${therapist.slug}`}
            className="inline-flex min-h-10 items-center justify-center rounded-sm border border-border text-sm font-medium hover:border-accent"
          >
            Profile
          </Link>
          <Link
            href={requestHref}
            className="inline-flex min-h-10 items-center justify-center rounded-sm bg-accent text-sm font-medium text-accent-foreground"
          >
            Request
          </Link>
        </div>
      </div>
    </article>
  );
}
