"use client";

import { useMemo, useState } from "react";
import { TherapistCard } from "@/components/therapists/therapist-card";
import type { PublicTherapist } from "@/lib/therapists/types";

type ServiceOption = { slug: string; name: string; signature?: boolean };

type Props = {
  initialTherapists: PublicTherapist[];
  /** @deprecated Gallery no longer uses service filters */
  serviceOptions?: ServiceOption[];
  cityOptions?: string[];
  galleryMode?: boolean;
};

export function TherapistsDirectory({
  initialTherapists,
  galleryMode = false,
}: Props) {
  const [selectedCity, setSelectedCity] = useState("All");

  const cities = useMemo(
    () => Array.from(new Set(initialTherapists.map((therapist) => therapist.city).filter(Boolean))),
    [initialTherapists],
  );
  const visibleTherapists = useMemo(
    () =>
      selectedCity === "All"
        ? initialTherapists
        : initialTherapists.filter((therapist) => therapist.city === selectedCity),
    [initialTherapists, selectedCity],
  );

  if (initialTherapists.length === 0) {
    return (
      <p className={`text-sm ${galleryMode ? "text-[#B8B0A3]" : "text-muted"}`}>
        Therapists will appear here soon.
      </p>
    );
  }

  const filterLabel = (city: string) => `Show therapists in ${city}`;

  return (
    <>
      {cities.length > 0 ? (
        <div className="mb-9 flex flex-wrap items-center gap-2" aria-label="Filter therapists by city">
          <span className="sr-only">Filter by city</span>
          {["All", ...cities].map((city) => {
            const active = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                aria-pressed={active}
                aria-label={city === "All" ? "Show all therapists" : filterLabel(city)}
                onClick={() => setSelectedCity(city)}
                className={`min-h-10 rounded-full border px-4 text-sm transition ${
                  active
                    ? "border-[#C8A96B] bg-[#C8A96B] text-[#11100F]"
                    : "border-[rgba(200,169,107,0.28)] text-[#B8B0A3] hover:border-[#C8A96B] hover:text-[#F5F1E8]"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      ) : null}
      {visibleTherapists.length === 0 ? (
        <p className="text-sm text-[#B8B0A3]">No therapists are currently listed in this city.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {visibleTherapists.map((therapist) => (
        <li key={therapist.id} className="h-full">
          <TherapistCard therapist={therapist} galleryMode={galleryMode} dark={galleryMode} />
        </li>
          ))}
        </ul>
      )}
    </>
  );
}
