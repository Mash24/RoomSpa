import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { COVERAGE_CENTROIDS, haversineKm, resolveNearestCoverageArea } from "@/lib/therapists/geo";
import type { CoverageAreaRecord } from "@/lib/therapists/geo";

export type CoverageAreaPoint = {
  slug: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

let cachedAreas: CoverageAreaPoint[] | null = null;
let cacheExpiry = 0;

export async function getActiveCoverageAreas(): Promise<CoverageAreaPoint[]> {
  if (cachedAreas && Date.now() < cacheExpiry) return cachedAreas;

  const supabase = createAdminishAnonClient();
  const { data } = await supabase
    .from("coverage_areas")
    .select("slug, name, city, latitude, longitude, public_label")
    .eq("is_active", true)
    .order("name");

  const fromDb: CoverageAreaPoint[] = (data || [])
    .filter((row) => row.latitude != null && row.longitude != null)
    .map((row) => ({
      slug: String(row.slug),
      name: String(row.public_label || row.name),
      city: String(row.city || ""),
      lat: Number(row.latitude),
      lng: Number(row.longitude),
    }));

  cachedAreas = fromDb.length ? fromDb : fallbackCoverageAreas();
  cacheExpiry = Date.now() + 5 * 60 * 1000;
  return cachedAreas;
}

function fallbackCoverageAreas(): CoverageAreaPoint[] {
  return Object.entries(COVERAGE_CENTROIDS).map(([slug, c]) => ({
    slug,
    name: c.name,
    city: slug.startsWith("bangkok") ? "Bangkok" : "Chiang Mai",
    lat: c.lat,
    lng: c.lng,
  }));
}

export function toCoverageAreaRecords(areas: CoverageAreaPoint[]): CoverageAreaRecord[] {
  return areas.map((a) => ({
    slug: a.slug,
    name: a.name,
    city: a.city,
    lat: a.lat,
    lng: a.lng,
  }));
}

export async function resolveCoverageAreaFromCoords(
  lat: number,
  lng: number,
  maxKm = 20,
): Promise<{ slug: string; name: string; distanceKm: number } | null> {
  const supabase = createAdminishAnonClient();
  const { data, error } = await supabase.rpc("resolve_coverage_area", {
    p_lat: lat,
    p_lng: lng,
    p_max_km: maxKm,
  });

  if (!error && data?.[0]) {
    const row = data[0] as { coverage_slug: string; coverage_name: string; distance_km: number };
    return {
      slug: row.coverage_slug,
      name: row.coverage_name,
      distanceKm: Math.round(row.distance_km * 10) / 10,
    };
  }

  const areas = await getActiveCoverageAreas();
  return resolveNearestCoverageArea(lat, lng, toCoverageAreaRecords(areas), maxKm);
}

export type GeocodeCityHint = "chiang-mai" | "bangkok" | "auto";

const BANGKOK_KEYWORDS =
  /\b(bangkok|bkk|sathorn|silom|sukhumvit|asok|phrom|thonglor|ekkamai|on nut|ari|phaya thai|ratchada|ladprao|pathum wan|bang rak|riverside|charoen krung)\b/i;

export function detectGeocodeCityHint(query: string): GeocodeCityHint {
  if (BANGKOK_KEYWORDS.test(query)) return "bangkok";
  if (/\b(chiang mai|chiangmai|nimman|old city|maya|hang dong|san sai|doi suthep)\b/i.test(query)) {
    return "chiang-mai";
  }
  return "auto";
}

export function geocodeBiasForHint(hint: GeocodeCityHint): { suffix: string; viewbox?: string } {
  switch (hint) {
    case "bangkok":
      return {
        suffix: "Bangkok, Thailand",
        viewbox: "100.3,13.5,100.9,14.0",
      };
    case "chiang-mai":
      return {
        suffix: "Chiang Mai, Thailand",
        viewbox: "98.8,18.6,99.1,18.9",
      };
    default:
      return { suffix: "Thailand" };
  }
}

export async function geocodePlace(
  query: string,
  hint: GeocodeCityHint = "auto",
): Promise<{ lat: number; lng: number; label: string; cityHint: GeocodeCityHint }> {
  const resolvedHint = hint === "auto" ? detectGeocodeCityHint(query) : hint;
  const bias = geocodeBiasForHint(resolvedHint);

  const params = new URLSearchParams({
    q: `${query}, ${bias.suffix}`,
    format: "json",
    limit: "1",
    countrycodes: "th",
  });
  if (bias.viewbox) {
    params.set("viewbox", bias.viewbox);
    params.set("bounded", "0");
  }

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": "RoomSpa/1.0 (in-room massage booking)" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error("Could not look up that location.");
  }

  const results = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const hit = results[0];
  if (!hit) {
    throw new Error("No match found. Try a hotel name or neighbourhood.");
  }

  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    label: hit.display_name.split(",").slice(0, 2).join(",").trim(),
    cityHint: resolvedHint === "auto" ? detectGeocodeCityHint(hit.display_name) : resolvedHint,
  };
}
