import { TIME_SLOTS } from "@/lib/booking/types";

/** How many therapists can take the same time slot. Override with BOOKING_SLOT_CAPACITY. */
export function getSlotCapacity() {
  const raw = Number(process.env.BOOKING_SLOT_CAPACITY ?? "3");
  if (!Number.isFinite(raw) || raw < 1) return 3;
  return Math.floor(raw);
}

export type SlotAvailability = {
  time: string;
  booked: number;
  capacity: number;
  remaining: number;
  available: boolean;
};

export function buildSlotAvailability(
  countsByTime: Record<string, number>,
  capacity = getSlotCapacity(),
): SlotAvailability[] {
  return TIME_SLOTS.map((time) => {
    const booked = countsByTime[time] ?? 0;
    const remaining = Math.max(0, capacity - booked);
    return {
      time,
      booked,
      capacity,
      remaining,
      available: remaining > 0,
    };
  });
}

export function normalizeSlotTime(value: string) {
  return value.slice(0, 5);
}

/** Current HH:mm in Asia/Bangkok (24h). */
export function bangkokNowHhMm() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * For today, mark slots that have already started as unavailable.
 * Keeps teaser + booking form honest about what guests can still book.
 */
export function filterBookableSlots(
  slots: SlotAvailability[],
  dateYmd: string,
  todayYmd: string,
  nowHhMm = bangkokNowHhMm(),
): SlotAvailability[] {
  if (dateYmd !== todayYmd) return slots;
  return slots.map((slot) => {
    if (slot.time <= nowHhMm) {
      return { ...slot, available: false, remaining: 0 };
    }
    return slot;
  });
}

export function isPastSlotToday(time: string, dateYmd: string, todayYmd: string, nowHhMm = bangkokNowHhMm()) {
  return dateYmd === todayYmd && time <= nowHhMm;
}
