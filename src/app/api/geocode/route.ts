import { NextResponse } from "next/server";
import {
  detectGeocodeCityHint,
  geocodePlace,
  resolveCoverageAreaFromCoords,
  type GeocodeCityHint,
} from "@/lib/therapists/coverage-areas";

/** Geocode a hotel, condo, or area — returns coordinates + nearest coverage zone. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const q = searchParams.get("q")?.trim();

  if (latParam != null && lngParam != null && !q) {
    const lat = Number(latParam);
    const lng = Number(lngParam);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
    }
    try {
      const { reverseGeocode } = await import("@/lib/therapists/coverage-areas");
      const reversed = await reverseGeocode(lat, lng);
      if (!reversed) {
        return NextResponse.json({ error: "Could not resolve that location." }, { status: 404 });
      }
      const resolvedCoverage = await resolveCoverageAreaFromCoords(reversed.lat, reversed.lng);
      return NextResponse.json({
        lat: reversed.lat,
        lng: reversed.lng,
        label: reversed.label,
        city: reversed.city,
        region: reversed.region,
        country: reversed.country,
        cityHint: reversed.cityHint,
        coverage: resolvedCoverage,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Location lookup failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (!q || q.length < 3) {
    return NextResponse.json({ error: "Enter a hotel, condo, or area name." }, { status: 400 });
  }

  const cityParam = searchParams.get("city")?.trim().toLowerCase();
  const hint: GeocodeCityHint =
    cityParam === "bangkok" || cityParam === "chiang-mai" ? cityParam : "auto";

  try {
    const geocoded = await geocodePlace(q, hint === "auto" ? detectGeocodeCityHint(q) : hint);
    const resolvedCoverage = await resolveCoverageAreaFromCoords(geocoded.lat, geocoded.lng);

    return NextResponse.json({
      lat: geocoded.lat,
      lng: geocoded.lng,
      label: geocoded.label,
      city: geocoded.city,
      region: geocoded.region,
      country: geocoded.country,
      cityHint: geocoded.cityHint,
      coverage: resolvedCoverage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Location lookup failed.";
    const status = message.includes("No match") ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
