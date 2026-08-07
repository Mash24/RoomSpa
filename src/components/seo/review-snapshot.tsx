import Link from "next/link";
import { starsLabel } from "@/lib/reviews/map";
import type { PublicReview } from "@/lib/reviews/types";

export function ReviewSnapshot({
  reviews,
  heading = "Guest reviews",
}: {
  reviews: PublicReview[];
  heading?: string;
}) {
  if (reviews.length === 0) {
    return (
      <section className="border-t border-border pt-10">
        <h2 className="font-display text-2xl tracking-tight text-foreground">{heading}</h2>
        <p className="mt-3 text-sm text-muted">
          No published reviews for this view yet.{" "}
          <Link href="/reviews" className="text-accent underline">
            Be the first to review
          </Link>
          .
        </p>
      </section>
    );
  }

  const avg =
    reviews.reduce((sum, review) => sum + review.rating, 0) / Math.max(reviews.length, 1);

  return (
    <section className="border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-foreground">{heading}</h2>
          <p className="mt-2 text-sm text-muted">
            <span className="text-accent" aria-label={`${avg.toFixed(1)} out of 5`}>
              {starsLabel(Math.round(avg))}
            </span>{" "}
            {avg.toFixed(1)} average · {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/reviews" className="text-sm text-accent underline">
          All reviews
        </Link>
      </div>
      <ul className="mt-6 space-y-4">
        {reviews.slice(0, 4).map((review) => (
          <li key={review.id} className="border border-border bg-surface-elevated p-4">
            <p className="text-sm text-accent">{starsLabel(review.rating)}</p>
            {review.title ? (
              <p className="mt-1 font-medium text-foreground">{review.title}</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-muted">“{review.body}”</p>
            <p className="mt-3 text-xs text-muted">
              — {review.authorName}
              {review.serviceName ? ` · ${review.serviceName}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
