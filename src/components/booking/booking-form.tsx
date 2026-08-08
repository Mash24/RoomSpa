"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  catalogProducts,
  getServiceAmountForDuration,
  productPriceLabel,
  serviceAcceptsCardNow,
  serviceCategories,
  type DurationMinutes,
} from "@/content/services";
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { coverageAreas } from "@/content/coverage";
import { whatsappHref } from "@/content/site";
import { PaymentBadges } from "@/components/payment/payment-badges";
import { paymentMethodLabel } from "@/lib/booking/pin";
import type { SlotAvailability } from "@/lib/booking/availability";
import {
  TIME_SLOTS,
  type BookingResult,
  type LocationType,
  type PaymentPreference,
} from "@/lib/booking/types";
import { redirectToUrl } from "@/lib/navigation";

function todayInBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function initialServiceSlug(fromQuery: string | null) {
  if (fromQuery && catalogProducts.some((product) => product.slug === fromQuery)) {
    return fromQuery;
  }
  return catalogProducts[0]?.slug ?? "swedish";
}

function initialDuration(fromQuery: string | null): DurationMinutes {
  const n = Number(fromQuery);
  if (n === 60 || n === 90 || n === 120) return n;
  return 60;
}

export function BookingForm() {
  const searchParams = useSearchParams();
  const [serviceSlug, setServiceSlug] = useState<string>(() =>
    initialServiceSlug(searchParams.get("service")),
  );
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(() =>
    initialDuration(searchParams.get("duration")),
  );
  const [coverageAreaSlug, setCoverageAreaSlug] = useState<string>(coverageAreas[0]?.slug ?? "");
  const [locationType, setLocationType] = useState<LocationType>("hotel");
  const [locationLabel, setLocationLabel] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [scheduledDate, setScheduledDate] = useState(todayInBangkok);
  const [scheduledTime, setScheduledTime] = useState<string>(TIME_SLOTS[2]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(searchParams.get("email") ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const selectedService = useMemo(
    () => catalogProducts.find((product) => product.slug === serviceSlug),
    [serviceSlug],
  );

  const canPayNow = selectedService ? serviceAcceptsCardNow(selectedService) : false;
  const effectivePaymentPreference: PaymentPreference =
    paymentPreference === "card_now" && !canPayNow ? "card_later" : paymentPreference;
  const payNow = effectivePaymentPreference === "card_now";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setSlotsLoading(true);
      try {
        const response = await fetch(`/api/availability?date=${scheduledDate}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error || "Could not load times.");

        const nextSlots = (data.slots ?? []) as SlotAvailability[];
        setSlots(nextSlots);

        const stillOpen = nextSlots.find((slot) => slot.time === scheduledTime && slot.available);
        if (!stillOpen) {
          const firstOpen = nextSlots.find((slot) => slot.available);
          setScheduledTime(firstOpen?.time ?? "");
        }
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setSlots(
            TIME_SLOTS.map((time) => ({
              time,
              booked: 0,
              capacity: 3,
              remaining: 3,
              available: true,
            })),
          );
          setError(err instanceof Error ? err.message : "Could not load times.");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only refetch when the date changes; scheduledTime is adjusted inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledDate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduledTime) {
      setError("Please choose an available time.");
      return;
    }

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
          durationMinutes,
          customerName,
          customerEmail,
          customerPhone,
          notes,
          paymentPreference: effectivePaymentPreference,
          payNow,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Booking failed.");
      }

      const booking = data as BookingResult;
      if (booking.checkoutUrl) {
        redirectToUrl(booking.checkoutUrl);
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
    const manageHref = `/my-booking?email=${encodeURIComponent(result.customerEmail)}`;

    return (
      <div className="border border-border bg-surface-elevated p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Booking received</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">
          You’re booked
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          Reference <span className="font-medium text-foreground">{result.referenceCode}</span> for{" "}
          {result.serviceName} on {result.scheduledDate} at {result.scheduledTime}. Amount:{" "}
          {productPriceLabel(result.amountThb)}.
        </p>
        <p className="mt-2 text-sm text-muted">
          Payment plan: {paymentMethodLabel(result.paymentMethod)}
        </p>

        <div className="mt-6 border border-accent/30 bg-accent-soft/30 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Your booking PIN</p>
          <p className="mt-2 font-display text-4xl tracking-[0.25em] text-foreground">{result.accessPin}</p>
          <p className="mt-3 text-sm text-muted">
            {result.emailSent
              ? `We emailed these details and your PIN to ${result.customerEmail}. Check spam if you do not see it within a few minutes.`
              : `Screenshot or write this down. We could not send email yet — keep this PIN. You’ll need email + PIN to manage your booking or pay by card later.`}
          </p>
        </div>

        <div className="mt-6">
          <PaymentBadges compact />
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={result.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5b]"
          >
            Confirm on WhatsApp
          </a>
          <Link
            href={manageHref}
            className="inline-flex items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Manage booking
          </Link>
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
        <label className="block text-sm">
          <span className="text-muted">Choose a massage</span>
          <select
            required
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          >
            {serviceCategories.map((category) => {
              const options = catalogProducts.filter((product) => product.category === category.id);
              if (options.length === 0) return null;
              return (
                <optgroup key={category.id} label={category.title}>
                  {options.map((product) => (
                    <option key={product.slug} value={product.slug}>
                      {product.name} — {productPriceLabel(product.amountThb)}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>
        {selectedService ? (
          <div className="space-y-4 border border-border bg-surface-elevated p-4">
            <p className="text-sm leading-relaxed text-muted">{selectedService.summary}</p>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Choose duration
              </p>
              <ServicePriceTiers
                className="mt-3"
                service={selectedService}
                selectedMinutes={durationMinutes}
                onSelect={setDurationMinutes}
              />
            </div>
            <p className="text-sm font-medium text-accent">
              Selected: {DURATION_TIER_LABELS[durationMinutes]} ·{" "}
              {productPriceLabel(getServiceAmountForDuration(selectedService, durationMinutes))}
            </p>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-tight text-foreground">2. When & where</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Date</span>
            <input
              type="date"
              required
              min={todayInBangkok()}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <div className="block text-sm sm:col-span-2">
            <span className="text-muted">Available times</span>
            {slotsLoading ? (
              <p className="mt-2 text-sm text-muted">Checking availability...</p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 min-[380px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
                {(slots.length ? slots : TIME_SLOTS.map((time) => ({
                  time,
                  booked: 0,
                  capacity: 3,
                  remaining: 3,
                  available: true,
                }))).map((slot) => {
                  const selected = scheduledTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setScheduledTime(slot.time)}
                      className={`min-h-12 rounded-sm border px-2 py-2.5 text-sm transition ${
                        !slot.available
                          ? "cursor-not-allowed border-border bg-surface text-muted line-through opacity-50"
                          : selected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-surface-elevated text-foreground hover:border-accent"
                      }`}
                    >
                      <span className="block font-medium">{slot.time}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide opacity-80">
                        {slot.available
                          ? slot.remaining <= 1
                            ? "Last spot"
                            : `${slot.remaining} left`
                          : "Full"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-muted">
              Multiple therapists can take the same time. Full slots are hidden from new bookings.
            </p>
          </div>
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

      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-tight text-foreground">4. Payment (optional)</legend>
        <p className="text-sm text-muted">
          No payment is required to book. Choose what works best for you.
        </p>
        <div className="grid gap-3">
          {[
            {
              value: "cash" as const,
              title: "Pay cash on arrival",
              body: "Most popular — book now, pay when your therapist arrives.",
              available: true,
            },
            {
              value: "card_later" as const,
              title: "Pay by card later",
              body: "Save your booking, then pay anytime from My booking with email + PIN.",
              available: true,
            },
            {
              value: "card_now" as const,
              title: "Pay by card now",
              body: canPayNow
                ? "Secure checkout with Visa, Mastercard, or Amex."
                : "Online card checkout is not set up for this service yet — use cash or card later.",
              available: canPayNow,
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`border p-4 transition ${
                !option.available
                  ? "cursor-not-allowed border-border bg-surface opacity-60"
                  : effectivePaymentPreference === option.value
                    ? "cursor-pointer border-accent bg-accent-soft/40"
                    : "cursor-pointer border-border bg-surface-elevated"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentPreference"
                  value={option.value}
                  checked={effectivePaymentPreference === option.value}
                  disabled={!option.available}
                  onChange={() => setPaymentPreference(option.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-foreground">{option.title}</p>
                  <p className="mt-1 text-sm text-muted">{option.body}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
        <PaymentBadges compact />
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
            ? `Total: ${productPriceLabel(getServiceAmountForDuration(selectedService, durationMinutes))} · ${DURATION_TIER_LABELS[durationMinutes]}${
                payNow ? " — you’ll pay by card next" : " — no payment required now"
              }`
            : null}
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting
            ? payNow
              ? "Redirecting to payment..."
              : "Sending booking..."
            : payNow
              ? "Book & pay now"
              : "Request booking"}
        </button>
      </div>
    </form>
  );
}
