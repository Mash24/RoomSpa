import { unstable_cache } from "next/cache";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/public";
import { findEligibleTherapists } from "@/lib/therapists/eligibility";
import {
  computeAgeFromDob,
  formatHeightCm,
  formatWeightKg,
} from "@/lib/therapists/profile";
import {
  loadTherapistMedia,
  mapMediaRow,
  THERAPIST_PUBLIC_SELECT,
  type TherapistLocationRow,
  type TherapistMediaRow,
  type TherapistQueryRow,
} from "@/lib/therapists/query";
import { COVERAGE_CENTROIDS, haversineKm } from "@/lib/therapists/geo";
import type {
  PublicTherapist,
  TherapistFilters,
} from "@/lib/therapists/types";
import {
  deriveTherapistVerified,
  filterApprovedPublicMedia,
  isPubliclyEligibleTherapist,
} from "@/lib/therapists/visibility";

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

function isCacheableTherapistFilter(filters: TherapistFilters) {
  return !filters.lat && !filters.lng && !filters.coverageAreaSlug && !filters.search;
}

const getCachedPublicTherapists = unstable_cache(
  async (key: string): Promise<PublicTherapist[]> => {
    const filters = JSON.parse(key) as TherapistFilters;
    const result = await findEligibleTherapists(filters);
    return result.therapists;
  },
  ["public-therapists"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["therapists"] },
);

/** Eligible therapists — service + coverage + distance (Phase 10C). */
export async function getPublicTherapists(filters: TherapistFilters = {}): Promise<PublicTherapist[]> {
  if (!isCacheableTherapistFilter(filters)) {
    const result = await findEligibleTherapists(filters);
    return result.therapists;
  }

  const key = JSON.stringify({
    serviceSlug: filters.serviceSlug ?? null,
    featured: filters.featured ?? null,
    limit: filters.limit ?? null,
    gender: filters.gender ?? null,
    city: filters.city ?? null,
    radiusKm: filters.radiusKm ?? null,
    experienceTier: filters.experienceTier ?? null,
  });

  return getCachedPublicTherapists(key);
}

async function loadVisibleTherapistRelations(therapistId: string) {
  const supabase = createAdminishAnonClient();

  const [mediaRows, servicesRes, areasRes, locationRes] = await Promise.all([
    loadTherapistMedia(supabase, [therapistId], { approvedOnly: false }),
    supabase
      .from("therapist_services")
      .select("therapist_id, approved, active, services!inner(slug, name)")
      .eq("active", true)
      .eq("therapist_id", therapistId),
    supabase
      .from("therapist_service_areas")
      .select("therapist_id, coverage_areas!inner(slug, name, public_label, latitude, longitude)")
      .eq("active", true)
      .eq("therapist_id", therapistId),
    supabase.rpc("get_therapist_public_locations", { p_therapist_ids: [therapistId] }),
  ]);

  const mediaWithApproval = (mediaRows as TherapistMediaRow[]).map(mapMediaRow);
  const media = filterApprovedPublicMedia(mediaWithApproval);
  const serviceSlugs: string[] = [];
  const serviceNames: string[] = [];
  const serviceMeta: { approved: boolean; active: boolean }[] = [];
  for (const row of servicesRes.data || []) {
    const svc = row.services as { slug: string; name: string } | { slug: string; name: string }[];
    const service = Array.isArray(svc) ? svc[0] : svc;
    if (!service) continue;
    serviceSlugs.push(service.slug);
    serviceNames.push(service.name);
    serviceMeta.push({ approved: Boolean(row.approved), active: row.active !== false });
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

  return {
    media,
    mediaWithApproval,
    serviceSlugs,
    serviceNames,
    serviceMeta,
    serviceAreaSlugs,
    serviceAreaNames,
    location,
    mapCoords,
  };
}

function mapVisibleTherapist(
  row: TherapistQueryRow,
  relations: Awaited<ReturnType<typeof loadVisibleTherapistRelations>>,
): PublicTherapist | null {
  const eligibilityInput = {
    showOnGallery: row.show_on_gallery === true,
    acceptingBookings: row.accepting_bookings !== false,
    suspended: row.status === "suspended" || row.status === "inactive",
    media: relations.mediaWithApproval.map((m) => ({
      approvalStatus: (m as { approvalStatus?: "pending" | "approved" | "rejected" }).approvalStatus,
      isPrimary: m.isPrimary,
      type: m.type,
    })),
    services: relations.serviceMeta,
  };

  if (!isPubliclyEligibleTherapist(eligibilityInput)) {
    return null;
  }

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
    languages: Array.isArray(row.languages) ? row.languages.filter(Boolean) : [],
    yearsExperience: row.years_experience != null ? Number(row.years_experience) : null,
    training: row.training?.trim() || null,
    city: relations.location?.city ?? "",
    country: relations.location?.country ?? "",
    region: relations.location?.region ?? "",
    areaSummary,
    verified: deriveTherapistVerified(eligibilityInput),
    showOnGallery: row.show_on_gallery === true,
    acceptingBookings: row.accepting_bookings !== false,
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
 * Gallery-ready therapist profile — show_on_gallery + approved photo + approved service.
 */
export async function getVisibleTherapistBySlug(slug: string): Promise<PublicTherapist | null> {
  const supabase = createAdminishAnonClient();
  const { data: row, error } = await supabase
    .from("therapists")
    .select(THERAPIST_PUBLIC_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) return null;

  const relations = await loadVisibleTherapistRelations(row.id as string);
  return mapVisibleTherapist(row as TherapistQueryRow, relations);
}

/** Profile URL lookup — exists but may be hidden from the gallery. */
export async function getTherapistProfileAccess(slug: string): Promise<
  | { state: "missing" }
  | { state: "unavailable"; displayName: string }
  | { state: "ok"; therapist: PublicTherapist }
> {
  return unstable_cache(
    async (therapistSlug: string) => {
      const supabase = createAdminishAnonClient();
      const { data: row, error } = await supabase
        .from("therapists")
        .select(THERAPIST_PUBLIC_SELECT)
        .eq("slug", therapistSlug)
        .maybeSingle();

      if (error || !row) return { state: "missing" as const };

      const typed = row as TherapistQueryRow;
      if (typed.status === "suspended" || typed.status === "inactive") {
        return { state: "unavailable" as const, displayName: typed.display_name };
      }

      const relations = await loadVisibleTherapistRelations(typed.id);
      const therapist = mapVisibleTherapist(typed, relations);
      if (!therapist) {
        return { state: "unavailable" as const, displayName: typed.display_name };
      }
      return { state: "ok" as const, therapist };
    },
    ["therapist-profile-access"],
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["therapists"] },
  )(slug);
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
