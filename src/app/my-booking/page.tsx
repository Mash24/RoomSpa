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
    <section className="mx-auto max-w-2xl px-4 py-12 xs:px-5 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">My booking</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Manage your booking
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
        Enter the email and PIN from your confirmation.
      </p>

      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
          <ManageBookingForm />
        </Suspense>
      </div>
    </section>
  );
}
