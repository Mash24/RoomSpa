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

/** Public service coverage — neighbourhood, city, province, country. */
export function formatAvailableLocations(therapist: PublicTherapist): string {
  const place = [therapist.areaSummary, therapist.city, therapist.region, therapist.country].filter(Boolean);
  const uniquePlace = place.filter((part, i) => place.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === i);
  const cityCountry = uniquePlace.join(" · ");
  const areas = therapist.serviceAreaNames.filter(
    (name) => !uniquePlace.some((part) => part.toLowerCase() === name.toLowerCase()),
  );
  if (cityCountry && areas.length) {
    return `${cityCountry} · ${areas.join(" · ")}`;
  }
  return areas.join(" · ") || cityCountry;
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
    therapist.serviceAreaNames.some((n) => n.toLowerCase().includes(q)) ||
    therapist.areaSummary.toLowerCase().includes(q) ||
    therapist.city.toLowerCase().includes(q) ||
    therapist.region.toLowerCase().includes(q) ||
    therapist.country.toLowerCase().includes(q)
  );
}

export function matchesGenderFilter(
  therapist: PublicTherapist,
  gender: TherapistGender | "" | "any",
): boolean {
  if (!gender || gender === "any") return true;
  return therapist.gender === gender;
}
