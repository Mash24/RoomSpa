import Link from "next/link";
import type { AvailabilityTeaser } from "@/lib/seo/availability-teaser";

export function AvailabilityBanner({
  teaser,
  bookHref = "/book",
}: {
  teaser: AvailabilityTeaser;
  bookHref?: string;
}) {
  const hasOpen = teaser.openSlots > 0;

  return (
    <div className="border border-accent/30 bg-accent-soft/40 px-4 py-4 md:px-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
        {hasOpen ? "Same-day availability" : "Booking"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base">
        {hasOpen
          ? `${teaser.openSlots} of ${teaser.totalSlots} time slots still open today (${teaser.date}${
              teaser.nextOpenTime ? `, next ${teaser.nextOpenTime}` : ""
            }). Instant online booking with email confirmation.`
          : `Today’s listed slots are full — choose tomorrow or another open time on the booking form.`}
      </p>
      <Link
        href={bookHref}
        className="mt-3 inline-flex text-sm font-medium text-accent underline"
      >
        {hasOpen ? "Book an open slot" : "See available times"}
      </Link>
    </div>
  );
}
