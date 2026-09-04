import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import type { BookingPayload } from "@/lib/booking/types";
import { site } from "@/content/site";
import { getCatalogProduct, getServiceAmountForDuration } from "@/content/services";
import { DURATION_TIERS, type DurationMinutes } from "@/lib/catalog/prices";
import { normalizeSlotTime } from "@/lib/booking/availability";
import { createBookingCheckoutSession } from "@/lib/stripe/checkout";
import { generateBookingPin, mapPaymentPreferenceToMethod } from "@/lib/booking/pin";
import { sendBookingConfirmationEmail } from "@/lib/email/booking";
import { isEmail, normalizeEmail, resolveSiteUrl } from "@/lib/payments/lookup";
import { isTherapistBookableAt } from "@/lib/therapists/bookability";
import { assignBestAvailableTherapist } from "@/lib/therapists/assignment";

function isValidSlotTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function normalizeTherapistPreference(
  pref: BookingPayload["therapistPreference"],
  hasTherapist: boolean,
): "specific" | "best_available" {
  if (pref === "specific" || (hasTherapist && pref !== "best_available")) return "specific";
  return "best_available";
}
function buildReferenceCode() {
  return `RS-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function buildWhatsAppHref(input: {
  referenceCode: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  customerName: string;
  locationLabel: string;
  paid?: boolean;
}) {
  const number = site.contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    [
      input.paid
        ? `Hi RoomSpa! I just paid for my booking.`
        : `Hi RoomSpa! I just submitted a booking request.`,
      `Ref: ${input.referenceCode}`,
      `Name: ${input.customerName}`,
      `Service: ${input.serviceName}`,
      `When: ${input.scheduledDate} at ${input.scheduledTime}`,
      `Where: ${input.locationLabel}`,
      input.paid ? `Payment: completed via Stripe.` : `Please confirm availability. Thank you!`,
    ].join("\n"),
  );
  return `https://wa.me/${number}?text=${message}`;
}

async function insertBooking(
  supabase: ReturnType<typeof createAdminishAnonClient>,
  row: Record<string, unknown>,
) {
  const { error } = await supabase.from("bookings").insert(row);
  if (!error) return null;

  if (
    error.message?.includes("payment_status") ||
    error.message?.includes("payment_method") ||
    error.message?.includes("access_pin") ||
    error.message?.includes("duration_minutes")
  ) {
    const { payment_status, payment_method, access_pin, duration_minutes, ...fallback } = row;
    void payment_status;
    void payment_method;
    void access_pin;
    void duration_minutes;
    const { error: retryError } = await supabase.from("bookings").insert(fallback);
    return retryError;
  }

  return error;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingPayload;

    const required = [
      body.serviceSlug,
      body.customerName,
      body.customerEmail,
      body.customerPhone,
      body.locationType,
      body.locationLabel,
      body.scheduledDate,
      body.scheduledTime,
    ];

    if (required.some((value) => !value || String(value).trim() === "")) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    if (!isEmail(body.customerEmail)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    if (!["hotel", "condo", "home"].includes(body.locationType)) {
      return NextResponse.json({ error: "Invalid location type." }, { status: 400 });
    }

    const preference = body.paymentPreference ?? "cash";
    const payNow = Boolean(body.payNow) || preference === "card_now";
    const paymentMethod = mapPaymentPreferenceToMethod(preference);

    const supabase = createAdminishAnonClient();

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, name, price_thb, is_active")
      .eq("slug", body.serviceSlug)
      .eq("is_active", true)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Service not found. Make sure the Supabase schema and seed SQL have been run." },
        { status: 400 },
      );
    }

    const catalog = getCatalogProduct(body.serviceSlug);
    const requestedDuration = Number(body.durationMinutes) as DurationMinutes;
    const durationMinutes = (DURATION_TIERS as readonly number[]).includes(requestedDuration)
      ? requestedDuration
      : (60 as DurationMinutes);

    let amountThb = catalog ? getServiceAmountForDuration(catalog, durationMinutes) : 0;

    const { data: tierPrice } = await supabase
      .from("service_prices")
      .select("price_thb")
      .eq("service_id", service.id)
      .eq("duration_minutes", durationMinutes)
      .eq("is_active", true)
      .maybeSingle();

    if (tierPrice?.price_thb != null) {
      amountThb = Number(tierPrice.price_thb);
    } else if (!(amountThb > 0)) {
      amountThb = Number(catalog?.amountThb ?? service.price_thb);
    }

    const serviceName = catalog?.name ?? service.name;

    if (!(amountThb > 0)) {
      return NextResponse.json({ error: "This service has no valid price." }, { status: 400 });
    }

    let coverageAreaId: string | null = null;
    if (body.coverageAreaSlug) {
      const { data: area } = await supabase
        .from("coverage_areas")
        .select("id")
        .eq("slug", body.coverageAreaSlug)
        .eq("is_active", true)
        .maybeSingle();
      coverageAreaId = area?.id ?? null;
    }

    const scheduledTime = normalizeSlotTime(body.scheduledTime);
    if (!isValidSlotTime(scheduledTime)) {
      return NextResponse.json({ error: "Please choose a valid time slot." }, { status: 400 });
    }

    const availabilityQuery = {
      serviceSlug: body.serviceSlug,
      date: body.scheduledDate,
      durationMinutes,
      coverageAreaSlug: body.coverageAreaSlug,
      lat: body.lat,
      lng: body.lng,
      inferCoverageFromLocation: body.lat != null && body.lng != null,
    };

    const therapistPreference = normalizeTherapistPreference(
      body.therapistPreference,
      Boolean(body.therapistSlug),
    );
    let therapistId: string | null = null;
    let therapistDisplayName: string | null = null;

    if (therapistPreference === "specific" && body.therapistSlug) {
      const key = body.therapistSlug.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
      const therapistQuery = supabase
        .from("therapists")
        .select("id, display_name")
        .eq("status", "active")
        .eq("is_active", true)
        .eq("is_bookable", true);
      const { data: therapist } = await (isUuid
        ? therapistQuery.eq("id", key)
        : therapistQuery.eq("slug", key)
      ).maybeSingle();

      if (!therapist) {
        return NextResponse.json({ error: "Selected therapist is not available." }, { status: 400 });
      }

      const bookable = await isTherapistBookableAt(therapist.id, {
        ...availabilityQuery,
        scheduledTime,
      });
      if (!bookable) {
        return NextResponse.json(
          {
            error:
              "That time was just taken. Please choose another available time.",
          },
          { status: 409 },
        );
      }

      therapistId = therapist.id;
      therapistDisplayName = therapist.display_name as string;
    } else {
      // Prefer an available match, but never block the booking if supply is thin —
      // ops can confirm a therapist after the request lands.
      const assigned = await assignBestAvailableTherapist({
        ...availabilityQuery,
        scheduledTime,
      });
      if (assigned) {
        therapistId = assigned.therapistId;
        therapistDisplayName = assigned.displayName;
      }
    }

    const bookingId = randomUUID();
    const referenceCode = buildReferenceCode();
    const accessPin = generateBookingPin();
    const customerName = body.customerName.trim();
    const customerEmail = normalizeEmail(body.customerEmail);
    const locationLabel = body.locationLabel.trim();

    const bookingError = await insertBooking(supabase, {
      id: bookingId,
      reference_code: referenceCode,
      access_pin: accessPin,
      service_id: service.id,
      coverage_area_id: coverageAreaId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: body.customerPhone.trim(),
      location_type: body.locationType,
      location_label: locationLabel,
      location_details: body.locationDetails?.trim() ?? "",
      scheduled_date: body.scheduledDate,
      scheduled_time: scheduledTime,
      duration_minutes: durationMinutes,
      amount_thb: amountThb,
      notes: body.notes?.trim() ?? "",
      therapist_id: therapistId,
      therapist_preference: therapistPreference,
      status: "pending",
      payment_status: "unpaid",
      payment_method: paymentMethod,
      source: "website",
    });

    if (bookingError) {
      return NextResponse.json(
        { error: bookingError.message || "Could not create booking." },
        { status: 400 },
      );
    }

    const whatsappHref = buildWhatsAppHref({
      referenceCode,
      serviceName,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      customerName,
      locationLabel,
    });

    const siteUrl = resolveSiteUrl(request);

    const emailResult = await sendBookingConfirmationEmail({
      customerName,
      customerEmail,
      customerPhone: body.customerPhone.trim(),
      referenceCode,
      accessPin,
      serviceName,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      locationType: body.locationType,
      locationLabel,
      locationDetails: body.locationDetails?.trim() ?? "",
      notes: body.notes?.trim() ?? "",
      amountThb,
      paymentMethod,
      siteUrl,
      durationMinutes,
      paymentStatus: "unpaid",
      bookingStatus: "pending",
      therapistDisplayName,
      therapistAssignment: therapistPreference,
    });

    const response: Record<string, unknown> = {
      id: bookingId,
      referenceCode,
      accessPin,
      amountThb,
      serviceName,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      customerEmail,
      paymentMethod,
      whatsappHref,
      emailSent: emailResult.sent,
      therapistDisplayName,
      therapistAssignment: therapistPreference,
    };

    if (payNow) {
      const session = await createBookingCheckoutSession({
        customerEmail,
        customerName,
        bookingId,
        referenceCode,
        accessPin,
        serviceName,
        scheduledDate: body.scheduledDate,
        scheduledTime,
        locationLabel,
        amountThb,
        siteUrl,
      });

      response.checkoutUrl = session.url;
      response.checkoutSessionId = session.id;
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
