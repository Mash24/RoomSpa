/**
 * Server-side therapist assignment for "Best available" bookings (Phase 10E).
 */

import {
  getAvailableTherapists,
  type AvailabilityQuery,
} from "@/lib/therapists/bookability";

export type AssignmentResult = {
  therapistId: string;
  displayName: string;
  slug: string;
  distanceKm: number | null;
};

/**
 * Pick the nearest therapist who is bookable at the requested slot.
 * Must run at checkout — never trust client-side assignment.
 */
export async function assignBestAvailableTherapist(
  query: AvailabilityQuery & { scheduledTime: string },
): Promise<AssignmentResult | null> {
  const normalized = query.scheduledTime.trim().slice(0, 5);
  const result = await getAvailableTherapists({
    ...query,
    requestedTime: normalized,
  });

  for (const therapist of result.therapists) {
    if (therapist.availableSlots.includes(normalized)) {
      return {
        therapistId: therapist.id,
        displayName: therapist.displayName,
        slug: therapist.slug,
        distanceKm: therapist.distanceKm,
      };
    }
  }

  return null;
}
