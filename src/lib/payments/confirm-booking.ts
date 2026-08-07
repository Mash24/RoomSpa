import { getStripe } from "@/lib/stripe/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { sendBookingPaidEmail } from "@/lib/email/booking";
import { resolveSiteUrl } from "@/lib/payments/lookup";

export async function confirmBookingPayment(sessionId: string, request?: Request) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { ok: false as const, error: "Payment not completed yet.", updated: false, emailSent: false };
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    return { ok: false as const, error: "Booking not found in payment session.", updated: false, emailSent: false };
  }

  const meta = session.metadata || {};
  const supabase = createAdminishAnonClient();
  const { data: updated, error } = await supabase.rpc("mark_booking_paid", {
    p_booking_id: bookingId,
    p_stripe_session_id: session.id,
    p_stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
  });

  if (error) {
    return { ok: false as const, error: error.message, updated: false, emailSent: false };
  }

  const wasUpdated = Boolean(updated);
  let emailSent = false;

  // Only email on the first successful mark-paid (avoids duplicates on page refresh).
  if (wasUpdated) {
    const customerEmail =
      session.customer_email ||
      session.customer_details?.email ||
      "";

    if (customerEmail) {
      const siteUrl = request
        ? resolveSiteUrl(request)
        : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.getroomspa.com";

      const emailResult = await sendBookingPaidEmail({
        customerName: meta.customerName || customerEmail,
        customerEmail,
        referenceCode: meta.referenceCode || "",
        accessPin: meta.accessPin || "",
        serviceName: meta.serviceName || "RoomSpa booking",
        scheduledDate: meta.scheduledDate || "",
        scheduledTime: meta.scheduledTime || "",
        locationLabel: meta.locationLabel || "",
        amountThb: Number(meta.amountThb || 0),
        paymentMethod: "card",
        siteUrl,
      });
      emailSent = emailResult.sent;
    }
  }

  return { ok: true as const, updated: wasUpdated, emailSent };
}
