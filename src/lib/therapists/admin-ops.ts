import type {
  AdminTherapistMedia,
  AdminTherapistRow,
  MediaApprovalStatus,
  ServiceQualification,
} from "@/lib/therapists/types";
import { deriveTherapistVerified } from "@/lib/therapists/visibility";
import { assertServiceQualification } from "@/lib/therapists/status";

export function mapAdminMedia(row: Record<string, unknown>): AdminTherapistMedia {
  return {
    id: String(row.id),
    url: String(row.url ?? row.photo_url),
    type: row.media_type === "video" ? "video" : "photo",
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    altText: row.alt_text ? String(row.alt_text) : null,
    isPrimary: Boolean(row.is_primary),
    sortOrder: Number(row.sort_order ?? 0),
    approvalStatus: (String(row.approval_status || "pending") as MediaApprovalStatus),
  };
}

export function mapAdminTherapistRow(
  row: Record<string, unknown>,
  media: AdminTherapistMedia[],
  serviceIds: string[],
  serviceSlugs: string[],
  serviceQualifications: ServiceQualification[],
  serviceAreaIds: string[],
  serviceAreaSlugs: string[],
  location: AdminTherapistRow["location"],
): AdminTherapistRow {
  const status = (row.status as AdminTherapistRow["status"]) || "active";
  const showOnGallery = row.show_on_gallery === true;
  const acceptingBookings = row.accepting_bookings !== false;
  const verified = deriveTherapistVerified({
    showOnGallery,
    acceptingBookings,
    suspended: status === "suspended" || status === "inactive",
    media,
    services: serviceQualifications,
  });

  return {
    id: String(row.id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    gender: (row.gender as AdminTherapistRow["gender"]) || "unspecified",
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth) : null,
    heightCm: row.height_cm != null ? Number(row.height_cm) : null,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
    nationality: row.nationality ? String(row.nationality) : null,
    ethnicity: row.ethnicity ? String(row.ethnicity) : null,
    bio: String(row.bio ?? ""),
    languages: Array.isArray(row.languages) ? row.languages.filter(Boolean).map(String) : [],
    yearsExperience: row.years_experience != null ? Number(row.years_experience) : null,
    training: String(row.training ?? ""),
    showOnGallery,
    acceptingBookings,
    status,
    verified,
    showAge: row.show_age !== false,
    showHeight: Boolean(row.show_height),
    showWeight: Boolean(row.show_weight),
    showEthnicity: Boolean(row.show_ethnicity),
    showNationality: Boolean(row.show_nationality),
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    phone: row.phone ? String(row.phone) : null,
    internalNotes: String(row.internal_notes ?? ""),
    skillScore: row.skill_score != null ? Number(row.skill_score) : null,
    professionalismScore: row.professionalism_score != null ? Number(row.professionalism_score) : null,
    communicationScore: row.communication_score != null ? Number(row.communication_score) : null,
    reliabilityScore: row.reliability_score != null ? Number(row.reliability_score) : null,
    punctualityScore: row.punctuality_score != null ? Number(row.punctuality_score) : null,
    feedbackScore: row.feedback_score != null ? Number(row.feedback_score) : null,
    location,
    media,
    serviceIds,
    serviceSlugs,
    serviceQualifications,
    serviceAreaIds,
    serviceAreaSlugs,
  };
}

export type AttentionReason =
  | "hidden"
  | "missing_photo"
  | "pending_photos"
  | "unapproved_services"
  | "incomplete_profile";

export function therapistAttentionReasons(t: AdminTherapistRow): AttentionReason[] {
  const reasons: AttentionReason[] = [];
  if (!t.showOnGallery) reasons.push("hidden");
  const photos = t.media.filter((m) => m.type !== "video");
  if (!photos.length) {
    reasons.push("missing_photo");
  }
  if (!t.bio.trim()) {
    reasons.push("incomplete_profile");
  }
  return reasons;
}

export const ATTENTION_LABELS: Record<AttentionReason, string> = {
  hidden: "Hidden from gallery",
  missing_photo: "Needs a photo",
  pending_photos: "Photos pending approval",
  unapproved_services: "Services need approval",
  incomplete_profile: "Profile incomplete",
};

export function isPublicReady(t: AdminTherapistRow): boolean {
  return t.showOnGallery;
}

export function normalizeServiceQualifications(
  serviceIds: string[],
  raw: unknown,
): { qualifications: ServiceQualification[]; error: string | null } {
  const byId = new Map<string, ServiceQualification>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const serviceId = String(row.serviceId || "");
      if (!serviceId) continue;
      const claimed = Boolean(row.claimed);
      const tested = Boolean(row.tested);
      const approved = Boolean(row.approved);
      const err = assertServiceQualification({ claimed, tested, approved });
      if (err) return { qualifications: [], error: err };
      byId.set(serviceId, {
        serviceId,
        claimed,
        tested,
        approved,
        active: row.active !== false,
      });
    }
  }

  const qualifications = serviceIds.map((serviceId) => {
    const existing = byId.get(serviceId);
    if (existing) return existing;
    return {
      serviceId,
      claimed: true,
      tested: false,
      approved: false,
      active: true,
    };
  });

  return { qualifications, error: null };
}

export function scoreOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(1, Math.round(n)));
}
