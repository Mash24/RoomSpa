import type { PublicTherapist, PublicTherapistMedia, TherapistFilters } from "@/lib/therapists/types";

export type EligibleTherapistRow = {
  therapist_id: string;
  distance_km: number | null;
};

export type TherapistQueryRow = {
  id: string;
  slug: string;
  display_name: string;
  gender: string;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  nationality: string | null;
  ethnicity: string | null;
  bio: string;
  featured: boolean;
  sort_order: number;
  show_age: boolean;
  show_height: boolean;
  show_weight: boolean;
  show_ethnicity: boolean;
  show_nationality: boolean;
  verified: boolean;
};

export type TherapistLocationRow = {
  therapist_id: string;
  city: string;
  country: string;
  region: string;
  public_area_summary: string;
};

export type TherapistMediaRow = {
  id: string;
  therapist_id: string;
  url: string;
  media_type: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export function mapMediaRow(row: TherapistMediaRow): PublicTherapistMedia {
  return {
    id: row.id,
    url: row.url,
    type: row.media_type === "video" ? "video" : "photo",
    thumbnailUrl: row.thumbnail_url,
    altText: row.alt_text,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
  };
}

export function buildTherapistFiltersRpc(filters: TherapistFilters) {
  return {
    p_service_slug: filters.serviceSlug ?? null,
    p_coverage_slug: filters.coverageAreaSlug ?? null,
    p_lat: filters.lat ?? null,
    p_lng: filters.lng ?? null,
    p_search_radius_km: filters.radiusKm ?? 25,
    p_city: filters.city?.trim() || null,
  };
}
