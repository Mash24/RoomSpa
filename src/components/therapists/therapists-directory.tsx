"use client";

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
  if (initialTherapists.length === 0) {
    return (
      <p className={`text-sm ${galleryMode ? "text-[#B8B0A3]" : "text-muted"}`}>
        Therapists will appear here soon.
      </p>
    );
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {initialTherapists.map((therapist) => (
        <li key={therapist.id} className="h-full">
          <TherapistCard therapist={therapist} galleryMode={galleryMode} dark={galleryMode} />
        </li>
      ))}
    </ul>
  );
}
