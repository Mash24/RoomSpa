import type { Metadata } from "next";
import { Suspense } from "react";
import { PayForm } from "@/components/payment/pay-form";

export const metadata: Metadata = {
  title: "Pay for your booking",
  description:
    "Pay for your RoomSpa booking by card. Enter the email you used when booking — no account needed.",
};

export default function PayPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Payment</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Pay for your booking
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Enter the email you used when booking. Cash on arrival is always fine too — card payment is
        optional.
      </p>

      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
          <PayForm />
        </Suspense>
      </div>
    </section>
  );
}
