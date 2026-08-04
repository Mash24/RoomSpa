import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import type { BookingPayload } from "@/lib/booking/types";
import { site } from "@/content/site";
import { getCatalogProduct } from "@/content/pricing";
import { createBookingCheckoutSession } from "@/lib/stripe/checkout";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function resolveSiteUrl(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  return "http://localhost:3000";
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

    const supabase = createAdminishAnonClient();

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, name, price_thb, stripe_price_id, is_active")
      .eq("slug", body.serviceSlug)
      .eq("is_active", true)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        {
          error:
            "Service not found. Make sure the Supabase schema and seed SQL have been run.",
        },
        { status: 400 },
      );
    }

    const catalog = getCatalogProduct(body.serviceSlug);
    const stripePriceId = service.stripe_price_id || catalog?.stripePriceId;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "This service is missing a Stripe price. Add the Price ID in Supabase/services." },
        { status: 400 },
      );
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

    const bookingId = randomUUID();
    const referenceCode = buildReferenceCode();
    const scheduledTime = body.scheduledTime.slice(0, 5);
    const customerName = body.customerName.trim();
    const customerEmail = body.customerEmail.trim().toLowerCase();
    const locationLabel = body.locationLabel.trim();

    const { error: bookingError } = await supabase.from("bookings").insert({
      id: bookingId,
      reference_code: referenceCode,
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
      amount_thb: service.price_thb,
      notes: body.notes?.trim() ?? "",
      status: "pending",
      payment_status: "unpaid",
      source: "website",
    });

    if (bookingError) {
      // If payment_status column isn't migrated yet, retry without it.
      if (bookingError.message?.includes("payment_status")) {
        const { error: retryError } = await supabase.from("bookings").insert({
          id: bookingId,
          reference_code: referenceCode,
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
          amount_thb: service.price_thb,
          notes: body.notes?.trim() ?? "",
          status: "pending",
          source: "website",
        });

        if (retryError) {
          const message = retryError.message?.includes("already booked")
            ? "That time slot was just taken. Please choose another time."
            : retryError.message || "Could not create booking.";
          return NextResponse.json({ error: message }, { status: 400 });
        }
      } else {
        const message = bookingError.message?.includes("already booked")
          ? "That time slot was just taken. Please choose another time."
          : bookingError.message || "Could not create booking.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const session = await createBookingCheckoutSession({
      priceId: stripePriceId,
      customerEmail,
      customerName,
      bookingId,
      referenceCode,
      serviceName: service.name,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      locationLabel,
      amountThb: service.price_thb,
      siteUrl: resolveSiteUrl(request),
    });

    const whatsappHref = buildWhatsAppHref({
      referenceCode,
      serviceName: service.name,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      customerName,
      locationLabel,
    });

    return NextResponse.json({
      id: bookingId,
      referenceCode,
      amountThb: service.price_thb,
      serviceName: service.name,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      whatsappHref,
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
