import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { paymentMethodLabel } from "@/lib/booking/pin";
import { isEmail, maskReferenceCode, normalizeEmail } from "@/lib/payments/lookup";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; pin?: string };
    const email = normalizeEmail(body.email || "");
    const pin = (body.pin || "").trim();

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    if (!isValidPin(pin)) {
      return NextResponse.json({ error: "Please enter your 4-digit booking PIN." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`${ip}:${email}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase.rpc("get_bookings_for_email_and_pin", {
      p_email: email,
      p_pin: pin,
    });

    if (error) {
      if (error.message?.includes("get_bookings_for_email_and_pin")) {
        return NextResponse.json(
          {
            error:
              "Booking lookup is not set up yet. Run supabase/migrations/20260805_booking_pin.sql in Supabase.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No bookings found. Check your email and 4-digit PIN." },
        { status: 404 },
      );
    }

    const bookings = data.map(
      (row: {
        id: string;
        reference_code: string;
        service_name: string;
        scheduled_date: string;
        scheduled_time: string;
        amount_thb: number;
        payment_status: string;
        payment_method: string;
      }) => ({
        id: row.id,
        referenceMasked: maskReferenceCode(row.reference_code),
        serviceName: row.service_name,
        scheduledDate: row.scheduled_date,
        scheduledTime: String(row.scheduled_time).slice(0, 5),
        amountThb: row.amount_thb,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        paymentMethodLabel: paymentMethodLabel(row.payment_method),
        canPay: row.payment_status === "unpaid",
      }),
    );

    return NextResponse.json({ email, bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
