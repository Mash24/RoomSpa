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
