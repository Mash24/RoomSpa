import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`${ip}:${email}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase.rpc("get_unpaid_bookings_for_email", {
      p_email: email,
    });

    if (error) {
      if (error.message?.includes("get_unpaid_bookings_for_email")) {
        return NextResponse.json(
          {
            error:
              "Payment lookup is not set up yet. Run supabase/migrations/20260805_payment_optional.sql in Supabase.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const bookings = (data || []).map(
      (row: {
        id: string;
        reference_code: string;
        service_name: string;
        scheduled_date: string;
        scheduled_time: string;
        amount_thb: number;
      }) => ({
        id: row.id,
        referenceMasked: maskReferenceCode(row.reference_code),
        serviceName: row.service_name,
        scheduledDate: row.scheduled_date,
        scheduledTime: String(row.scheduled_time).slice(0, 5),
        amountThb: row.amount_thb,
      }),
    );

    return NextResponse.json({ email, bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
