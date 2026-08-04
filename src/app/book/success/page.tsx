import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe/server";
import { productPriceLabel } from "@/content/pricing";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your RoomSpa booking payment was successful.",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function buildPaidWhatsAppHref(meta: Record<string, string>) {
  const number = site.contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    [
      `Hi RoomSpa! I just paid for my booking.`,
      `Ref: ${meta.referenceCode || "—"}`,
      `Name: ${meta.customerName || "—"}`,
      `Service: ${meta.serviceName || "—"}`,
      `When: ${meta.scheduledDate || "—"} at ${meta.scheduledTime || "—"}`,
      `Where: ${meta.locationLabel || "—"}`,
      `Payment: completed via Stripe.`,
    ].join("\n"),
  );
  return `https://wa.me/${number}?text=${message}`;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 md:px-8">
        <h1 className="font-display text-4xl tracking-tight">Missing payment session</h1>
        <p className="mt-4 text-muted">Return to booking and try again.</p>
        <Link href="/book" className="mt-6 inline-flex text-accent underline">
          Back to book
        </Link>
      </section>
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paid = session.payment_status === "paid";
  const meta = (session.metadata || {}) as Record<string, string>;
  const amountThb = Number(meta.amountThb || 0);
  const whatsappHref = buildPaidWhatsAppHref(meta);

  return (
    <section className="mx-auto max-w-2xl px-5 py-24 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {paid ? "Paid" : "Checkout complete"}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {paid ? "Payment successful" : "Thanks — we’re confirming payment"}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Reference <span className="font-medium text-foreground">{meta.referenceCode || "—"}</span>
        {meta.serviceName ? ` for ${meta.serviceName}` : ""}.
        {amountThb ? ` Amount: ${productPriceLabel(amountThb)}.` : ""}
      </p>
      {meta.scheduledDate ? (
        <p className="mt-2 text-sm text-muted">
          {meta.scheduledDate} at {meta.scheduledTime} · {meta.locationLabel}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5b]"
        >
          Send booking details on WhatsApp
        </a>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Back to home
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">
        Test card in Stripe sandbox: <span className="font-medium text-foreground">4242 4242 4242 4242</span>,
        any future expiry, any CVC.
      </p>
    </section>
  );
}
