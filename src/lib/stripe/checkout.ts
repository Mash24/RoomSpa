import { getStripe } from "@/lib/stripe/server";

type CheckoutInput = {
  /** Prefer a Stripe Price ID when the service has one in the catalog. */
  priceId?: string | null;
  customerEmail: string;
  customerName: string;
  bookingId: string;
  referenceCode: string;
  accessPin: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  locationLabel: string;
  amountThb: number;
  siteUrl: string;
};

function buildLineItem(input: CheckoutInput) {
  if (input.priceId) {
    return {
      price: input.priceId,
      quantity: 1,
    };
  }

  const unitAmount = Math.round(Number(input.amountThb) * 100);
  if (!Number.isFinite(unitAmount) || unitAmount < 1) {
    throw new Error("Invalid booking amount for card payment.");
  }

  return {
    quantity: 1,
    price_data: {
      currency: "thb",
      unit_amount: unitAmount,
      product_data: {
        name: input.serviceName,
        description: `${input.scheduledDate} at ${input.scheduledTime} · Ref ${input.referenceCode}`,
      },
    },
  };
}

export async function createBookingCheckoutSession(input: CheckoutInput) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: [buildLineItem(input)],
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
