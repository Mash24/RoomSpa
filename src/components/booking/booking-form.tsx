"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { catalogProducts, productPriceLabel } from "@/content/pricing";
import { coverageAreas } from "@/content/coverage";
import { whatsappHref } from "@/content/site";
import { TIME_SLOTS, type BookingResult, type LocationType } from "@/lib/booking/types";

const today = () => new Date().toISOString().slice(0, 10);

export function BookingForm() {
  const [serviceSlug, setServiceSlug] = useState<string>(catalogProducts[0]?.slug ?? "swedish");
  const [coverageAreaSlug, setCoverageAreaSlug] = useState<string>(coverageAreas[0]?.slug ?? "");
  const [locationType, setLocationType] = useState<LocationType>("hotel");
  const [locationLabel, setLocationLabel] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [scheduledDate, setScheduledDate] = useState(today());
  const [scheduledTime, setScheduledTime] = useState<string>(TIME_SLOTS[2]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const selectedService = useMemo(
    () => catalogProducts.find((product) => product.slug === serviceSlug),
    [serviceSlug],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          coverageAreaSlug,
          locationType,
          locationLabel,
          locationDetails,
          scheduledDate,
          scheduledTime,
          customerName,
          customerEmail,
          customerPhone,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Booking failed.");
      }

      const booking = data as BookingResult;
      if (booking.checkoutUrl) {
        window.location.href = booking.checkoutUrl;
        return;
      }

      setResult(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="border border-border bg-surface-elevated p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Request received</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">
          You’re almost booked
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          Reference <span className="font-medium text-foreground">{result.referenceCode}</span> for{" "}
          {result.serviceName} on {result.scheduledDate} at {result.scheduledTime}. Amount:{" "}
          {productPriceLabel(result.amountThb)}.
        </p>
        <p className="mt-3 text-sm text-muted">
          Tap WhatsApp to confirm with us now — we reply quickly.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href={result.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5b]"
          >
            Confirm on WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-tight text-foreground">1. Service</legend>
        <div className="grid gap-3">
          {catalogProducts.map((product) => {
            const selected = product.slug === serviceSlug;
            return (
              <label
                key={product.slug}
                className={`cursor-pointer border p-4 transition ${
                  selected ? "border-accent bg-accent-soft/40" : "border-border bg-surface-elevated"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="service"
                    value={product.slug}
                    checked={selected}
                    onChange={() => setServiceSlug(product.slug)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="mt-1 text-sm text-muted">{product.summary}</p>
                    <p className="mt-2 text-sm font-medium text-accent">
                      {productPriceLabel(product.amountThb)} · {product.duration}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-tight text-foreground">2. When & where</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Date</span>
            <input
              type="date"
              required
              min={today()}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Time</span>
            <select
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-muted">Coverage area</span>
          <select
            required
            value={coverageAreaSlug}
            onChange={(e) => setCoverageAreaSlug(e.target.value)}
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          >
            {coverageAreas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name}
                {area.travelFeeThb > 0 ? ` (+฿${area.travelFeeThb} travel)` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          {(["hotel", "condo", "home"] as LocationType[]).map((type) => (
            <label
              key={type}
              className={`cursor-pointer border px-3 py-3 text-center text-sm capitalize transition ${
                locationType === type
                  ? "border-accent bg-accent-soft/40 text-foreground"
                  : "border-border bg-surface-elevated text-muted"
              }`}
            >
              <input
                type="radio"
                name="locationType"
                value={type}
                checked={locationType === type}
                onChange={() => setLocationType(type)}
                className="sr-only"
              />
              {type}
            </label>
          ))}
        </div>

        <label className="block text-sm">
          <span className="text-muted">
            {locationType === "hotel" ? "Hotel name" : locationType === "condo" ? "Condo name" : "Address / area"}
          </span>
          <input
            required
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder={locationType === "hotel" ? "e.g. Anantara Chiang Mai" : "e.g. Near Nimman Soi 9"}
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Room / floor / extra details (optional)</span>
          <input
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-tight text-foreground">3. Your details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-muted">Full name</span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Email</span>
            <input
              required
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Phone / WhatsApp</span>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+66 ..."
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-muted">Notes (optional)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>
      </fieldset>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
          <p className="mt-2">
            Prefer WhatsApp?{" "}
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="underline">
              Message us directly
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
            {selectedService
              ? `Total: ${productPriceLabel(selectedService.amountThb)} — pay securely with Stripe`
              : null}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Redirecting to payment..." : "Book & pay"}
          </button>
      </div>
    </form>
  );
}
