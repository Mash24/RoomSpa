import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { AdminBooking, BookingFilter } from "@/lib/admin/types";
import { todayInBangkok } from "@/lib/admin/dates";
import { paymentMethodLabel } from "@/lib/booking/pin";

const VALID_FILTERS: BookingFilter[] = ["today", "upcoming", "all"];

function mapBooking(row: Record<string, unknown>): AdminBooking {
  const service = row.services as { name: string } | null;

  return {
    id: row.id as string,
    referenceCode: row.reference_code as string,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: row.customer_phone as string,
    serviceName: service?.name ?? "Unknown service",
    scheduledDate: row.scheduled_date as string,
    scheduledTime: (row.scheduled_time as string).slice(0, 5),
    locationType: row.location_type as string,
    locationLabel: row.location_label as string,
    locationDetails: (row.location_details as string) ?? "",
    status: row.status as AdminBooking["status"],
    paymentStatus: (row.payment_status as string) ?? "unpaid",
    paymentMethod: paymentMethodLabel((row.payment_method as string) ?? ""),
    amountThb: row.amount_thb as number,
    notes: (row.notes as string) ?? "",
    createdAt: row.created_at as string,
  };
}

export async function GET(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterParam = searchParams.get("filter") ?? "upcoming";
  const filter: BookingFilter = VALID_FILTERS.includes(filterParam as BookingFilter)
    ? (filterParam as BookingFilter)
    : "upcoming";

  const today = todayInBangkok();

  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      reference_code,
      customer_name,
      customer_email,
      customer_phone,
      scheduled_date,
      scheduled_time,
      location_type,
      location_label,
      location_details,
      status,
      payment_status,
      payment_method,
      amount_thb,
      notes,
      created_at,
      services ( name )
    `,
    )
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true })
    .limit(100);

  if (filter === "today") {
    query = query
      .eq("scheduled_date", today)
      .in("status", ["pending", "confirmed", "completed"]);
  } else if (filter === "upcoming") {
    query = query
      .gte("scheduled_date", today)
      .in("status", ["pending", "confirmed"]);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const bookings = (data ?? []).map((row) => mapBooking(row as Record<string, unknown>));

  return NextResponse.json({ bookings, filter, today });
}

export async function POST() {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: rpcError } = await supabase.rpc("get_admin_dashboard_stats");

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ stats: data });
}
