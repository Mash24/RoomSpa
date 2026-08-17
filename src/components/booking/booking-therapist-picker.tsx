"use client";

import Image from "next/image";
import Link from "next/link";
import type { AvailableTherapist } from "@/lib/therapists/bookability";
import type { TherapistPreference } from "@/lib/booking/types";
import { formatApproxDistance } from "@/lib/therapists/profile";
import { genderLabel } from "@/lib/therapists/display";

function formatSlot12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = Number(hStr);
  const m = mStr ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

type Props = {
  therapists: AvailableTherapist[];
  loading: boolean;
  preference: TherapistPreference;
  selectedTherapistId: string | null;
  selectedTime: string | null;
  onPreferenceChange: (pref: TherapistPreference) => void;
  onSelectTherapistSlot: (therapistId: string, time: string) => void;
  onSelectBestAvailableTime: (time: string) => void;
};

function therapistHeadline(t: AvailableTherapist): string {
  return [genderLabel(t.gender), t.age, t.height, t.nationality].filter(Boolean).join(" · ");
}

export function BookingTherapistPicker({
  therapists,
  loading,
  preference,
  selectedTherapistId,
  selectedTime,
  onPreferenceChange,
  onSelectTherapistSlot,
  onSelectBestAvailableTime,
}: Props) {
  const bookable = therapists.filter((t) => t.bookable);

  const aggregatedTimes = [...new Set(bookable.flatMap((t) => t.availableSlots))].sort();

  if (loading) {
    return <p className="text-sm text-muted">Finding available therapists for your date and location…</p>;
  }

  if (bookable.length === 0) {
    return (
      <p className="text-sm text-muted">
        No therapists are available for this service, date, and location. Try another date or area, or message us on
        WhatsApp.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Who would you like?</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-border p-3.5 text-sm transition hover:border-accent sm:p-3">
          <input
            type="radio"
            name="therapistPreference"
            checked={preference === "specific"}
            onChange={() => onPreferenceChange("specific")}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-foreground">Choose a therapist</span>
            <span className="mt-0.5 block text-xs text-muted">Pick someone available and select their time.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-border p-3.5 text-sm transition hover:border-accent sm:p-3">
          <input
            type="radio"
            name="therapistPreference"
            checked={preference === "best_available"}
            onChange={() => onPreferenceChange("best_available")}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-foreground">Best available</span>
            <span className="mt-0.5 block text-xs text-muted">
              We assign the nearest available therapist for your selected time.
            </span>
          </span>
        </label>
      </div>

      {preference === "best_available" ? (
        <div>
          <p className="text-sm text-muted">Choose a time — we&apos;ll assign the nearest available therapist.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {aggregatedTimes.map((time) => {
              const selected = selectedTime === time && !selectedTherapistId;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onSelectBestAvailableTime(time)}
                  className={`min-h-11 rounded-sm border px-3 py-2.5 text-sm transition ${
                    selected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface-elevated hover:border-accent"
                  }`}
                >
                  {formatSlot12h(time)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {bookable.map((therapist) => {
            const selected = selectedTherapistId === therapist.id;
            const distance = formatApproxDistance(therapist.distanceKm ?? undefined);

            return (
              <li
                key={therapist.id}
                className={`rounded-sm border p-4 transition ${
                  selected ? "border-accent bg-accent-soft/20" : "border-border bg-surface-elevated"
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-surface">
                    {therapist.primaryPhotoUrl ? (
                      <Image
                        src={therapist.primaryPhotoUrl}
                        alt={therapist.displayName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg tracking-tight text-foreground">{therapist.displayName}</p>
                      {therapist.verified ? (
                        <span className="text-xs font-medium text-accent">✓ Verified</span>
                      ) : null}
                    </div>
                    {distance ? <p className="mt-0.5 text-xs font-medium text-accent">{distance}</p> : null}
                    <p className="mt-1 text-xs text-muted">{therapistHeadline(therapist)}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-muted">Available</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {therapist.availableSlots.map((time) => {
                    const slotSelected = selected && selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => onSelectTherapistSlot(therapist.id, time)}
                        className={`min-h-11 rounded-sm border px-3 py-2 text-sm transition ${
                          slotSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border hover:border-accent"
                        }`}
                      >
                        {formatSlot12h(time)}
                      </button>
                    );
                  })}
                </div>

                <Link
                  href={`/therapists/${therapist.slug}`}
                  className="mt-3 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline"
                  target="_blank"
                >
                  View profile
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { formatSlot12h };
