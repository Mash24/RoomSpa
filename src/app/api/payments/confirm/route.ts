import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed yet." }, { status: 400 });
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      return NextResponse.json({ error: "Booking not found in payment session." }, { status: 400 });
    }

    const supabase = createAdminishAnonClient();
    const { data: updated, error } = await supabase.rpc("mark_booking_paid", {
      p_booking_id: bookingId,
      p_stripe_session_id: session.id,
      p_stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ updated: Boolean(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
