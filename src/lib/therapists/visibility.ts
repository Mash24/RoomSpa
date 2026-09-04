import type {
  MediaApprovalStatus,
  PublicTherapistMedia,
} from "@/lib/therapists/types";

export type PublicEligibilityInput = {
  showOnGallery: boolean;
  acceptingBookings: boolean;
  suspended?: boolean;
  media: Array<{
    approvalStatus?: MediaApprovalStatus;
    isPrimary: boolean;
    type?: string;
  }>;
  services: Array<{
    approved: boolean;
    active?: boolean;
  }>;
};

/**
 * Appears on /therapists when Show on gallery is ON.
 * Adding a therapist means they’re cleared to work with us — no extra approval gate here.
 */
export function isPubliclyEligibleTherapist(input: PublicEligibilityInput): boolean {
  if (input.suspended) return false;
  return input.showOnGallery;
}

/** Soft verified badge — optional polish when services are fully approved. */
export function deriveTherapistVerified(input: PublicEligibilityInput): boolean {
  if (!isPubliclyEligibleTherapist(input)) return false;
  const publicServices = input.services.filter((s) => s.active !== false);
  if (!publicServices.length) return false;
  return publicServices.every((s) => s.approved);
}

/** Public gallery media — hide only rejected photos. */
export function filterApprovedPublicMedia<T extends PublicTherapistMedia & { approvalStatus?: MediaApprovalStatus }>(
  media: T[],
): PublicTherapistMedia[] {
  return media
    .filter((m) => (m.approvalStatus ?? "approved") !== "rejected")
    .map(({ approvalStatus: _a, ...rest }) => rest);
}
