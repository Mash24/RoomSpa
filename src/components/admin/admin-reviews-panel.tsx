"use client";

import { useEffect, useState } from "react";
import { formatReviewDate, starsLabel } from "@/lib/reviews/map";
import type { AdminReview, ReviewStatus } from "@/lib/reviews/types";

const FILTERS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export function AdminReviewsPanel() {
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/admin/reviews?status=${filter}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "Could not load reviews.");
        setReviews(data.reviews || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load reviews.");
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  async function moderate(id: string, status: ReviewStatus, rejectionReason = "") {
    setUpdatingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update review.");

      setReviews((current) =>
        filter === "pending" || filter === "all"
          ? filter === "pending"
            ? current.filter((review) => review.id !== id)
            : current.map((review) =>
                review.id === id ? { ...review, status, rejectionReason } : review,
              )
          : current.filter((review) => review.id !== id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update review.");
    } finally {
      setUpdatingId(null);
    }
  }

  function onFilterChange(next: ReviewStatus | "all") {
    setLoading(true);
    setFilter(next);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-foreground">Reviews</h1>
        <p className="mt-2 text-sm text-muted">
          Approve or reject guest submissions. Only approved reviews appear on the public site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={
              filter === item.value
                ? "rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                : "rounded-sm border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="border border-border bg-surface-elevated p-6 text-sm text-muted">
          No reviews in this view.
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border border-border bg-surface-elevated p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-accent">{starsLabel(review.rating)}</span>
                <span className="rounded-sm border border-border px-2 py-0.5 text-xs uppercase tracking-wide text-muted">
                  {review.status}
                </span>
                <span className="text-xs text-muted">{formatReviewDate(review.createdAt)}</span>
              </div>
              {review.title ? (
                <p className="mt-3 font-medium text-foreground">{review.title}</p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.body}</p>
              <div className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">
                <p>Guest: {review.authorName}</p>
                <p>Email: {review.authorEmail || "—"}</p>
                <p>Service: {review.serviceName || review.serviceSlug || "—"}</p>
                <p>Ref: {review.bookingReference || "—"}</p>
              </div>
              {review.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updatingId === review.id}
                    onClick={() => moderate(review.id, "approved")}
                    className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === review.id}
                    onClick={() => moderate(review.id, "rejected", "Does not meet guidelines")}
                    className="rounded-sm border border-border px-4 py-2 text-sm disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
