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
  const q = searchParams.get("q")?.trim();
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
      cityHint: geocoded.cityHint,
      coverage: resolvedCoverage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Location lookup failed.";
    const status = message.includes("No match") ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
