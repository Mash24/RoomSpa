import { getStripe } from "@/lib/stripe/server";

type CheckoutInput = {
  customerEmail: string;
  customerName: string;
  bookingId: string;
  referenceCode: string;
  accessPin: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  locationLabel: string;
  /** THB amount from the service catalog / booking snapshot */
  amountThb: number;
  siteUrl: string;
};

/** Stripe Checkout always uses the catalog/booking THB amount (no Stripe Price IDs). */
export async function createBookingCheckoutSession(input: CheckoutInput) {
  const stripe = getStripe();
  const unitAmount = Math.round(Number(input.amountThb) * 100);

  if (!Number.isFinite(unitAmount) || unitAmount < 1) {
    throw new Error("Invalid booking amount for card payment.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "thb",
          unit_amount: unitAmount,
          product_data: {
            name: input.serviceName,
            description: `${input.scheduledDate} at ${input.scheduledTime} · Ref ${input.referenceCode}`,
          },
        },
      },
    ],
    success_url: `${input.siteUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.siteUrl}/my-booking?email=${encodeURIComponent(input.customerEmail)}`,
    metadata: {
      bookingId: input.bookingId,
      referenceCode: input.referenceCode,
      accessPin: input.accessPin,
      serviceName: input.serviceName,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      locationLabel: input.locationLabel,
      customerName: input.customerName,
      amountThb: String(input.amountThb),
    },
    payment_intent_data: {
      metadata: {
        bookingId: input.bookingId,
        referenceCode: input.referenceCode,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session;
}
