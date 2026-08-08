import { createAdminishAnonClient } from "@/lib/supabase/anon";
import {
  buildSlotAvailability,
  filterBookableSlots,
  getSlotCapacity,
  isPastSlotToday,
  normalizeSlotTime,
} from "@/lib/booking/availability";

function todayInBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export type AvailabilityTeaser = {
  date: string;
  openSlots: number;
  totalSlots: number;
  nextOpenTime: string | null;
  capacity: number;
};

/** Server-side same-day availability — remaining future slots only. */
export async function getTodayAvailabilityTeaser(): Promise<AvailabilityTeaser> {
  const date = todayInBangkok();
  const capacity = getSlotCapacity();

  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase.rpc("get_slot_booking_counts", {
      p_date: date,
    });

    const countsByTime: Record<string, number> = {};
    if (!error) {
      for (const row of data ?? []) {
        const time = normalizeSlotTime(String((row as { scheduled_time: string }).scheduled_time));
        countsByTime[time] = Number((row as { booking_count: number }).booking_count);
      }
    }

    return summarizeTeaser(date, countsByTime, capacity);
  } catch {
    return summarizeTeaser(date, {}, capacity);
  }
}

function summarizeTeaser(
  date: string,
  countsByTime: Record<string, number>,
  capacity: number,
): AvailabilityTeaser {
  const all = buildSlotAvailability(countsByTime, capacity);
  const withPastClosed = filterBookableSlots(all, date, date);
  const upcoming = all.filter((slot) => !isPastSlotToday(slot.time, date, date));
  const open = withPastClosed.filter((slot) => slot.available);

  return {
    date,
    openSlots: open.length,
    totalSlots: upcoming.length,
    nextOpenTime: open[0]?.time ?? null,
    capacity,
  };
}
