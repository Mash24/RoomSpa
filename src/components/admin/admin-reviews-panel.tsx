"use client";

import { useEffect, useState } from "react";
import {
  AdminAlert,
  AdminEmpty,
  AdminFilterPills,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSecondaryButton,
} from "@/components/admin/admin-ui";
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
    <div className="space-y-6 md:space-y-8">
      <AdminPageHeader
        eyebrow="Reputation"
        title="Reviews"
        description="Approve or reject guest submissions. Only approved reviews appear on the public site."
      />

      <AdminFilterPills options={FILTERS} value={filter} onChange={onFilterChange} columns={2} />

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      {loading ? (
        <p className="text-sm text-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <AdminEmpty title="No reviews in this view" description="New guest submissions will show up here for moderation." />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="admin-card p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-accent">{starsLabel(review.rating)}</span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs uppercase tracking-wide text-muted">
                  {review.status}
                </span>
                <span className="text-xs text-muted">{formatReviewDate(review.createdAt)}</span>
              </div>
              {review.title ? (
                <p className="mt-3 font-medium text-foreground">{review.title}</p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.body}</p>
              <div className="mt-3 grid gap-1 rounded-xl bg-surface/80 p-3 text-sm text-muted sm:grid-cols-2">
                <p>Guest: {review.authorName}</p>
                <p>Email: {review.authorEmail || "—"}</p>
                <p>Service: {review.serviceName || review.serviceSlug || "—"}</p>
                <p>Ref: {review.bookingReference || "—"}</p>
              </div>
              {review.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminPrimaryButton
                    disabled={updatingId === review.id}
                    onClick={() => moderate(review.id, "approved")}
                  >
                    Approve
                  </AdminPrimaryButton>
                  <AdminSecondaryButton
                    disabled={updatingId === review.id}
                    onClick={() => moderate(review.id, "rejected", "Does not meet guidelines")}
                  >
                    Reject
                  </AdminSecondaryButton>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
