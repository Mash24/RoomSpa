/**
 * Slot-resolution engine — Phase 10D
 *
 * Combines working hours, bookings, unavailability, travel buffer, and duration
 * to produce bookable time slots per therapist.
 *
 * Called only from server routes — never from React.
 */

export type ScheduleBlock = {
  kind: "work" | "booking" | "unavailability";
  startMin: number;
  endMin: number;
};

export type TimeRange = {
  start: string;
  end: string;
};

export type SlotEngineOptions = {
  durationMinutes: number;
  travelBufferMinutes: number;
  /** Minutes between candidate slot starts (default 60). */
  slotStepMinutes?: number;
  /** Earliest candidate start (minutes from midnight). Default 600 = 10:00. */
  platformStartMin?: number;
  /** Latest candidate start (minutes from midnight). Default 1320 = 22:00. */
  platformEndStartMin?: number;
  /** For today: exclude slots at or before this time (minutes from midnight, Bangkok). */
  minStartMin?: number;
};

function parseTimeToMinutes(hhmm: string): number {
  const normalized = hhmm.trim().slice(0, 5);
  const [h, m] = normalized.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatMinutesToTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function groupScheduleBlocks(blocks: ScheduleBlock[]) {
  const work = blocks.filter((b) => b.kind === "work");
  const bookings = blocks.filter((b) => b.kind === "booking");
  const unavailability = blocks.filter((b) => b.kind === "unavailability");
  return { work, bookings, unavailability };
}

function mergeWorkPeriods(work: ScheduleBlock[]): ScheduleBlock[] {
  if (!work.length) return [];
  const sorted = [...work].sort((a, b) => a.startMin - b.startMin);
  const merged: ScheduleBlock[] = [];
  let current = { ...sorted[0]! };

  for (const period of sorted.slice(1)) {
    if (period.startMin <= current.endMin) {
      current.endMin = Math.max(current.endMin, period.endMin);
    } else {
      merged.push(current);
      current = { ...period };
    }
  }
  merged.push(current);
  return merged;
}

function isSlotAvailable(
  slotStart: number,
  durationMinutes: number,
  travelBufferMinutes: number,
  work: ScheduleBlock[],
  bookings: ScheduleBlock[],
  unavailability: ScheduleBlock[],
): boolean {
  const slotEnd = slotStart + durationMinutes;

  const inWorkHours = work.some((w) => slotStart >= w.startMin && slotEnd <= w.endMin);
  if (!inWorkHours) return false;

  for (const block of unavailability) {
    if (overlaps(slotStart, slotEnd, block.startMin, block.endMin)) return false;
  }

  for (const booking of bookings) {
    if (overlaps(slotStart, slotEnd, booking.startMin, booking.endMin)) return false;
  }

  for (const booking of bookings) {
    if (booking.endMin <= slotStart && slotStart < booking.endMin + travelBufferMinutes) {
      return false;
    }
    if (booking.startMin >= slotEnd && slotEnd + travelBufferMinutes > booking.startMin) {
      return false;
    }
  }

  return true;
}

function generateCandidateStarts(
  work: ScheduleBlock[],
  opts: SlotEngineOptions,
): number[] {
  const step = opts.slotStepMinutes ?? 60;
  const platformStart = opts.platformStartMin ?? 10 * 60;
  const platformEndStart = opts.platformEndStartMin ?? 22 * 60;
  const duration = opts.durationMinutes;

  const candidates = new Set<number>();
  const mergedWork = mergeWorkPeriods(work);

  for (const period of mergedWork) {
    const start = Math.max(period.startMin, platformStart);
    const lastStart = Math.min(period.endMin - duration, platformEndStart);
    for (let t = start; t <= lastStart; t += step) {
      if (t >= period.startMin && t + duration <= period.endMin) {
        candidates.add(t);
      }
    }
  }

  return [...candidates].sort((a, b) => a - b);
}

/**
 * Resolve available slot start times for one therapist on one date.
 */
export function resolveAvailableSlots(
  blocks: ScheduleBlock[],
  options: SlotEngineOptions,
): string[] {
  const { work, bookings, unavailability } = groupScheduleBlocks(blocks);
  if (!work.length) return [];

  const candidates = generateCandidateStarts(work, options);
  const minStart = options.minStartMin ?? -1;

  return candidates
    .filter((slotStart) => slotStart > minStart)
    .filter((slotStart) =>
      isSlotAvailable(
        slotStart,
        options.durationMinutes,
        options.travelBufferMinutes,
        work,
        bookings,
        unavailability,
      ),
    )
    .map(formatMinutesToTime);
}

export function summarizeWorkingHours(work: ScheduleBlock[]): TimeRange[] {
  return mergeWorkPeriods(work).map((w) => ({
    start: formatMinutesToTime(w.startMin),
    end: formatMinutesToTime(w.endMin),
  }));
}

export function bangkokTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function bangkokNowMinutes(): number {
  const hhmm = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  return parseTimeToMinutes(hhmm);
}

export function getTravelBufferMinutes(): number {
  const raw = Number(process.env.BOOKING_TRAVEL_BUFFER_MINUTES ?? "30");
  if (!Number.isFinite(raw) || raw < 0) return 30;
  return Math.floor(raw);
}

export function parseScheduleRows(
  rows: { therapist_id: string; kind: string; start_min: number; end_min: number }[],
): Map<string, ScheduleBlock[]> {
  const byTherapist = new Map<string, ScheduleBlock[]>();
  for (const row of rows) {
    const tid = String(row.therapist_id);
    const list = byTherapist.get(tid) || [];
    const kind = row.kind as ScheduleBlock["kind"];
    if (kind !== "work" && kind !== "booking" && kind !== "unavailability") continue;
    list.push({
      kind,
      startMin: Number(row.start_min),
      endMin: Number(row.end_min),
    });
    byTherapist.set(tid, list);
  }
  return byTherapist;
}

export function slotsNearRequestedTime(slots: string[], requestedTime?: string): string[] {
  if (!requestedTime?.trim()) return slots;
  const target = parseTimeToMinutes(requestedTime);
  return [...slots].sort((a, b) => {
    const da = Math.abs(parseTimeToMinutes(a) - target);
    const db = Math.abs(parseTimeToMinutes(b) - target);
    return da - db;
  });
}

export { parseTimeToMinutes };
