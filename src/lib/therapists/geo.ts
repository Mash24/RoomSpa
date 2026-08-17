/** Haversine distance in km between two WGS84 points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.asin(Math.sqrt(a));
}

export function isWithinRadius(
  userLat: number,
  userLng: number,
  therapistLat: number | null,
  therapistLng: number | null,
  radiusKm: number,
): boolean {
  if (therapistLat == null || therapistLng == null) return false;
  return haversineKm(userLat, userLng, therapistLat, therapistLng) <= radiusKm;
}

/** Coverage zone centroids — fallback when DB columns missing */
export const COVERAGE_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  "chiang-mai-old-city": { lat: 18.7883, lng: 98.9853, name: "Old City / Center" },
  "chiang-mai-nimman": { lat: 18.799, lng: 98.968, name: "Nimman / University area" },
  "chiang-mai-airport": { lat: 18.7669, lng: 98.9628, name: "Airport / Hang Dong corridor" },
  "bangkok-sathorn": { lat: 13.7234, lng: 100.5348, name: "Sathorn" },
  "bangkok-silom": { lat: 13.7244, lng: 100.534, name: "Silom" },
  "bangkok-sukhumvit": { lat: 13.7386, lng: 100.5615, name: "Sukhumvit" },
};

export type CoverageAreaRecord = {
  slug: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

/** Nearest active coverage zone within maxKm — TS fallback when RPC unavailable. */
export function resolveNearestCoverageArea(
  lat: number,
  lng: number,
  areas: CoverageAreaRecord[],
  maxKm = 20,
): { slug: string; name: string; distanceKm: number } | null {
  let best: { slug: string; name: string; distanceKm: number } | null = null;
  for (const area of areas) {
    const distanceKm = haversineKm(lat, lng, area.lat, area.lng);
    if (distanceKm <= maxKm && (!best || distanceKm < best.distanceKm)) {
      best = { slug: area.slug, name: area.name, distanceKm: Math.round(distanceKm * 10) / 10 };
    }
  }
  return best;
}
