import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { whatsappHref } from "@/content/site";
import { getPublicCatalog } from "@/lib/catalog/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Appointment",
  description:
    "Book a RoomSpa massage at your hotel, condo, or home in Chiang Mai. Pay by card, pay later, or cash on arrival.",
};

export default async function BookPage() {
  const products = await getPublicCatalog();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Book</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Book your in-room massage
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
        Pick a service, time, and place. Pay by card now,{" "}
        <a href="/my-booking" className="text-accent underline">
          pay later
        </a>
        , or cash on arrival. Prefer chat?{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          WhatsApp
        </a>
        .
      </p>

      <div className="mt-8 xs:mt-10">
        <Suspense fallback={<p className="text-sm text-muted">Loading booking form...</p>}>
          <BookingForm products={products} />
        </Suspense>
      </div>
    </section>
  );
}
