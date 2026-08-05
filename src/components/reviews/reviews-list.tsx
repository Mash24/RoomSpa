import { formatReviewDate, starsLabel } from "@/lib/reviews/map";
import type { PublicReview } from "@/lib/reviews/types";

type Props = {
  reviews: PublicReview[];
};

export function ReviewsList({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="border border-border bg-surface-elevated p-6 text-sm text-muted">
        No published reviews yet. Be the first to share your experience — submissions appear after
        moderation.
      </div>
    );
  }

  return (
    <ul className="space-y-8">
      {reviews.map((review) => (
        <li key={review.id} className="border-t border-border pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-accent" aria-label={`${review.rating} out of 5 stars`}>
              {starsLabel(review.rating)}
            </span>
            <span className="text-xs text-muted">{formatReviewDate(review.createdAt)}</span>
          </div>
          {review.title ? (
            <h3 className="mt-3 font-display text-2xl text-foreground">{review.title}</h3>
          ) : null}
          <blockquote className="mt-3 font-display text-xl leading-relaxed text-foreground md:text-2xl">
            “{review.body}”
          </blockquote>
          <p className="mt-4 text-sm text-muted">
            {review.authorName}
            {review.serviceName ? ` · ${review.serviceName}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
