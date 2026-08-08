import Link from "next/link";
import type { AvailabilityTeaser } from "@/lib/seo/availability-teaser";

export function AvailabilityBanner({
  teaser,
  bookHref = "/book",
  bookLabel = "Book now",
}: {
  teaser: AvailabilityTeaser;
  bookHref?: string;
  /** e.g. "Book Swedish Massage" */
  bookLabel?: string;
}) {
  const hasOpen = teaser.openSlots > 0;

  return (
    <div className="border border-accent/30 bg-accent-soft/40 px-4 py-4 md:px-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
        {hasOpen ? "Same-day availability" : "Booking"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base">
        {hasOpen ? (
          <>
            <span className="font-medium">
              {teaser.openSlots} slot{teaser.openSlots === 1 ? "" : "s"} available today
            </span>
            {teaser.nextOpenTime ? (
              <>
                {" "}
                · Next available <span className="font-medium">{teaser.nextOpenTime}</span>
              </>
            ) : null}
            <span className="mt-1 block text-muted">
              Live from today’s calendar · Instant email confirmation
            </span>
          </>
        ) : (
          <>Today’s remaining slots are full — pick tomorrow or another open time on the booking form.</>
        )}
      </p>
      <Link
        href={bookHref}
        className="mt-3 inline-flex text-sm font-medium text-accent underline"
      >
        {hasOpen ? bookLabel : "See available times"}
      </Link>
    </div>
  );
}
