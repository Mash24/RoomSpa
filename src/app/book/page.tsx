import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Book Appointment",
  description:
    "Book a RoomSpa massage at your hotel, condo, or home. No payment required — pay cash on arrival or by card later.",
};

export default function BookPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Book</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Book your in-room massage
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        No payment required to book. Pay cash on arrival, or{" "}
        <a href="/my-booking" className="text-accent underline">
          pay by card later
        </a>
        . Prefer chat?{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          WhatsApp us
        </a>
        .
      </p>

      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted">Loading booking form...</p>}>
          <BookingForm />
        </Suspense>
      </div>
    </section>
  );
}
