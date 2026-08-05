"use client";

import { useState } from "react";
import { catalogProducts } from "@/content/services";
import {
  REVIEW_MAX_BODY,
  REVIEW_MAX_NAME,
  REVIEW_MAX_TITLE,
  REVIEW_MIN_BODY,
  reviewGuidelines,
} from "@/lib/reviews/rules";

export function ReviewForm() {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          authorEmail,
          rating,
          title,
          body,
          serviceSlug: serviceSlug || undefined,
          bookingReference: bookingReference || undefined,
          acceptedGuidelines,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit review.");

      setSuccess(data.message || "Review submitted for moderation.");
      setAuthorName("");
      setAuthorEmail("");
      setRating(5);
      setTitle("");
      setBody("");
      setServiceSlug("");
      setBookingReference("");
      setAcceptedGuidelines(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-border bg-surface-elevated p-6 md:p-8">
      <div>
        <h2 className="font-display text-2xl text-foreground md:text-3xl">Write a review</h2>
        <p className="mt-2 text-sm text-muted">
          Reviews are moderated before they appear. Please follow the guidelines below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-1">
          <span className="text-muted">Your name *</span>
          <input
            required
            value={authorName}
            maxLength={REVIEW_MAX_NAME}
            onChange={(e) => setAuthorName(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Email (optional, not shown publicly)</span>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm text-muted">Rating *</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`rounded-sm border px-3 py-2 text-sm transition ${
                rating === value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-foreground hover:border-accent"
              }`}
              aria-pressed={rating === value}
            >
              {value} ★
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="text-muted">Title (optional)</span>
        <input
          value={title}
          maxLength={REVIEW_MAX_TITLE}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short headline"
          className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">Your review *</span>
        <textarea
          required
          rows={5}
          minLength={REVIEW_MIN_BODY}
          maxLength={REVIEW_MAX_BODY}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What stood out about your session?"
          className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-accent"
        />
        <span className="mt-1 block text-xs text-muted">
          {body.length}/{REVIEW_MAX_BODY} · minimum {REVIEW_MIN_BODY} characters
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Service (optional)</span>
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-accent"
          >
            <option value="">Select a service</option>
            {catalogProducts.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Booking ref (optional)</span>
          <input
            value={bookingReference}
            onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
            placeholder="RS-XXXXXXXX"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="border border-border bg-surface p-4 text-sm">
        <p className="font-medium text-foreground">What you can post</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {reviewGuidelines.allowed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 font-medium text-foreground">What you cannot post</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {reviewGuidelines.notAllowed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={acceptedGuidelines}
          onChange={(e) => setAcceptedGuidelines(e.target.checked)}
          className="mt-1"
          required
        />
        <span>I confirm this review follows the guidelines and is about my RoomSpa experience.</span>
      </label>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit for moderation"}
      </button>
    </form>
  );
}
