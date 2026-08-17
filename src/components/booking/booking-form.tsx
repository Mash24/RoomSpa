"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  catalogProducts,
  getServiceAmountForDuration,
  isSignatureExperience,
  productPriceLabel,
  serviceAcceptsCardNow,
  type CatalogService,
  type DurationMinutes,
} from "@/content/services";
import { experienceTierLabels } from "@/lib/catalog/experience-tier";
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { coverageAreas } from "@/content/coverage";
import { whatsappHref } from "@/content/site";
import { PaymentBadges } from "@/components/payment/payment-badges";
import { paymentMethodLabel } from "@/lib/booking/pin";
import {
  type BookingResult,
  type LocationType,
  type PaymentPreference,
  type TherapistPreference,
} from "@/lib/booking/types";
import type { AvailableTherapist } from "@/lib/therapists/bookability";
import { BookingTherapistPicker, formatSlot12h } from "@/components/booking/booking-therapist-picker";
import { redirectToUrl } from "@/lib/navigation";

function todayInBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function pickServiceSlug(list: CatalogService[], fromQuery: string | null) {
  if (fromQuery && list.some((product) => product.slug === fromQuery)) {
    return fromQuery;
  }
  const featuredPrivate = list.find(
    (service) => service.featured && isSignatureExperience(service),
  );
  if (featuredPrivate) return featuredPrivate.slug;

  const anyPrivate = list.find(isSignatureExperience);
  if (anyPrivate) return anyPrivate.slug;

  const featured = list.find((service) => service.featured);
  return featured?.slug ?? list[0]?.slug ?? "tantric";
}

function initialDuration(fromQuery: string | null): DurationMinutes {
  const n = Number(fromQuery);
  if (n === 60 || n === 90 || n === 120) return n;
  return 60;
}

type Props = {
  products?: CatalogService[];
};

export function BookingForm({ products: initialProducts }: Props) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CatalogService[]>(
    initialProducts?.length ? initialProducts : catalogProducts,
  );
  const [serviceSlug, setServiceSlug] = useState<string>(() =>
    pickServiceSlug(
      initialProducts?.length ? initialProducts : catalogProducts,
      searchParams.get("service"),
    ),
  );
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(() =>
    initialDuration(searchParams.get("duration")),
  );
  const [coverageAreaSlug, setCoverageAreaSlug] = useState<string>(() => {
    const fromQuery = searchParams.get("coverage");
    if (fromQuery && coverageAreas.some((area) => area.slug === fromQuery)) return fromQuery;
    return coverageAreas[0]?.slug ?? "";
  });
  const [locationType, setLocationType] = useState<LocationType>("hotel");
  const [locationLabel, setLocationLabel] = useState(searchParams.get("place") ?? "");
  const [locationDetails, setLocationDetails] = useState("");
  const [scheduledDate, setScheduledDate] = useState(todayInBangkok);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(searchParams.get("email") ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [therapistRef, setTherapistRef] = useState<string | null>(searchParams.get("therapist"));
  const [therapistPreference, setTherapistPreference] = useState<TherapistPreference>(
    searchParams.get("therapist") ? "specific" : "best_available",
  );
  const [bookableTherapists, setBookableTherapists] = useState<AvailableTherapist[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  });
  const [geocoding, setGeocoding] = useState(false);
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/catalog");
        const data = await res.json();
        if (!res.ok || cancelled) return;
        const next = (data.services as CatalogService[]) || [];
        if (!next.length) return;
        setProducts(next);
        setServiceSlug((current) =>
          next.some((product) => product.slug === current)
            ? current
            : pickServiceSlug(next, searchParams.get("service")),
        );
      } catch {
        // Keep server-provided / static catalog.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const selectedService = useMemo(
    () => products.find((product) => product.slug === serviceSlug),
    [products, serviceSlug],
  );

  const canPayNow = selectedService ? serviceAcceptsCardNow(selectedService) : false;
  const effectivePaymentPreference: PaymentPreference =
    paymentPreference === "card_now" && !canPayNow ? "card_later" : paymentPreference;
  const payNow = effectivePaymentPreference === "card_now";

  const totalLabel = selectedService
    ? productPriceLabel(getServiceAmountForDuration(selectedService, durationMinutes))
    : null;

  const slotSummary = useMemo(() => {
    if (!scheduledTime) return null;
    const therapistName =
      therapistPreference === "specific" && therapistRef
        ? bookableTherapists.find((t) => t.id === therapistRef)?.displayName
        : null;
    const timeLabel = formatSlot12h(scheduledTime);
    if (therapistName) return `${therapistName} · ${timeLabel}`;
    if (therapistPreference === "best_available") return `Anyone available · ${timeLabel}`;
    return timeLabel;
  }, [scheduledTime, therapistPreference, therapistRef, bookableTherapists]);

  const submitLabel = submitting
    ? payNow
      ? "Redirecting…"
      : "Sending…"
    : payNow
      ? "Book & pay now"
      : "Request booking";

  const initialPlace = searchParams.get("place") ?? "";
  const hasPresetCoords = Boolean(searchParams.get("lat") && searchParams.get("lng"));

  useEffect(() => {
    if (!locationLabel.trim() || locationLabel.trim().length < 4) {
      if (!hasPresetCoords) setCoords(null);
      return;
    }
    if (hasPresetCoords && locationLabel.trim() === initialPlace.trim()) {
      return;
    }
    const t = setTimeout(() => {
      void (async () => {
        setGeocoding(true);
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationLabel.trim())}`);
          const data = await res.json();
          if (res.ok && data.lat != null && data.lng != null) {
            setCoords({ lat: data.lat, lng: data.lng });
          }
        } catch {
          setCoords(null);
        } finally {
          setGeocoding(false);
        }
      })();
    }, 600);
    return () => clearTimeout(t);
  }, [locationLabel, hasPresetCoords, initialPlace]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!serviceSlug || !scheduledDate || !coverageAreaSlug) {
        setBookableTherapists([]);
        return;
      }
      setAvailabilityLoading(true);
      try {
        const params = new URLSearchParams({
          service: serviceSlug,
          date: scheduledDate,
          duration: String(durationMinutes),
          coverage: coverageAreaSlug,
        });
        if (coords) {
          params.set("lat", String(coords.lat));
          params.set("lng", String(coords.lng));
          params.set("inferCoverage", "1");
        }
        const res = await fetch(`/api/therapists/availability?${params}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Could not load availability.");
        setBookableTherapists(data.therapists || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setBookableTherapists([]);
          setError(err instanceof Error ? err.message : "Could not load availability.");
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceSlug, scheduledDate, durationMinutes, coverageAreaSlug, coords]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduledTime) {
      setError("Please choose an available time.");
      return;
    }
    if (therapistPreference === "specific" && !therapistRef) {
      setError("Please choose a therapist and time.");
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
          therapistSlug: therapistPreference === "specific" ? therapistRef : null,
          therapistPreference,
          lat: coords?.lat,
          lng: coords?.lng,
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
          {result.serviceName} on {result.scheduledDate} at {formatSlot12h(result.scheduledTime)}.
          {result.therapistDisplayName ? (
            <>
              {" "}
              Therapist:{" "}
              <span className="font-medium text-foreground">
                {result.therapistDisplayName}
                {result.therapistAssignment === "best_available" ? " (best available)" : ""}
              </span>
              .
            </>
          ) : null}{" "}
          Amount: {productPriceLabel(result.amountThb)}.
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
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5b]"
          >
            Confirm on WhatsApp
          </a>
          <Link
            href={manageHref}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Manage booking
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="booking-form-with-bar space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-xl tracking-tight text-foreground xs:text-2xl">1. Service</legend>
        <label className="block text-sm">
          <span className="text-muted">Choose a massage</span>
          <select
            required
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          >
            {(() => {
              const signature = products.filter(isSignatureExperience);
              const wellness = products.filter((p) => !isSignatureExperience(p));
              return (
                <>
                  {signature.length > 0 ? (
                    <optgroup label={experienceTierLabels.signature}>
                      {signature.map((product) => (
                        <option key={product.slug} value={product.slug}>
                          {product.name} — {productPriceLabel(product.amountThb)}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {wellness.length > 0 ? (
                    <optgroup label={experienceTierLabels.wellness}>
                      {wellness.map((product) => (
                        <option key={product.slug} value={product.slug}>
                          {product.name} — {productPriceLabel(product.amountThb)}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </>
              );
            })()}
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
        <legend className="font-display text-xl tracking-tight text-foreground xs:text-2xl">2. When & where</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Date</span>
            <input
              type="date"
              required
              min={todayInBangkok()}
              value={scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                setScheduledTime(null);
              }}
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Coverage area</span>
            <select
              required
              value={coverageAreaSlug}
              onChange={(e) => {
                setCoverageAreaSlug(e.target.value);
                setScheduledTime(null);
              }}
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
        </div>

        <div className="grid gap-3 xs:grid-cols-3">
          {(["hotel", "condo", "home"] as LocationType[]).map((type) => (
            <label
              key={type}
              className={`flex min-h-12 cursor-pointer items-center justify-center border px-3 py-3.5 text-sm capitalize transition ${
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
            onChange={(e) => {
              setLocationLabel(e.target.value);
              setScheduledTime(null);
            }}
            placeholder={locationType === "hotel" ? "e.g. Anantara Chiang Mai" : "e.g. Near Nimman Soi 9"}
            className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
          />
          {geocoding ? (
            <span className="mt-1 block text-xs text-muted">Looking up your location…</span>
          ) : coords ? (
            <span className="mt-1 block text-xs text-accent">Location found — showing available times</span>
          ) : null}
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
        <legend className="font-display text-xl tracking-tight text-foreground xs:text-2xl">3. Therapist & time</legend>
        <p className="text-sm text-muted">
          Choosing a therapist is optional. Pick a time and we can assign someone, or open a profile and book that person
          without starting over.
        </p>
        {scheduledTime ? (
          <p className="text-sm text-accent">
            Selected:{" "}
            <strong>
              {therapistPreference === "specific" && therapistRef
                ? `${bookableTherapists.find((t) => t.id === therapistRef)?.displayName ?? "Therapist"} · `
                : "Anyone available · "}
              {formatSlot12h(scheduledTime)}
            </strong>
          </p>
        ) : null}
        <BookingTherapistPicker
          therapists={bookableTherapists}
          loading={availabilityLoading}
          preference={therapistPreference}
          selectedTherapistId={therapistPreference === "specific" ? therapistRef : null}
          selectedTime={scheduledTime}
          onPreferenceChange={(pref) => {
            setTherapistPreference(pref);
            setScheduledTime(null);
            setTherapistRef(null);
          }}
          onSelectTherapistSlot={(therapistId, time) => {
            setTherapistPreference("specific");
            setTherapistRef(therapistId);
            setScheduledTime(time);
          }}
          onSelectBestAvailableTime={(time) => {
            setTherapistPreference("best_available");
            setTherapistRef(null);
            setScheduledTime(time);
          }}
          browseHref={`/therapists?service=${serviceSlug}`}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl tracking-tight text-foreground xs:text-2xl">4. Your details</legend>
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
        <legend className="font-display text-xl tracking-tight text-foreground xs:text-2xl">5. Payment (optional)</legend>
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

      <div className="hidden border-t border-border pt-6 md:flex md:flex-row md:items-center md:justify-between md:gap-3">
        <p className="text-sm text-muted">
          {selectedService && totalLabel
            ? `Total: ${totalLabel} · ${DURATION_TIER_LABELS[durationMinutes]}${
                payNow ? " — you'll pay by card next" : " — no payment required now"
              }`
            : null}
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>

      <div className="booking-mobile-bar md:hidden">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {totalLabel ? (
                <p className="font-display text-lg tracking-tight text-foreground">{totalLabel}</p>
              ) : (
                <p className="text-sm text-muted">Complete the form</p>
              )}
              <p className="truncate text-xs text-muted">
                {slotSummary ??
                  (selectedService
                    ? `${selectedService.name} · ${DURATION_TIER_LABELS[durationMinutes]}`
                    : "Choose service & time")}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "…" : payNow ? "Pay & book" : "Book"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
