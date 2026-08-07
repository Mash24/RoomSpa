import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { BookingStatus } from "@/lib/admin/types";
import { sendBookingStatusEmail } from "@/lib/email/booking";
import { resolveSiteUrl } from "@/lib/payments/lookup";

const VALID_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

type BookingRow = {
  id: string;
  reference_code: string;
  access_pin: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  scheduled_date: string;
  scheduled_time: string;
  location_type: string;
  location_label: string;
  location_details: string | null;
  notes: string | null;
  amount_thb: number;
  payment_method: string | null;
  status: BookingStatus;
  services: { name: string } | { name: string }[] | null;
};

function serviceName(row: BookingRow) {
  const services = row.services;
  if (Array.isArray(services)) return services[0]?.name ?? "RoomSpa service";
  return services?.name ?? "RoomSpa service";
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status as BookingStatus | undefined;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const previousStatus = existing.status as BookingStatus;

  const { data, error: dbError } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select(
      `
      id,
      reference_code,
      access_pin,
      customer_name,
      customer_email,
      customer_phone,
      scheduled_date,
      scheduled_time,
      location_type,
      location_label,
      location_details,
      notes,
      amount_thb,
      payment_method,
      status,
      services ( name )
    `,
    )
    .single();

  if (dbError || !data) {
    return NextResponse.json({ error: dbError?.message || "Could not update booking." }, { status: 400 });
  }

  const row = data as unknown as BookingRow;
  let emailSent = false;

  if (previousStatus !== status && row.customer_email) {
    const emailResult = await sendBookingStatusEmail({
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone ?? undefined,
      referenceCode: row.reference_code,
      accessPin: row.access_pin ?? "",
      serviceName: serviceName(row),
      scheduledDate: row.scheduled_date,
      scheduledTime: String(row.scheduled_time).slice(0, 5),
      locationType: row.location_type,
      locationLabel: row.location_label,
      locationDetails: row.location_details ?? "",
      notes: row.notes ?? "",
      amountThb: Number(row.amount_thb),
      paymentMethod: row.payment_method ?? "",
      siteUrl: resolveSiteUrl(request),
      status,
      previousStatus,
    });
    emailSent = emailResult.sent;
  }

  return NextResponse.json({
    booking: {
      id: row.id,
      reference_code: row.reference_code,
      status: row.status,
    },
    emailSent,
  });
}
