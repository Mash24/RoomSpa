import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import {
  buildSlotAvailability,
  filterBookableSlots,
  getSlotCapacity,
  normalizeSlotTime,
} from "@/lib/booking/availability";

function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim() ?? "";

    if (!isDateString(date)) {
      return NextResponse.json({ error: "Provide a date as YYYY-MM-DD." }, { status: 400 });
    }

    const today = new Date();
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(today);

    if (date < todayStr) {
      return NextResponse.json({ error: "Date must be today or later." }, { status: 400 });
    }

    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase.rpc("get_slot_booking_counts", {
      p_date: date,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const countsByTime: Record<string, number> = {};
    for (const row of data ?? []) {
      const time = normalizeSlotTime(String((row as { scheduled_time: string }).scheduled_time));
      const count = Number((row as { booking_count: number }).booking_count);
      countsByTime[time] = count;
    }

    const capacity = getSlotCapacity();
    const slots = filterBookableSlots(
      buildSlotAvailability(countsByTime, capacity),
      date,
      todayStr,
    );

    return NextResponse.json({
      date,
      capacity,
      slots,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load availability.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
