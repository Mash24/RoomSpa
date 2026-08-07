import { createAdminishAnonClient } from "@/lib/supabase/anon";
import {
  buildSlotAvailability,
  getSlotCapacity,
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

/** Server-side same-day availability for SEO “available today” signals. */
export async function getTodayAvailabilityTeaser(): Promise<AvailabilityTeaser> {
  const date = todayInBangkok();
  const capacity = getSlotCapacity();
  const totalSlots = buildSlotAvailability({}, capacity).length;

  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase.rpc("get_slot_booking_counts", {
      p_date: date,
    });

    if (error) {
      return { date, openSlots: totalSlots, totalSlots, nextOpenTime: null, capacity };
    }

    const countsByTime: Record<string, number> = {};
    for (const row of data ?? []) {
      const time = normalizeSlotTime(String((row as { scheduled_time: string }).scheduled_time));
      countsByTime[time] = Number((row as { booking_count: number }).booking_count);
    }

    const slots = buildSlotAvailability(countsByTime, capacity);
    const open = slots.filter((slot) => slot.available);

    return {
      date,
      openSlots: open.length,
      totalSlots,
      nextOpenTime: open[0]?.time ?? null,
      capacity,
    };
  } catch {
    return { date, openSlots: totalSlots, totalSlots, nextOpenTime: null, capacity };
  }
}
