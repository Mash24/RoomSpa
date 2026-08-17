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

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
};

export type GeocodedPlace = {
  lat: number;
  lng: number;
  label: string;
  city: string;
  region: string;
  country: string;
  cityHint: GeocodeCityHint;
};

function cleanPlacePart(value?: string) {
  return (value || "")
    .replace(/\b(province|changwat|chang wat|county|district|amphoe)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cityFromNominatimAddress(address?: NominatimAddress): string {
  return (
    cleanPlacePart(address?.city) ||
    cleanPlacePart(address?.town) ||
    cleanPlacePart(address?.municipality) ||
    cleanPlacePart(address?.county) ||
    ""
  );
}

export function regionFromNominatimAddress(address?: NominatimAddress): string {
  return cleanPlacePart(address?.state) || cleanPlacePart(address?.county) || "";
}

/** Map a geocoded pin to Chiang Mai / Bangkok so city-wide browse matches admin city fields. */
export function canonicalMarketplaceCity(input: {
  city?: string;
  region?: string;
  country?: string;
  label?: string;
  cityHint?: GeocodeCityHint;
}): string {
  const blob = [input.city, input.region, input.label, input.country].filter(Boolean).join(" ");
  const hint =
    input.cityHint && input.cityHint !== "auto" ? input.cityHint : detectGeocodeCityHint(blob);
  if (hint === "bangkok") return "Bangkok";
  if (hint === "chiang-mai") return "Chiang Mai";
  return (input.city || input.region || "").trim();
}

export async function geocodePlace(
  query: string,
  hint: GeocodeCityHint = "auto",
): Promise<GeocodedPlace> {
  const resolvedHint = hint === "auto" ? detectGeocodeCityHint(query) : hint;
  const bias = geocodeBiasForHint(resolvedHint);

  const params = new URLSearchParams({
    q: `${query}, ${bias.suffix}`,
    format: "json",
    limit: "1",
    countrycodes: "th",
    addressdetails: "1",
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

  const results = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
    address?: NominatimAddress;
  }[];
  const hit = results[0];
  if (!hit) {
    throw new Error("No match found. Try a hotel name or neighbourhood.");
  }

  const cityRaw = cityFromNominatimAddress(hit.address);
  const region = regionFromNominatimAddress(hit.address);
  const country = cleanPlacePart(hit.address?.country) || "Thailand";
  const cityHint = resolvedHint === "auto" ? detectGeocodeCityHint(`${cityRaw} ${region} ${hit.display_name}`) : resolvedHint;
  const city = canonicalMarketplaceCity({
    city: cityRaw,
    region,
    country,
    label: hit.display_name,
    cityHint,
  });

  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    label: hit.display_name.split(",").slice(0, 2).join(",").trim(),
    city,
    region,
    country,
    cityHint,
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
    zoom: "14",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { "User-Agent": "RoomSpa/1.0 (in-room massage booking)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const hit = (await res.json()) as {
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: NominatimAddress;
  };
  if (!hit?.address && !hit?.display_name) return null;

  const cityRaw = cityFromNominatimAddress(hit.address);
  const region = regionFromNominatimAddress(hit.address);
  const country = cleanPlacePart(hit.address?.country) || "Thailand";
  const cityHint = detectGeocodeCityHint(`${cityRaw} ${region} ${hit.display_name || ""}`);
  const city = canonicalMarketplaceCity({
    city: cityRaw,
    region,
    country,
    label: hit.display_name,
    cityHint,
  });

  return {
    lat,
    lng,
    label: (hit.display_name || "").split(",").slice(0, 2).join(",").trim() || city,
    city,
    region,
    country,
    cityHint,
  };
}
