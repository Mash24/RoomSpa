import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublicTherapistMedia, TherapistFilters } from "@/lib/therapists/types";

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

/**
 * Reads the current media table, with a read-only fallback for databases that
 * have not yet run the therapist media rename migration.
 */
export async function loadTherapistMedia(
  supabase: SupabaseClient,
  therapistIds: string[],
): Promise<TherapistMediaRow[]> {
  if (!therapistIds.length) return [];

  const current = await supabase
    .from("therapist_media")
    .select("id, therapist_id, url, media_type, thumbnail_url, alt_text, sort_order, is_primary")
    .in("therapist_id", therapistIds)
    .order("sort_order", { ascending: true });

  if (!current.error) {
    return (current.data || []) as TherapistMediaRow[];
  }

  const legacy = await supabase
    .from("therapist_photos")
    .select("id, therapist_id, photo_url, sort_order, is_primary")
    .in("therapist_id", therapistIds)
    .order("sort_order", { ascending: true });

  return ((legacy.data || []) as Array<{
    id: string;
    therapist_id: string;
    photo_url: string;
    sort_order: number;
    is_primary: boolean;
  }>).map((row) => ({
    id: row.id,
    therapist_id: row.therapist_id,
    url: row.photo_url,
    media_type: "photo",
    thumbnail_url: null,
    alt_text: null,
    sort_order: row.sort_order,
    is_primary: row.is_primary,
  }));
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
