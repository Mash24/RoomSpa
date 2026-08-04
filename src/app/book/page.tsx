import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/booking-form";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Book Appointment",
  description:
    "Book a RoomSpa massage at your hotel, condo, or home. Choose service, time, and location — confirm on WhatsApp.",
};

export default function BookPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Book</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Book your in-room massage
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        Pick a service and time, then pay securely with Stripe. Prefer chat?{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          WhatsApp us
        </a>
        .
      </p>

      <div className="mt-10">
        <BookingForm />
      </div>
    </section>
  );
}
