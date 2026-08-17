/**
 * Bookability layer — Phase 10D
 *
 * Canonical entry point: eligible therapists + resolved available slots.
 *
 * Pipeline:
 *   VISIBLE → SERVICE ELIGIBLE → LOCATION ELIGIBLE → WORKING HOURS
 *   → UNAVAILABILITY → EXISTING BOOKINGS → TRAVEL BUFFER → AVAILABLE SLOTS
 */

import { createAdminishAnonClient } from "@/lib/supabase/anon";
import type { PublicTherapist } from "@/lib/therapists/types";
import { therapistPrimaryPhoto } from "@/lib/therapists/public";
import { DURATION_TIERS, type DurationMinutes } from "@/lib/catalog/prices";
import { findEligibleTherapists, type EligibilityMeta } from "@/lib/therapists/eligibility";
import {
  bangkokNowMinutes,
  bangkokTodayYmd,
  getTravelBufferMinutes,
  parseScheduleRows,
  resolveAvailableSlots,
  slotsNearRequestedTime,
  summarizeWorkingHours,
  type ScheduleBlock,
} from "@/lib/therapists/slot-engine";

export type AvailabilityQuery = {
  serviceSlug: string;
  date: string;
  durationMinutes?: number;
  coverageAreaSlug?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  travelBufferMinutes?: number;
  requestedTime?: string;
  inferCoverageFromLocation?: boolean;
};

export type AvailableTherapist = {
  id: string;
  slug: string;
  displayName: string;
  gender: PublicTherapist["gender"];
  age: number | null;
  height: string | null;
  nationality: string | null;
  verified: boolean;
  primaryPhotoUrl: string | null;
  serviceNames: string[];
  distanceKm: number | null;
  bookable: boolean;
  availableSlots: string[];
  workingHours: { start: string; end: string }[];
};

export type AvailabilityResult = {
  date: string;
  durationMinutes: number;
  travelBufferMinutes: number;
  requestedTime?: string;
  therapists: AvailableTherapist[];
  eligibility: EligibilityMeta;
};

type ScheduleRow = {
  therapist_id: string;
  kind: string;
  start_min: number;
  end_min: number;
};

function normalizeDuration(minutes?: number): DurationMinutes {
  const n = Number(minutes ?? 60);
  return (DURATION_TIERS as readonly number[]).includes(n) ? (n as DurationMinutes) : 60;
}

function isValidDateYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function fetchScheduleBlocks(
  therapistIds: string[],
  date: string,
): Promise<Map<string, ScheduleBlock[]>> {
  if (!therapistIds.length) return new Map();

  const supabase = createAdminishAnonClient();
  const { data, error } = await supabase.rpc("fetch_therapist_schedule", {
    p_therapist_ids: therapistIds,
    p_date: date,
  });

  if (error || !data?.length) return new Map();

  return parseScheduleRows(data as ScheduleRow[]);
}

/**
 * Resolve therapists with available slots for service + location + date + duration.
 * This is the function the booking UI and AI assistant should call.
 */
export async function getAvailableTherapists(
  query: AvailabilityQuery,
): Promise<AvailabilityResult> {
  const durationMinutes = normalizeDuration(query.durationMinutes);
  const travelBufferMinutes = query.travelBufferMinutes ?? getTravelBufferMinutes();
  const todayYmd = bangkokTodayYmd();
  const minStartMin = query.date === todayYmd ? bangkokNowMinutes() : undefined;

  const eligibilityResult = await findEligibleTherapists({
    serviceSlug: query.serviceSlug,
    coverageAreaSlug: query.coverageAreaSlug,
    lat: query.lat,
    lng: query.lng,
    radiusKm: query.radiusKm,
    inferCoverageFromLocation: query.inferCoverageFromLocation,
  });

  const eligible = eligibilityResult.therapists;
  const therapistIds = eligible.map((t) => t.id);

  const scheduleByTherapist = await fetchScheduleBlocks(therapistIds, query.date);

  const therapists: AvailableTherapist[] = eligible.map((t) => {
    const blocks = scheduleByTherapist.get(t.id) || [];
    const work = blocks.filter((b) => b.kind === "work");

    let availableSlots = resolveAvailableSlots(blocks, {
      durationMinutes,
      travelBufferMinutes,
      minStartMin,
    });

    if (query.requestedTime) {
      availableSlots = slotsNearRequestedTime(availableSlots, query.requestedTime);
    }

    return {
      id: t.id,
      slug: t.slug,
      displayName: t.displayName,
      gender: t.gender,
      age: t.age,
      height: t.height,
      nationality: t.nationality,
      verified: t.verified,
      primaryPhotoUrl: therapistPrimaryPhoto(t),
      serviceNames: t.serviceNames,
      distanceKm: t.distanceKm ?? null,
      bookable: availableSlots.length > 0,
      availableSlots,
      workingHours: summarizeWorkingHours(work),
    };
  });

  therapists.sort((a, b) => {
    if (a.bookable !== b.bookable) return a.bookable ? -1 : 1;
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
  });

  return {
    date: query.date,
    durationMinutes,
    travelBufferMinutes,
    requestedTime: query.requestedTime,
    therapists,
    eligibility: eligibilityResult.meta,
  };
}

export function validateAvailabilityQuery(query: Partial<AvailabilityQuery>): string | null {
  if (!query.serviceSlug?.trim()) return "Service is required.";
  if (!query.date?.trim() || !isValidDateYmd(query.date)) return "Provide a date as YYYY-MM-DD.";
  if (query.date < bangkokTodayYmd()) return "Date must be today or later.";
  return null;
}

export async function isTherapistBookableAt(
  therapistId: string,
  query: AvailabilityQuery & { scheduledTime: string },
): Promise<boolean> {
  const result = await getAvailableTherapists(query);
  const therapist = result.therapists.find((t) => t.id === therapistId);
  if (!therapist?.bookable) return false;
  const normalized = query.scheduledTime.trim().slice(0, 5);
  return therapist.availableSlots.includes(normalized);
}
