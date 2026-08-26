/** Best-effort visitor geography from platform request headers (no client GPS). */

export type RequestGeo = {
  city: string;
  region: string;
  country: string;
};

/** ISO 3166-2 subdivision codes we care about for RoomSpa markets. */
const TH_REGION_NAMES: Record<string, string> = {
  "10": "Bangkok",
  "11": "Samut Prakan",
  "12": "Nonthaburi",
  "13": "Pathum Thani",
  "14": "Phra Nakhon Si Ayutthaya",
  "50": "Chiang Mai",
  "51": "Lamphun",
  "52": "Lampang",
  "57": "Chiang Rai",
  "83": "Phuket",
  "20": "Chon Buri",
  "21": "Rayong",
  "80": "Nakhon Si Thammarat",
  "90": "Songkhla",
  "94": "Pattani",
};

function header(request: Request, name: string) {
  const raw = request.headers.get(name);
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).trim().slice(0, 80);
  } catch {
    return raw.trim().slice(0, 80);
  }
}

/**
 * Reads Vercel geo headers first, then Cloudflare fallbacks.
 * Country is usually reliable. City is a rough IP guess — Thai mobile
 * carriers often resolve Chiang Mai (and other upcountry) traffic as Bangkok.
 */
export function readRequestGeo(request: Request): RequestGeo {
  const city =
    header(request, "x-vercel-ip-city") ||
    header(request, "cf-ipcity") ||
    header(request, "x-city") ||
    "";
  const region =
    header(request, "x-vercel-ip-country-region") ||
    header(request, "cf-region-code") ||
    header(request, "x-region") ||
    "";
  const country =
    header(request, "x-vercel-ip-country") ||
    header(request, "cf-ipcountry") ||
    header(request, "x-country") ||
    "";

  return {
    city,
    region,
    country: country.toUpperCase(),
  };
}

export function regionDisplayName(country: string, regionCode: string) {
  const code = regionCode.replace(/^TH-?/i, "").trim();
  if (country.toUpperCase() === "TH" && TH_REGION_NAMES[code]) {
    return TH_REGION_NAMES[code];
  }
  return regionCode;
}

/** Prefer province/region name when city is missing; never invent precision. */
export function formatGeoLabel(geo: Pick<RequestGeo, "city" | "region" | "country">) {
  const country = geo.country.trim().toUpperCase();
  const regionName = geo.region ? regionDisplayName(country, geo.region) : "";
  const city = geo.city.trim();

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (regionName && country) return `${regionName}, ${country}`;
  if (country) return country;
  return "";
}
