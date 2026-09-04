/**
 * Location eligibility — Phase 10C
 *
 * Three distinct marketplace states (NOT one database flag):
 *
 * - **Visible** — therapist has a published profile (`getVisibleTherapistBySlug`)
 * - **Eligible** — offers the service, covers the area, and can reach the client location (this module)
 * - **Bookable** — eligible + available at the requested time (Phase 10D)
 *
 * Pipeline:
 *   client location → geocode → lat/lng → service filter → coverage check → distance → sort nearest
 */

import { createAdminishAnonClient } from "@/lib/supabase/anon";
import {
  resolveCoverageAreaFromCoords,
  type GeocodeCityHint,
} from "@/lib/therapists/coverage-areas";
import {
  matchesGenderFilter,
  matchesTherapistSearch,
} from "@/lib/therapists/display";
import { haversineKm } from "@/lib/therapists/geo";
import {
  computeAgeFromDob,
  formatHeightCm,
  formatWeightKg,
} from "@/lib/therapists/profile";
import {
  buildTherapistFiltersRpc,
  loadTherapistMedia,
  mapMediaRow,
  THERAPIST_PUBLIC_SELECT,
  type EligibleTherapistRow,
  type TherapistLocationRow,
  type TherapistMediaRow,
  type TherapistQueryRow,
} from "@/lib/therapists/query";
import type {
  PublicTherapist,
  PublicTherapistMedia,
  TherapistFilters,
} from "@/lib/therapists/types";
import {
  deriveTherapistVerified,
  isPubliclyEligibleTherapist,
} from "@/lib/therapists/visibility";
import { isSignatureExperience, getCatalogProduct } from "@/content/services";

export type ClientLocation = {
  lat: number;
  lng: number;
  label?: string;
  source?: "gps" | "geocode";
};

export type ResolvedCoverage = {
  slug: string;
  name: string;
  distanceKm: number;
};

export type EligibilityMeta = {
  clientLocation?: ClientLocation;
  resolvedCoverage?: ResolvedCoverage | null;
  filtersApplied: {
    serviceSlug?: string;
    coverageAreaSlug?: string;
    locationBased: boolean;
    searchRadiusKm: number;
  };
};

export type EligibilityResult = {
  therapists: PublicTherapist[];
  meta: EligibilityMeta;
};

export type LocationEligibilityQuery = TherapistFilters & {
  /** When true, infer coverage slug from client coordinates (hotel search). Ignored for GPS-only. */
  inferCoverageFromLocation?: boolean;
  /** Browse by city instead of travel radius (directory / map). Booking still uses radius. */
  cityWide?: boolean;
};

function mapTherapist(
  row: TherapistQueryRow,
  location: TherapistLocationRow | undefined,
  media: PublicTherapistMedia[],
  serviceSlugs: string[],
  serviceNames: string[],
  serviceAreaSlugs: string[],
  serviceAreaNames: string[],
  mapCoords: { lat: number; lng: number } | null,
  distanceKm?: number,
  eligibility?: {
    media: Array<{ approvalStatus?: "pending" | "approved" | "rejected"; isPrimary: boolean; type?: string }>;
    services: Array<{ approved: boolean; active?: boolean }>;
  },
): PublicTherapist | null {
  const eligibilityInput = {
    showOnGallery: row.show_on_gallery === true,
    acceptingBookings: row.accepting_bookings !== false,
    suspended: row.status === "suspended" || row.status === "inactive",
    media: eligibility?.media ?? media.map((m) => ({ isPrimary: m.isPrimary, type: m.type, approvalStatus: "approved" as const })),
    services: eligibility?.services ?? serviceSlugs.map(() => ({ approved: true, active: true })),
  };

  if (!isPubliclyEligibleTherapist(eligibilityInput)) {
    return null;
  }

  const sortedMedia = [...media].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  const areaSummary =
    location?.public_area_summary ||
    (serviceAreaNames.length ? `Usually available around ${serviceAreaNames.join(", ")}` : "");

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
    city: location?.city ?? "",
    country: location?.country ?? "",
    region: location?.region ?? "",
    areaSummary,
    verified: deriveTherapistVerified(eligibilityInput),
    showOnGallery: row.show_on_gallery === true,
    acceptingBookings: row.accepting_bookings !== false,
    featured: row.featured,
    media: sortedMedia,
    serviceSlugs,
    serviceNames,
    serviceAreaSlugs,
    serviceAreaNames,
    mapLatitude: mapCoords?.lat ?? null,
    mapLongitude: mapCoords?.lng ?? null,
    distanceKm,
  };
}

function resolveMapCoords(
  serviceAreaSlugs: string[],
  areaRecords: { slug: string; lat: number; lng: number }[],
  userLat?: number,
  userLng?: number,
): { lat: number; lng: number } | null {
  if (serviceAreaSlugs.length === 0) return null;

  const points = serviceAreaSlugs
    .map((slug) => areaRecords.find((a) => a.slug === slug))
    .filter(Boolean) as { lat: number; lng: number }[];

  if (userLat != null && userLng != null && points.length) {
    let best = points[0]!;
    let bestDist = haversineKm(userLat, userLng, best.lat, best.lng);
    for (const p of points.slice(1)) {
      const d = haversineKm(userLat, userLng, p.lat, p.lng);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  return points[0] ?? null;
}

async function loadPublicLocations(therapistIds: string[]): Promise<Map<string, TherapistLocationRow>> {
  const map = new Map<string, TherapistLocationRow>();
  if (!therapistIds.length) return map;

  const supabase = createAdminishAnonClient();
  const { data, error } = await supabase.rpc("get_therapist_public_locations", {
    p_therapist_ids: therapistIds,
  });

  if (!error && data?.length) {
    for (const row of data as TherapistLocationRow[]) {
      map.set(String(row.therapist_id), row);
    }
    return map;
  }

  return map;
}

async function loadTherapistRelations(therapistIds: string[]) {
  const supabase = createAdminishAnonClient();
  if (!therapistIds.length) {
    return {
      mediaByTherapist: new Map<string, PublicTherapistMedia[]>(),
      mediaMetaByTherapist: new Map<
        string,
        Array<{ approvalStatus?: "pending" | "approved" | "rejected"; isPrimary: boolean; type?: string }>
      >(),
      servicesByTherapist: new Map<
        string,
        { slugs: string[]; names: string[]; meta: Array<{ approved: boolean; active: boolean }> }
      >(),
      serviceAreasByTherapist: new Map<string, { slugs: string[]; names: string[] }>(),
      locationByTherapist: new Map<string, TherapistLocationRow>(),
      areaRecords: [] as { slug: string; lat: number; lng: number }[],
    };
  }

  const [mediaRows, servicesRes, areasRes, locationByTherapist] = await Promise.all([
    loadTherapistMedia(supabase, therapistIds, { approvedOnly: false }),
    supabase
      .from("therapist_services")
      .select("therapist_id, approved, active, services!inner(slug, name)")
      .eq("active", true)
      .in("therapist_id", therapistIds),
    supabase
      .from("therapist_service_areas")
      .select("therapist_id, coverage_areas!inner(slug, name, public_label, latitude, longitude)")
      .eq("active", true)
      .in("therapist_id", therapistIds),
    loadPublicLocations(therapistIds),
  ]);

  const mediaByTherapist = new Map<string, PublicTherapistMedia[]>();
  const mediaMetaByTherapist = new Map<
    string,
    Array<{ approvalStatus?: "pending" | "approved" | "rejected"; isPrimary: boolean; type?: string }>
  >();
  for (const row of mediaRows as TherapistMediaRow[]) {
    const tid = String(row.therapist_id);
    const mapped = mapMediaRow(row);
    if (mapped.approvalStatus === "rejected") continue;
    const { approvalStatus, ...publicMedia } = mapped;
    const list = mediaByTherapist.get(tid) || [];
    list.push(publicMedia);
    mediaByTherapist.set(tid, list);
    const meta = mediaMetaByTherapist.get(tid) || [];
    meta.push({
      approvalStatus,
      isPrimary: mapped.isPrimary,
      type: mapped.type,
    });
    mediaMetaByTherapist.set(tid, meta);
  }

  const servicesByTherapist = new Map<
    string,
    { slugs: string[]; names: string[]; meta: Array<{ approved: boolean; active: boolean }> }
  >();
  for (const row of servicesRes.data || []) {
    const tid = String(row.therapist_id);
    const svc = row.services as { slug: string; name: string } | { slug: string; name: string }[];
    const service = Array.isArray(svc) ? svc[0] : svc;
    if (!service) continue;
    const entry = servicesByTherapist.get(tid) || { slugs: [], names: [], meta: [] };
    entry.slugs.push(service.slug);
    entry.names.push(service.name);
    entry.meta.push({ approved: Boolean(row.approved), active: row.active !== false });
    servicesByTherapist.set(tid, entry);
  }

  const serviceAreasByTherapist = new Map<string, { slugs: string[]; names: string[] }>();
  const areaRecords: { slug: string; lat: number; lng: number }[] = [];
  for (const row of areasRes.data || []) {
    const tid = String(row.therapist_id);
    const area = row.coverage_areas as
      | { slug: string; name: string; public_label?: string; latitude?: number; longitude?: number }
      | { slug: string; name: string; public_label?: string; latitude?: number; longitude?: number }[];
    const cov = Array.isArray(area) ? area[0] : area;
    if (!cov) continue;
    const entry = serviceAreasByTherapist.get(tid) || { slugs: [], names: [] };
    entry.slugs.push(cov.slug);
    entry.names.push(cov.public_label || cov.name);
    serviceAreasByTherapist.set(tid, entry);
    if (cov.latitude != null && cov.longitude != null && !areaRecords.some((a) => a.slug === cov.slug)) {
      areaRecords.push({ slug: cov.slug, lat: Number(cov.latitude), lng: Number(cov.longitude) });
    }
  }

  return {
    mediaByTherapist,
    mediaMetaByTherapist,
    servicesByTherapist,
    serviceAreasByTherapist,
    locationByTherapist,
    areaRecords,
  };
}

function applyDiscoveryFilters(list: PublicTherapist[], filters: TherapistFilters): PublicTherapist[] {
  let out = list;
  if (filters.gender && filters.gender !== "any") {
    out = out.filter((t) => matchesGenderFilter(t, filters.gender!));
  }
  if (filters.search?.trim()) {
    out = out.filter((t) => matchesTherapistSearch(t, filters.search!));
  }
  return out;
}

/**
 * Core eligibility query — therapists who offer the service, cover the area, and can reach the client.
 */
export async function findEligibleTherapists(
  query: LocationEligibilityQuery = {},
): Promise<EligibilityResult> {
  const searchRadiusKm = query.radiusKm ?? 25;
  const hasClientLocation = query.lat != null && query.lng != null;
  const cityWide = Boolean(query.cityWide || query.city?.trim());

  let resolvedCoverage: ResolvedCoverage | null = null;
  let effectiveCoverageSlug = cityWide ? undefined : query.coverageAreaSlug;
  let cityFilter = query.city?.trim() || undefined;

  if (hasClientLocation && !cityWide) {
    resolvedCoverage = await resolveCoverageAreaFromCoords(query.lat!, query.lng!);
    if (query.inferCoverageFromLocation && resolvedCoverage && !effectiveCoverageSlug) {
      effectiveCoverageSlug = resolvedCoverage.slug;
    }
  }

  if (cityWide && hasClientLocation) {
    const { reverseGeocode, canonicalMarketplaceCity, getActiveCoverageAreas } = await import(
      "@/lib/therapists/coverage-areas"
    );
    if (!cityFilter) {
      const reversed = await reverseGeocode(query.lat!, query.lng!);
      cityFilter = reversed
        ? canonicalMarketplaceCity(reversed)
        : undefined;
    } else {
      cityFilter = canonicalMarketplaceCity({ city: cityFilter });
    }
    resolvedCoverage = (await resolveCoverageAreaFromCoords(query.lat!, query.lng!)) ?? resolvedCoverage;
    if (!cityFilter && resolvedCoverage) {
      const areas = await getActiveCoverageAreas();
      cityFilter = areas.find((a) => a.slug === resolvedCoverage!.slug)?.city || undefined;
    }
  }

  if (cityWide && hasClientLocation && !resolvedCoverage) {
    resolvedCoverage = await resolveCoverageAreaFromCoords(query.lat!, query.lng!);
  }

  const rpcFilters: TherapistFilters = {
    ...query,
    coverageAreaSlug: cityWide ? undefined : effectiveCoverageSlug,
    radiusKm: cityWide && !cityFilter ? 800 : searchRadiusKm,
    city: cityWide ? cityFilter : undefined,
  };

  const meta: EligibilityMeta = {
    clientLocation: hasClientLocation
      ? { lat: query.lat!, lng: query.lng!, source: query.inferCoverageFromLocation ? "geocode" : "gps" }
      : undefined,
    resolvedCoverage,
    filtersApplied: {
      serviceSlug: query.serviceSlug,
      coverageAreaSlug: cityWide ? undefined : effectiveCoverageSlug,
      locationBased: hasClientLocation || Boolean(cityFilter),
      searchRadiusKm,
    },
  };

  try {
    const supabase = createAdminishAnonClient();
    const { data: eligible, error: rpcError } = await supabase.rpc(
      "find_eligible_therapists",
      buildTherapistFiltersRpc(rpcFilters),
    );

    if (rpcError) {
      return { therapists: [], meta };
    }

    const eligibleRows = (eligible || []) as EligibleTherapistRow[];
    if (!eligibleRows.length) {
      return { therapists: [], meta };
    }

    const distanceById = new Map(
      eligibleRows.map((r) => [
        r.therapist_id,
        r.distance_km != null ? Math.round(r.distance_km * 10) / 10 : undefined,
      ]),
    );

    let ids = eligibleRows.map((r) => r.therapist_id);

    const { data: rows, error } = await supabase
      .from("therapists")
      .select(THERAPIST_PUBLIC_SELECT)
      .in("id", ids)
      .order("sort_order", { ascending: true });

    if (error || !rows?.length) {
      return { therapists: [], meta };
    }

    if (query.featured) {
      ids = rows.filter((r) => r.featured).map((r) => r.id as string);
    }

    const {
      mediaByTherapist,
      mediaMetaByTherapist,
      servicesByTherapist,
      serviceAreasByTherapist,
      locationByTherapist,
      areaRecords = [],
    } = await loadTherapistRelations(ids);

    let mapped = (rows as TherapistQueryRow[])
      .filter((row) => ids.includes(row.id))
      .map((row) => {
        const svc = servicesByTherapist.get(row.id) || { slugs: [], names: [], meta: [] };
        const areas = serviceAreasByTherapist.get(row.id) || { slugs: [], names: [] };
        const mapCoords = resolveMapCoords(areas.slugs, areaRecords, query.lat, query.lng);
        return mapTherapist(
          row,
          locationByTherapist.get(row.id),
          mediaByTherapist.get(row.id) || [],
          svc.slugs,
          svc.names,
          areas.slugs,
          areas.names,
          mapCoords,
          distanceById.get(row.id),
          {
            media: mediaMetaByTherapist.get(row.id) || [],
            services: svc.meta,
          },
        );
      })
      .filter((t): t is PublicTherapist => Boolean(t));

    if (hasClientLocation) {
      mapped = mapped.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    mapped = applyDiscoveryFilters(mapped, query);

    if (query.experienceTier && query.experienceTier !== "any") {
      mapped = mapped.filter((t) => {
        const wantsSignature = query.experienceTier === "signature";
        return t.serviceSlugs.some((slug) => {
          const product = getCatalogProduct(slug);
          if (!product) return !wantsSignature;
          return wantsSignature ? isSignatureExperience(product) : !isSignatureExperience(product);
        });
      });
    }

    if (query.limit) {
      mapped = mapped.slice(0, query.limit);
    }

    return { therapists: mapped, meta };
  } catch {
    return { therapists: [], meta };
  }
}

/** Resolve a stay address to coordinates + nearest coverage zone (server-side). */
export async function resolveClientLocationFromPlace(
  placeQuery: string,
  cityHint: GeocodeCityHint = "auto",
): Promise<{
  lat: number;
  lng: number;
  label: string;
  resolvedCoverage: ResolvedCoverage | null;
}> {
  const { geocodePlace } = await import("@/lib/therapists/coverage-areas");
  const geocoded = await geocodePlace(placeQuery, cityHint);
  const resolvedCoverage = await resolveCoverageAreaFromCoords(geocoded.lat, geocoded.lng);
  return {
    lat: geocoded.lat,
    lng: geocoded.lng,
    label: geocoded.label,
    resolvedCoverage,
  };
}

export type { GeocodeCityHint };
