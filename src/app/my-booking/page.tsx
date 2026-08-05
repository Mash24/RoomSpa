import type { Metadata } from "next";
import { Suspense } from "react";
import { ManageBookingForm } from "@/components/payment/manage-booking-form";

export const metadata: Metadata = {
  title: "Manage your booking",
  description:
    "Find your RoomSpa booking with email and PIN. Pay by card, check status, or manage your appointment.",
};

export default function ManageBookingPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">My booking</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Manage your booking
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Enter the email and 4-digit PIN from your booking confirmation. Pay by card, check payment
        status, or contact us about changes.
      </p>

      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
          <ManageBookingForm />
        </Suspense>
      </div>
    </section>
  );
}
