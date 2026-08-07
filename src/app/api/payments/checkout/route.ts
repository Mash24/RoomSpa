import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { createBookingCheckoutSession } from "@/lib/stripe/checkout";
import { isEmail, normalizeEmail, resolveSiteUrl } from "@/lib/payments/lookup";

type BookingRow = {
  id: string;
  reference_code: string;
  service_name: string;
  service_slug: string;
  scheduled_date: string;
  scheduled_time: string;
  amount_thb: number;
  payment_status: string;
  customer_name?: string | null;
};

function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; pin?: string; bookingId?: string };
    const email = normalizeEmail(body.email || "");
    const pin = (body.pin || "").trim();
    const bookingId = body.bookingId?.trim();

    if (!isEmail(email) || !isValidPin(pin) || !bookingId) {
      return NextResponse.json({ error: "Email, PIN, and booking are required." }, { status: 400 });
    }

    const supabase = createAdminishAnonClient();
    const { data: rows, error } = await supabase.rpc("get_bookings_for_email_and_pin", {
      p_email: email,
      p_pin: pin,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const booking = (rows as BookingRow[] | null)?.find((row) => row.id === bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json({ error: "This booking is already paid." }, { status: 400 });
    }

    const amountThb = Number(booking.amount_thb);
    if (!(amountThb > 0)) {
      return NextResponse.json(
        { error: "Card payment is not available for this booking." },
        { status: 400 },
      );
    }

    const scheduledTime = String(booking.scheduled_time).slice(0, 5);

    const session = await createBookingCheckoutSession({
      customerEmail: email,
      customerName: booking.customer_name?.trim() || email,
      bookingId: booking.id,
      referenceCode: booking.reference_code,
      accessPin: pin,
      serviceName: booking.service_name,
      scheduledDate: booking.scheduled_date,
      scheduledTime,
      locationLabel: "See booking details",
      amountThb,
      siteUrl: resolveSiteUrl(request),
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
