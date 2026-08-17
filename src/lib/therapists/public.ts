import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { findEligibleTherapists } from "@/lib/therapists/eligibility";
import {
  computeAgeFromDob,
  formatHeightCm,
  formatWeightKg,
} from "@/lib/therapists/profile";
import {
  mapMediaRow,
  type TherapistLocationRow,
  type TherapistMediaRow,
  type TherapistQueryRow,
} from "@/lib/therapists/query";
import { COVERAGE_CENTROIDS, haversineKm } from "@/lib/therapists/geo";
import type {
  PublicTherapist,
  PublicTherapistMedia,
  TherapistFilters,
} from "@/lib/therapists/types";

export { findEligibleTherapists } from "@/lib/therapists/eligibility";
export { assignBestAvailableTherapist } from "@/lib/therapists/assignment";
export { getAvailableTherapists, isTherapistBookableAt } from "@/lib/therapists/bookability";
export type { AvailabilityQuery, AvailabilityResult, AvailableTherapist } from "@/lib/therapists/bookability";
export type {
  EligibilityMeta,
  EligibilityResult,
  LocationEligibilityQuery,
  ResolvedCoverage,
} from "@/lib/therapists/eligibility";

/** Eligible therapists — service + coverage + distance (Phase 10C). */
export async function getPublicTherapists(filters: TherapistFilters = {}): Promise<PublicTherapist[]> {
  const result = await findEligibleTherapists(filters);
  return result.therapists;
}

async function loadVisibleTherapistRelations(therapistId: string) {
  const supabase = createAdminishAnonClient();

  const [mediaRes, servicesRes, areasRes, locationRes] = await Promise.all([
    supabase
      .from("therapist_media")
      .select("id, therapist_id, url, media_type, thumbnail_url, alt_text, sort_order, is_primary")
      .eq("therapist_id", therapistId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("therapist_services")
      .select("therapist_id, services!inner(slug, name)")
      .eq("active", true)
      .eq("therapist_id", therapistId),
    supabase
      .from("therapist_service_areas")
      .select("therapist_id, coverage_areas!inner(slug, name, public_label, latitude, longitude)")
      .eq("active", true)
      .eq("therapist_id", therapistId),
    supabase.rpc("get_therapist_public_locations", { p_therapist_ids: [therapistId] }),
  ]);

  const media = ((mediaRes.data || []) as TherapistMediaRow[]).map(mapMediaRow);
  const serviceSlugs: string[] = [];
  const serviceNames: string[] = [];
  for (const row of servicesRes.data || []) {
    const svc = row.services as { slug: string; name: string } | { slug: string; name: string }[];
    const service = Array.isArray(svc) ? svc[0] : svc;
    if (!service) continue;
    serviceSlugs.push(service.slug);
    serviceNames.push(service.name);
  }

  const serviceAreaSlugs: string[] = [];
  const serviceAreaNames: string[] = [];
  const areaRecords: { slug: string; lat: number; lng: number }[] = [];
  for (const row of areasRes.data || []) {
    const area = row.coverage_areas as
      | { slug: string; name: string; public_label?: string; latitude?: number; longitude?: number }
      | { slug: string; name: string; public_label?: string; latitude?: number; longitude?: number }[];
    const cov = Array.isArray(area) ? area[0] : area;
    if (!cov) continue;
    serviceAreaSlugs.push(cov.slug);
    serviceAreaNames.push(cov.public_label || cov.name);
    if (cov.latitude != null && cov.longitude != null) {
      areaRecords.push({ slug: cov.slug, lat: Number(cov.latitude), lng: Number(cov.longitude) });
    }
  }

  let location: TherapistLocationRow | undefined;
  if (locationRes.data?.[0]) {
    location = locationRes.data[0] as TherapistLocationRow;
  }

  let mapCoords: { lat: number; lng: number } | null = null;
  if (serviceAreaSlugs.length) {
    const firstSlug = serviceAreaSlugs[0]!;
    const fromDb = areaRecords.find((a) => a.slug === firstSlug);
    const fromStatic = COVERAGE_CENTROIDS[firstSlug];
    mapCoords = fromDb ?? fromStatic ?? null;
  }

  return { media, serviceSlugs, serviceNames, serviceAreaSlugs, serviceAreaNames, location, mapCoords };
}

function mapVisibleTherapist(
  row: TherapistQueryRow,
  relations: Awaited<ReturnType<typeof loadVisibleTherapistRelations>>,
): PublicTherapist {
  const sortedMedia = [...relations.media].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  const areaSummary =
    relations.location?.public_area_summary ||
    (relations.serviceAreaNames.length
      ? `Usually available around ${relations.serviceAreaNames.join(", ")}`
      : "");

  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    gender: (row.gender as PublicTherapist["gender"]) || "unspecified",
    age: computeAgeFromDob(row.date_of_birth, row.show_age),
    height: formatHeightCm(row.height_cm, row.show_height),
    weight: formatWeightKg(row.weight_kg, row.show_weight),
    nationality: row.show_nationality ? row.nationality : null,
    ethnicity: row.show_ethnicity ? row.ethnicity : null,
    bio: row.bio,
    city: relations.location?.city ?? "",
    country: relations.location?.country ?? "",
    region: relations.location?.region ?? "",
    areaSummary,
    verified: row.verified,
    featured: row.featured,
    media: sortedMedia,
    serviceSlugs: relations.serviceSlugs,
    serviceNames: relations.serviceNames,
    serviceAreaSlugs: relations.serviceAreaSlugs,
    serviceAreaNames: relations.serviceAreaNames,
    mapLatitude: relations.mapCoords?.lat ?? null,
    mapLongitude: relations.mapCoords?.lng ?? null,
  };
}

/**
 * Visible therapist profile — does not require location eligibility.
 * Bookability at a specific time is checked separately (Phase 10D).
 */
export async function getVisibleTherapistBySlug(slug: string): Promise<PublicTherapist | null> {
  const supabase = createAdminishAnonClient();
  const { data: row, error } = await supabase
    .from("therapists")
    .select(
      "id, slug, display_name, gender, date_of_birth, height_cm, weight_kg, nationality, ethnicity, bio, featured, sort_order, show_age, show_height, show_weight, show_ethnicity, show_nationality, verified",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) return null;

  const relations = await loadVisibleTherapistRelations(row.id as string);
  return mapVisibleTherapist(row as TherapistQueryRow, relations);
}

/** @deprecated Alias — use getVisibleTherapistBySlug for profile pages. */
export async function getPublicTherapistBySlug(slug: string): Promise<PublicTherapist | null> {
  return getVisibleTherapistBySlug(slug);
}

export async function getTherapistsForService(
  serviceSlug: string,
  options?: { coverageAreaSlug?: string; limit?: number; lat?: number; lng?: number; radiusKm?: number },
): Promise<PublicTherapist[]> {
  const result = await findEligibleTherapists({
    serviceSlug,
    coverageAreaSlug: options?.coverageAreaSlug,
    lat: options?.lat,
    lng: options?.lng,
    radiusKm: options?.radiusKm,
    limit: options?.limit,
  });
  return result.therapists;
}

export function therapistPrimaryPhoto(therapist: PublicTherapist): string | null {
  const primary = therapist.media.find((p) => p.isPrimary && p.type === "photo");
  const firstPhoto = therapist.media.find((p) => p.type === "photo");
  return primary?.url ?? firstPhoto?.url ?? null;
}

export function formatTherapistLocation(therapist: PublicTherapist): string {
  const parts = [therapist.city, therapist.region, therapist.country].filter(Boolean);
  if (therapist.areaSummary) parts.unshift(therapist.areaSummary);
  return parts.join(" · ");
}

export { genderLabel } from "@/lib/therapists/display";
export { COVERAGE_CENTROIDS, haversineKm };
export { formatApproxDistance } from "@/lib/therapists/profile";
export {
  formatAvailableLocations,
  formatDistanceBadge,
  formatTherapistHeadline,
} from "@/lib/therapists/display";
