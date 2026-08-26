/** Best-effort visitor geography from platform request headers (no client GPS). */

export type RequestGeo = {
  city: string;
  region: string;
  country: string;
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
 * City is approximate (IP-based); empty on localhost / missing headers.
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

export function formatGeoLabel(geo: Pick<RequestGeo, "city" | "region" | "country">) {
  const bits = [geo.city, geo.region, geo.country].filter(Boolean);
  return bits.join(", ") || "";
}
