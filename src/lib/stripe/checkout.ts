import { getStripe } from "@/lib/stripe/server";

type CheckoutInput = {
  priceId: string;
  customerEmail: string;
  customerName: string;
  bookingId: string;
  referenceCode: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  locationLabel: string;
  amountThb: number;
  siteUrl: string;
};

export async function createBookingCheckoutSession(input: CheckoutInput) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: [
      {
        price: input.priceId,
        quantity: 1,
      },
    ],
    success_url: `${input.siteUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.siteUrl}/pay?email=${encodeURIComponent(input.customerEmail)}`,
    metadata: {
      bookingId: input.bookingId,
      referenceCode: input.referenceCode,
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
