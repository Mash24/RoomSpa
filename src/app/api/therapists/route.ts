import { NextResponse } from "next/server";
import { findEligibleTherapists } from "@/lib/therapists/eligibility";
import type { TherapistGender } from "@/lib/therapists/types";

/**
 * Location-eligible therapists for discovery (Phase 10C).
 * Does not check availability — that is Phase 10D.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceSlug = searchParams.get("service") || undefined;
  const coverageAreaSlug = searchParams.get("coverage") || undefined;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusKm = searchParams.get("radius");
  const featured = searchParams.get("featured") === "1";
  const limit = searchParams.get("limit");
  const gender = (searchParams.get("gender") || undefined) as TherapistGender | "any" | undefined;
  const search = searchParams.get("q") || undefined;
  const inferCoverage = searchParams.get("inferCoverage") === "1";

  const city = searchParams.get("city") || undefined;
  const cityWide = searchParams.get("cityWide") === "1" || Boolean(city);

  const result = await findEligibleTherapists({
    serviceSlug,
    coverageAreaSlug,
    lat: lat != null ? Number(lat) : undefined,
    lng: lng != null ? Number(lng) : undefined,
    radiusKm: radiusKm != null ? Number(radiusKm) : undefined,
    featured: featured || undefined,
    limit: limit != null ? Number(limit) : undefined,
    gender: gender && gender !== "any" ? gender : undefined,
    search,
    inferCoverageFromLocation: inferCoverage && !cityWide,
    city,
    cityWide,
  });

  return NextResponse.json({
    therapists: result.therapists,
    eligibility: result.meta,
  });
}
