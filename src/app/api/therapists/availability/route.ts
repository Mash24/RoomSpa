import { NextResponse } from "next/server";
import {
  getAvailableTherapists,
  validateAvailabilityQuery,
} from "@/lib/therapists/bookability";

/**
 * Therapist slot-resolution API (Phase 10D).
 *
 * Query params:
 *   service (required)
 *   date (required, YYYY-MM-DD)
 *   duration (optional, 60|90|120 — default 60)
 *   coverage, lat, lng, radius
 *   time (optional requested time HH:mm — sorts slots nearest first)
 *   inferCoverage=1 (hotel geocode path)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = {
    serviceSlug: searchParams.get("service")?.trim() ?? "",
    date: searchParams.get("date")?.trim() ?? "",
    durationMinutes: searchParams.get("duration")
      ? Number(searchParams.get("duration"))
      : undefined,
    coverageAreaSlug: searchParams.get("coverage") || undefined,
    lat: searchParams.get("lat") != null ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") != null ? Number(searchParams.get("lng")) : undefined,
    radiusKm: searchParams.get("radius") != null ? Number(searchParams.get("radius")) : undefined,
    requestedTime: searchParams.get("time") || undefined,
    inferCoverageFromLocation: searchParams.get("inferCoverage") === "1",
  };

  const validationError = validateAvailabilityQuery(query);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await getAvailableTherapists(query);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not resolve availability.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
