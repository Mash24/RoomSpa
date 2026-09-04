"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";
import { ServicePriceTiers } from "@/components/services/service-price-tiers";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { PaymentBadges } from "@/components/payment/payment-badges";
import { paymentMethodLabel } from "@/lib/booking/pin";
import {
  type BookingResult,
  type LocationType,
  type PaymentPreference,
  type TherapistPreference,
} from "@/lib/booking/types";
import { formatSlot12h } from "@/components/booking/booking-therapist-picker";
import { redirectToUrl } from "@/lib/navigation";
import { readApiJson } from "@/lib/admin/api";

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

function shortTagline(summary: string) {
  const first = summary.split(/[.!?]/)[0]?.trim() || summary.trim();
  return first.length > 88 ? `${first.slice(0, 85).trim()}…` : first;
}

function normalizeManualTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!match) return trimmed.slice(0, 5);
  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23 || Number(minute) > 59) return "";
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

type StepId = 1 | 2 | 3 | 4 | 5;

type Props = {
  products?: CatalogService[];
};

export function BookingForm({ products: initialProducts }: Props) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CatalogService[]>(
    initialProducts?.length ? initialProducts : catalogProducts,
  );
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [serviceSlug, setServiceSlug] = useState<string>(() =>
    pickServiceSlug(
      initialProducts?.length ? initialProducts : catalogProducts,
      searchParams.get("service"),
    ),
  );
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(() =>
    initialDuration(searchParams.get("duration")),
  );
  const [city, setCity] = useState(() => searchParams.get("city") ?? "");
  const [locationType, setLocationType] = useState<LocationType>("hotel");
  const [locationLabel, setLocationLabel] = useState(searchParams.get("place") ?? "");
  const [locationDetails, setLocationDetails] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(searchParams.get("email") ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [therapistRef, setTherapistRef] = useState<string | null>(searchParams.get("therapist"));
  const [therapistPreference, setTherapistPreference] = useState<TherapistPreference>(
    searchParams.get("therapist") ? "specific" : "best_available",
  );
  const [showTherapistBrowse, setShowTherapistBrowse] = useState(
    Boolean(searchParams.get("therapist")),
  );
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("cash");
  const [showCardOptions, setShowCardOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/catalog");
        const data = await readApiJson<{ services?: CatalogService[]; error?: string }>(res);
        if (!res.ok || cancelled) return;
        const next = data.services || [];
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

  const signatureServices = useMemo(
    () => products.filter(isSignatureExperience),
    [products],
  );
  const wellnessServices = useMemo(
    () => products.filter((product) => !isSignatureExperience(product)),
    [products],
  );

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

  const normalizedTime = normalizeManualTime(scheduledTime);

  const slotSummary = useMemo(() => {
    if (!normalizedTime) return null;
    const timeLabel = formatSlot12h(normalizedTime);
    if (therapistPreference === "specific" && therapistRef) {
      return `Preferred therapist · ${timeLabel}`;
    }
    return `We'll match you · ${timeLabel}`;
  }, [normalizedTime, therapistPreference, therapistRef]);

  const submitLabel = submitting
    ? payNow
      ? "Redirecting…"
      : "Sending…"
    : payNow
      ? `Book & pay — ${totalLabel ?? ""}`
      : `Request booking${totalLabel ? ` — ${totalLabel}` : ""}`;

  function goToStep(step: StepId) {
    setActiveStep(step);
    setError(null);
  }

  function advanceFromService() {
    if (!serviceSlug) {
      setError("Choose an experience to continue.");
      return;
    }
    goToStep(2);
  }

  function advanceFromWhenWhere() {
    if (!city.trim()) {
      setError("Enter the city where you are staying.");
      return;
    }
    if (!scheduledDate) {
      setError("Choose a date.");
      return;
    }
    if (!normalizeManualTime(scheduledTime)) {
      setError("Enter a preferred time, e.g. 19:00.");
      return;
    }
    if (!locationLabel.trim()) {
      setError(
        locationType === "hotel"
          ? "Enter the hotel name."
          : locationType === "condo"
            ? "Enter the condo name."
            : "Enter your address or area.",
      );
      return;
    }
    goToStep(3);
  }

  function advanceFromTherapist() {
    goToStep(4);
  }

  function advanceFromDetails() {
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError("Name, email, and WhatsApp are required.");
      return;
    }
    goToStep(5);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const time = normalizeManualTime(scheduledTime);
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      setError("Enter a valid preferred time, e.g. 19:00.");
      goToStep(2);
      return;
    }
    if (therapistPreference === "specific" && !therapistRef) {
      setError("Choose a therapist, or switch back to matching.");
      goToStep(3);
      return;
    }

    setSubmitting(true);
    setError(null);

    const detailsParts = [
      city.trim() ? `City: ${city.trim()}` : null,
      locationDetails.trim() || null,
    ].filter(Boolean);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          locationType,
          locationLabel,
          locationDetails: detailsParts.join(" · "),
          scheduledDate,
          scheduledTime: time,
          durationMinutes,
          customerName,
          customerEmail,
          customerPhone,
          notes,
          therapistSlug: therapistPreference === "specific" ? therapistRef : null,
          therapistPreference,
          paymentPreference: effectivePaymentPreference,
          payNow,
        }),
      });

      const data = await readApiJson<BookingResult & { error?: string; checkoutUrl?: string }>(response);
      if (!response.ok) {
        throw new Error(data.error || "Booking failed.");
      }

      if (data.checkoutUrl) {
        redirectToUrl(data.checkoutUrl);
        return;
      }

      setResult(data as BookingResult);
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
        <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">You’re booked</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          Reference <span className="font-medium text-foreground">{result.referenceCode}</span> for{" "}
          {result.serviceName} on {result.scheduledDate} at {formatSlot12h(result.scheduledTime)}.
          {result.therapistDisplayName ? (
            <>
              {" "}
              Therapist:{" "}
              <span className="font-medium text-foreground">
                {result.therapistDisplayName}
                {result.therapistAssignment === "best_available" ? " (matched for you)" : ""}
              </span>
              .
            </>
          ) : (
            <> We’ll confirm your therapist shortly.</>
          )}{" "}
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
          <WhatsAppLink
            cta="booking-confirm"
            hrefOverride={result.whatsappHref}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5b]"
          >
            Confirm on WhatsApp
          </WhatsAppLink>
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
    <form onSubmit={onSubmit} className="booking-form-with-bar space-y-4">
      <StepCard
        step={1}
        title="Choose your experience"
        active={activeStep === 1}
        summary={
          selectedService
            ? `${selectedService.name} · ${DURATION_TIER_LABELS[durationMinutes]} · ${totalLabel}`
            : null
        }
        onEdit={() => goToStep(1)}
      >
        <div className="space-y-6">
          {signatureServices.length > 0 ? (
            <ServiceGroup
              label="Signature"
              hint="Premium private massage experiences"
              services={signatureServices}
              selectedSlug={serviceSlug}
              onSelect={(slug) => {
                setServiceSlug(slug);
                setError(null);
              }}
            />
          ) : null}
          {wellnessServices.length > 0 ? (
            <ServiceGroup
              label="Wellness"
              hint="Relaxation-focused massage"
              services={wellnessServices}
              selectedSlug={serviceSlug}
              onSelect={(slug) => {
                setServiceSlug(slug);
                setError(null);
              }}
            />
          ) : null}

          {selectedService ? (
            <div className="space-y-3 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Choose duration</p>
              <ServicePriceTiers
                service={selectedService}
                selectedMinutes={durationMinutes}
                onSelect={setDurationMinutes}
              />
            </div>
          ) : null}

          <StepContinue onClick={advanceFromService} label="Continue" />
        </div>
      </StepCard>

      <StepCard
        step={2}
        title="When & where"
        active={activeStep === 2}
        locked={activeStep < 2}
        summary={
          activeStep > 2
            ? `${scheduledDate} · ${normalizedTime || scheduledTime} · ${city.trim() || "City"} · ${locationLabel.trim() || locationType}`
            : null
        }
        onEdit={() => goToStep(2)}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted">City</span>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Chiang Mai"
                className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none placeholder:text-muted/70 focus:border-accent"
              />
              <span className="mt-1 block text-xs text-muted">Where you are staying</span>
            </label>
            <label className="block text-sm">
              <span className="text-muted">Date</span>
              <div className="relative mt-1">
                {!scheduledDate ? (
                  <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-sm text-muted/70">
                    DD-MM-YYYY
                  </span>
                ) : null}
                <input
                  type="date"
                  required
                  min={todayInBangkok()}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={`w-full border border-border bg-surface-elevated px-3 py-2.5 outline-none focus:border-accent ${
                    scheduledDate ? "text-foreground" : "text-transparent"
                  }`}
                />
              </div>
              <span className="mt-1 block text-xs text-muted">Pick a date — Thailand time</span>
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-muted">Preferred time</span>
            <input
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="e.g. 19:00 or 7:00 PM"
              inputMode="numeric"
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none placeholder:text-muted/70 focus:border-accent"
            />
            <span className="mt-1 block text-xs text-muted">
              Type your preferred start time — we’ll confirm availability
            </span>
          </label>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(["hotel", "condo", "home"] as LocationType[]).map((type) => (
              <label
                key={type}
                className={`flex min-h-12 cursor-pointer items-center justify-center border px-1.5 py-3 text-center text-xs capitalize transition xs:px-3 xs:text-sm ${
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
              placeholder={
                locationType === "hotel"
                  ? "e.g. Anantara Chiang Mai"
                  : locationType === "condo"
                    ? "e.g. The Base Height Nimman"
                    : "e.g. Near Nimman Soi 9"
              }
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none placeholder:text-muted/70 focus:border-accent"
            />
            <span className="mt-1 block text-xs text-muted">So we know exactly where to arrive</span>
          </label>

          <label className="block text-sm">
            <span className="text-muted">Room / floor / extra details (optional)</span>
            <input
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="e.g. Room 1204, call on arrival"
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none placeholder:text-muted/70 focus:border-accent"
            />
          </label>

          <StepContinue onClick={advanceFromWhenWhere} label="Continue" />
        </div>
      </StepCard>

      <StepCard
        step={3}
        title="Therapist"
        active={activeStep === 3}
        locked={activeStep < 3}
        summary={
          activeStep > 3
            ? therapistPreference === "specific" && therapistRef
              ? "Preferred therapist selected"
              : "We’ll match you with an available therapist"
            : null
        }
        onEdit={() => goToStep(3)}
      >
        <div className="space-y-4">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition ${
              therapistPreference === "best_available"
                ? "border-accent bg-accent-soft/30"
                : "border-border bg-surface-elevated"
            }`}
          >
            <input
              type="radio"
              name="therapistPreference"
              checked={therapistPreference === "best_available"}
              onChange={() => {
                setTherapistPreference("best_available");
                setTherapistRef(null);
                setShowTherapistBrowse(false);
              }}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-foreground">We’ll match you with an available therapist</span>
              <span className="mt-1 block text-sm text-muted">
                Recommended — no need to pick someone yourself.
              </span>
            </span>
          </label>

          {!showTherapistBrowse ? (
            <button
              type="button"
              onClick={() => {
                setShowTherapistBrowse(true);
                setTherapistPreference("specific");
              }}
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              Prefer a specific therapist? Browse our therapist gallery
            </button>
          ) : (
            <div className="space-y-3 rounded-sm border border-border bg-surface-elevated p-4">
              <p className="text-sm text-muted">
                Open a profile, tap Request this therapist, and you’ll return here with them preferred — or leave
                matching on and we’ll choose for you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/therapists?service=${serviceSlug}`}
                  target="_blank"
                  className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-4 text-sm font-medium hover:border-accent"
                >
                  Browse therapist gallery
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowTherapistBrowse(false);
                    setTherapistPreference("best_available");
                    setTherapistRef(null);
                  }}
                  className="text-sm text-muted underline-offset-2 hover:underline"
                >
                  Use matching instead
                </button>
              </div>
              {therapistRef ? (
                <p className="text-sm text-accent">Preferred therapist kept from your selection.</p>
              ) : null}
            </div>
          )}

          <StepContinue onClick={advanceFromTherapist} label="Continue" />
        </div>
      </StepCard>

      <StepCard
        step={4}
        title="Your details"
        active={activeStep === 4}
        locked={activeStep < 4}
        summary={
          activeStep > 4 && customerName
            ? `${customerName} · ${customerPhone || customerEmail}`
            : null
        }
        onEdit={() => goToStep(4)}
      >
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="text-muted">Full name</span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">WhatsApp</span>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+66 9x xxx xxxx"
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
            <span className="mt-1 block text-xs text-muted">Best number for booking updates</span>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Email</span>
            <input
              required
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="you@email.com"
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
            <span className="mt-1 block text-xs text-muted">For your PIN and booking confirmation</span>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Notes (optional)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pressure preference, allergies, parking notes…"
              className="mt-1 w-full border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-accent"
            />
          </label>
          <StepContinue onClick={advanceFromDetails} label="Continue" />
        </div>
      </StepCard>

      <StepCard
        step={5}
        title="Confirm"
        active={activeStep === 5}
        locked={activeStep < 5}
        onEdit={() => goToStep(5)}
      >
        <div className="space-y-5">
          <div className="rounded-sm border border-accent/30 bg-accent-soft/20 p-4">
            <p className="font-medium text-foreground">Book now — pay on arrival</p>
            <p className="mt-1 text-sm text-muted">No payment required to request your booking.</p>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentPreference"
                checked={effectivePaymentPreference === "cash"}
                onChange={() => {
                  setPaymentPreference("cash");
                  setShowCardOptions(false);
                }}
              />
              Cash on arrival
            </label>
          </div>

          {!showCardOptions ? (
            <button
              type="button"
              onClick={() => setShowCardOptions(true)}
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              Prefer to pay by card? Pay now or later
            </button>
          ) : (
            <div className="grid gap-3">
              <label
                className={`border p-4 ${
                  effectivePaymentPreference === "card_later"
                    ? "border-accent bg-accent-soft/40"
                    : "border-border bg-surface-elevated"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentPreference"
                    checked={effectivePaymentPreference === "card_later"}
                    onChange={() => setPaymentPreference("card_later")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-foreground">Pay by card later</p>
                    <p className="mt-1 text-sm text-muted">
                      Use My booking with email + PIN whenever you’re ready.
                    </p>
                  </div>
                </div>
              </label>
              <label
                className={`border p-4 ${
                  !canPayNow
                    ? "cursor-not-allowed opacity-60"
                    : effectivePaymentPreference === "card_now"
                      ? "border-accent bg-accent-soft/40"
                      : "border-border bg-surface-elevated"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentPreference"
                    checked={effectivePaymentPreference === "card_now"}
                    disabled={!canPayNow}
                    onChange={() => setPaymentPreference("card_now")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-foreground">Pay by card now</p>
                    <p className="mt-1 text-sm text-muted">
                      {canPayNow
                        ? "Secure checkout with Visa, Mastercard, or Amex."
                        : "Online card checkout isn’t set up for this service yet."}
                    </p>
                  </div>
                </div>
              </label>
              <PaymentBadges compact />
            </div>
          )}

          {selectedService && totalLabel ? (
            <p className="text-sm text-muted">
              {selectedService.name} · {DURATION_TIER_LABELS[durationMinutes]} · {totalLabel}
              {normalizedTime ? ` · ${formatSlot12h(normalizedTime)}` : ""}
              {city.trim() ? ` · ${city.trim()}` : ""}
            </p>
          ) : null}
        </div>
      </StepCard>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
          <p className="mt-2">
            Prefer WhatsApp?{" "}
            <WhatsAppLink cta="booking-error" className="underline">
              Message us directly
            </WhatsAppLink>
            .
          </p>
        </div>
      ) : null}

      {activeStep === 5 ? (
        <div className="hidden border-t border-border pt-6 md:block">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {submitLabel}
          </button>
          <p className="mt-2 text-xs text-muted">Pay on arrival · No payment required now</p>
        </div>
      ) : null}

      <div className="booking-mobile-bar md:hidden">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {totalLabel ? (
                <p className="font-display text-lg tracking-tight text-foreground">{totalLabel}</p>
              ) : (
                <p className="text-sm text-muted">Choose an experience</p>
              )}
              <p className="truncate text-xs text-muted">
                {slotSummary ??
                  (selectedService
                    ? `${selectedService.name} · ${DURATION_TIER_LABELS[durationMinutes]}`
                    : "Step by step booking")}
              </p>
            </div>
            {activeStep === 5 ? (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "…" : payNow ? "Pay & book" : "Book"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) advanceFromService();
                  else if (activeStep === 2) advanceFromWhenWhere();
                  else if (activeStep === 3) advanceFromTherapist();
                  else advanceFromDetails();
                }}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function StepCard({
  step,
  title,
  active,
  locked = false,
  summary,
  onEdit,
  children,
}: {
  step: number;
  title: string;
  active: boolean;
  locked?: boolean;
  summary?: string | null;
  onEdit: () => void;
  children?: ReactNode;
}) {
  return (
    <section
      className={`rounded-sm border transition ${
        active
          ? "border-accent/40 bg-surface-elevated p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
          : locked
            ? "border-border/70 bg-surface px-5 py-4 opacity-55"
            : "border-border bg-surface px-5 py-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            {String(step).padStart(2, "0")}
          </p>
          <h2 className="mt-1 font-display text-xl tracking-tight text-foreground xs:text-2xl">{title}</h2>
          {!active && summary ? <p className="mt-1 truncate text-sm text-muted">{summary}</p> : null}
        </div>
        {!active && !locked ? (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-sm text-accent underline-offset-2 hover:underline"
          >
            Edit
          </button>
        ) : null}
      </div>
      {active ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function StepContinue({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
    >
      {label}
    </button>
  );
}

function ServiceGroup({
  label,
  hint,
  services,
  selectedSlug,
  onSelect,
}: {
  label: string;
  hint: string;
  services: CatalogService[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">{label}</p>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {services.map((service) => {
          const selected = service.slug === selectedSlug;
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => onSelect(service.slug)}
              className={`rounded-sm border px-3.5 py-3 text-left transition ${
                selected
                  ? "border-accent bg-accent-soft/40"
                  : "border-border bg-background hover:border-accent/50"
              }`}
            >
              <span className="block font-medium text-foreground">{service.name}</span>
              <span className="mt-1 block text-xs leading-snug text-muted">
                {shortTagline(service.summary)}
              </span>
              <span className="mt-2 block text-sm text-accent">
                From {productPriceLabel(service.amountThb)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
