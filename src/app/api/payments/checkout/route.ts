import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { getCatalogProduct } from "@/content/pricing";
import { createBookingCheckoutSession } from "@/lib/stripe/checkout";
import { isEmail, normalizeEmail, resolveSiteUrl } from "@/lib/payments/lookup";

type UnpaidBookingRow = {
  id: string;
  reference_code: string;
  service_name: string;
  service_slug: string;
  stripe_price_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  amount_thb: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; bookingId?: string };
    const email = normalizeEmail(body.email || "");
    const bookingId = body.bookingId?.trim();

    if (!isEmail(email) || !bookingId) {
      return NextResponse.json({ error: "Email and booking are required." }, { status: 400 });
    }

    const supabase = createAdminishAnonClient();
    const { data: rows, error } = await supabase.rpc("get_unpaid_bookings_for_email", {
      p_email: email,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const booking = (rows as UnpaidBookingRow[] | null)?.find((row) => row.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "No unpaid booking found for this email." },
        { status: 404 },
      );
    }

    const catalog = getCatalogProduct(booking.service_slug);
    const stripePriceId = booking.stripe_price_id || catalog?.stripePriceId;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Card payment is not available for this booking." },
        { status: 400 },
      );
    }

    const scheduledTime = String(booking.scheduled_time).slice(0, 5);

    const session = await createBookingCheckoutSession({
      priceId: stripePriceId,
      customerEmail: email,
      customerName: email,
      bookingId: booking.id,
      referenceCode: booking.reference_code,
      serviceName: booking.service_name,
      scheduledDate: booking.scheduled_date,
      scheduledTime,
      locationLabel: "See booking details",
      amountThb: booking.amount_thb,
      siteUrl: resolveSiteUrl(request),
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
