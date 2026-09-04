import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaApprovalStatus, PublicTherapistMedia, TherapistFilters } from "@/lib/therapists/types";

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
  languages: string[] | null;
  years_experience: number | null;
  training: string | null;
  accepting_bookings: boolean;
  show_on_gallery: boolean;
  status: string;
  featured: boolean;
  sort_order: number;
  show_age: boolean;
  show_height: boolean;
  show_weight: boolean;
  show_ethnicity: boolean;
  show_nationality: boolean;
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
  approval_status?: MediaApprovalStatus | string | null;
};

export type TherapistServiceLinkRow = {
  therapist_id: string;
  service_id?: string;
  approved?: boolean | null;
  active?: boolean | null;
  claimed?: boolean | null;
  tested?: boolean | null;
  services?: { slug: string; name: string } | { slug: string; name: string }[] | null;
};

export function mapMediaRow(row: TherapistMediaRow): PublicTherapistMedia & { approvalStatus: MediaApprovalStatus } {
  return {
    id: row.id,
    url: row.url,
    type: row.media_type === "video" ? "video" : "photo",
    thumbnailUrl: row.thumbnail_url,
    altText: row.alt_text,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    approvalStatus: (row.approval_status as MediaApprovalStatus) || "approved",
  };
}

/**
 * Reads the current media table, with a read-only fallback for databases that
 * have not yet run the therapist media rename migration.
 */
export async function loadTherapistMedia(
  supabase: SupabaseClient,
  therapistIds: string[],
  options?: { approvedOnly?: boolean },
): Promise<TherapistMediaRow[]> {
  if (!therapistIds.length) return [];

  let query = supabase
    .from("therapist_media")
    .select("id, therapist_id, url, media_type, thumbnail_url, alt_text, sort_order, is_primary, approval_status")
    .in("therapist_id", therapistIds)
    .order("sort_order", { ascending: true });

  if (options?.approvedOnly) {
    query = query.eq("approval_status", "approved");
  }

  const current = await query;

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
    approval_status: "approved" as const,
  }));
}

export const THERAPIST_PUBLIC_SELECT =
  "id, slug, display_name, gender, date_of_birth, height_cm, weight_kg, nationality, ethnicity, bio, languages, years_experience, training, accepting_bookings, show_on_gallery, status, featured, sort_order, show_age, show_height, show_weight, show_ethnicity, show_nationality";

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
