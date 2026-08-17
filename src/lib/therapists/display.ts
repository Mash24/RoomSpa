import type { PublicTherapist, TherapistGender } from "@/lib/therapists/types";

export function genderLabel(gender: TherapistGender): string {
  switch (gender) {
    case "female":
      return "Female";
    case "male":
      return "Male";
    case "nonbinary":
      return "Non-binary";
    default:
      return "";
  }
}

/** e.g. Female · 27 · Thai */
export function formatTherapistHeadline(therapist: PublicTherapist): string {
  return [genderLabel(therapist.gender), therapist.age, therapist.nationality].filter(Boolean).join(" · ");
}

/** Public service coverage — never the therapist's home/base. */
export function formatAvailableLocations(therapist: PublicTherapist): string {
  const cityCountry = [therapist.city, therapist.country].filter(Boolean).join(" · ");
  const areas = therapist.serviceAreaNames.filter(Boolean);
  if (cityCountry && areas.length) {
    return `${cityCountry} · ${areas.join(" · ")}`;
  }
  return areas.join(" · ") || cityCountry || therapist.areaSummary;
}

export function formatDistanceBadge(km: number | undefined): string | null {
  if (km == null) return null;
  if (km < 1) return "Available near you";
  return `~${km.toFixed(1)} km away`;
}

export function matchesTherapistSearch(therapist: PublicTherapist, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    therapist.displayName.toLowerCase().includes(q) ||
    therapist.slug.toLowerCase().includes(q) ||
    therapist.serviceNames.some((n) => n.toLowerCase().includes(q)) ||
    therapist.serviceAreaNames.some((n) => n.toLowerCase().includes(q))
  );
}

export function matchesGenderFilter(
  therapist: PublicTherapist,
  gender: TherapistGender | "" | "any",
): boolean {
  if (!gender || gender === "any") return true;
  return therapist.gender === gender;
}
