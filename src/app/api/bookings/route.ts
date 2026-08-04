import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import type { BookingPayload } from "@/lib/booking/types";
import { site } from "@/content/site";

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
}) {
  const number = site.contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    [
      `Hi RoomSpa! I just submitted a booking request.`,
      `Ref: ${input.referenceCode}`,
      `Name: ${input.customerName}`,
      `Service: ${input.serviceName}`,
      `When: ${input.scheduledDate} at ${input.scheduledTime}`,
      `Where: ${input.locationLabel}`,
      `Please confirm availability. Thank you!`,
    ].join("\n"),
  );
  return `https://wa.me/${number}?text=${message}`;
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
      .select("id, name, price_thb, is_active")
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

    // Insert without .select() — anon RLS allows INSERT but not SELECT on bookings.
    const { error: bookingError } = await supabase.from("bookings").insert({
      id: bookingId,
      reference_code: referenceCode,
      service_id: service.id,
      coverage_area_id: coverageAreaId,
      customer_name: body.customerName.trim(),
      customer_email: body.customerEmail.trim().toLowerCase(),
      customer_phone: body.customerPhone.trim(),
      location_type: body.locationType,
      location_label: body.locationLabel.trim(),
      location_details: body.locationDetails?.trim() ?? "",
      scheduled_date: body.scheduledDate,
      scheduled_time: scheduledTime,
      amount_thb: service.price_thb,
      notes: body.notes?.trim() ?? "",
      status: "pending",
      source: "website",
    });

    if (bookingError) {
      const message = bookingError.message?.includes("already booked")
        ? "That time slot was just taken. Please choose another time."
        : bookingError.message || "Could not create booking.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const whatsappHref = buildWhatsAppHref({
      referenceCode,
      serviceName: service.name,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      customerName: body.customerName.trim(),
      locationLabel: body.locationLabel.trim(),
    });

    return NextResponse.json({
      id: bookingId,
      referenceCode,
      amountThb: service.price_thb,
      serviceName: service.name,
      scheduledDate: body.scheduledDate,
      scheduledTime,
      whatsappHref,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
