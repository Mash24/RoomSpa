/** Compute display age from date of birth; returns null if DOB missing or showAge is false. */
export function computeAgeFromDob(
  dateOfBirth: string | null | undefined,
  showAge = true,
): number | null {
  if (!showAge || !dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 18 && age <= 99 ? age : null;
}

export function formatHeightCm(heightCm: number | null | undefined, show = true): string | null {
  if (!show || heightCm == null) return null;
  return `${heightCm} cm`;
}

export function formatWeightKg(weightKg: number | null | undefined, show = true): string | null {
  if (!show || weightKg == null) return null;
  return `${weightKg} kg`;
}

export function formatApproxDistance(km: number | null | undefined): string | null {
  if (km == null) return null;
  if (km < 1) return "Available near you";
  return `~${km.toFixed(1)} km away`;
}
