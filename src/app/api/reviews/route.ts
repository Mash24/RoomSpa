import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { isEmail, normalizeEmail } from "@/lib/payments/lookup";
import { getCatalogProduct } from "@/content/services";
import {
  REVIEW_MAX_BODY,
  REVIEW_MAX_NAME,
  REVIEW_MAX_TITLE,
  REVIEW_MIN_BODY,
  REVIEW_MIN_NAME,
  findReviewPolicyViolation,
  isValidReviewRating,
} from "@/lib/reviews/rules";
import { hashIp, mapPublicReview } from "@/lib/reviews/map";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function allowSubmit(key: string, limit = 3, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const current = rateLimit.get(key);
  if (!current || current.resetAt < now) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export async function GET() {
  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, author_name, rating, title, body, service_slug, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      reviews: (data ?? []).map((row) => mapPublicReview(row as Record<string, unknown>)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load reviews.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const authorName = String(body.authorName ?? "").trim();
    const authorEmailRaw = String(body.authorEmail ?? "").trim();
    const title = String(body.title ?? "").trim();
    const reviewBody = String(body.body ?? "").trim();
    const serviceSlug = String(body.serviceSlug ?? "").trim() || null;
    const bookingReference = String(body.bookingReference ?? "").trim().toUpperCase() || null;
    const rating = Number(body.rating);
    const acceptedGuidelines = Boolean(body.acceptedGuidelines);

    if (!acceptedGuidelines) {
      return NextResponse.json(
        { error: "Please confirm you have read the review guidelines." },
        { status: 400 },
      );
    }

    if (authorName.length < REVIEW_MIN_NAME || authorName.length > REVIEW_MAX_NAME) {
      return NextResponse.json(
        { error: `Name must be ${REVIEW_MIN_NAME}–${REVIEW_MAX_NAME} characters.` },
        { status: 400 },
      );
    }

    if (!isValidReviewRating(rating)) {
      return NextResponse.json({ error: "Please choose a rating from 1 to 5 stars." }, { status: 400 });
    }

    if (title.length > REVIEW_MAX_TITLE) {
      return NextResponse.json(
        { error: `Title must be ${REVIEW_MAX_TITLE} characters or fewer.` },
        { status: 400 },
      );
    }

    if (reviewBody.length < REVIEW_MIN_BODY || reviewBody.length > REVIEW_MAX_BODY) {
      return NextResponse.json(
        { error: `Review must be ${REVIEW_MIN_BODY}–${REVIEW_MAX_BODY} characters.` },
        { status: 400 },
      );
    }

    if (authorEmailRaw && !isEmail(authorEmailRaw)) {
      return NextResponse.json({ error: "Please enter a valid email, or leave it blank." }, { status: 400 });
    }

    if (serviceSlug && !getCatalogProduct(serviceSlug)) {
      return NextResponse.json({ error: "Unknown service selected." }, { status: 400 });
    }

    if (bookingReference && !/^RS-[A-Z0-9]{6,12}$/i.test(bookingReference)) {
      return NextResponse.json(
        { error: "Booking reference should look like RS-XXXXXXXX (or leave blank)." },
        { status: 400 },
      );
    }

    const combinedText = `${title}\n${reviewBody}\n${authorName}`;
    const violation = findReviewPolicyViolation(combinedText);
    if (violation) {
      return NextResponse.json({ error: violation }, { status: 400 });
    }

    const ip = clientIp(request);
    const rateKey = `${ip}:${normalizeEmail(authorEmailRaw || authorName)}`;
    if (!allowSubmit(rateKey)) {
      return NextResponse.json(
        { error: "Too many review submissions. Please try again later." },
        { status: 429 },
      );
    }

    const supabase = createAdminishAnonClient();
    const { error } = await supabase.from("reviews").insert({
      author_name: authorName,
      author_email: authorEmailRaw ? normalizeEmail(authorEmailRaw) : null,
      rating,
      title,
      body: reviewBody,
      service_slug: serviceSlug,
      booking_reference: bookingReference,
      status: "pending",
      ip_hash: hashIp(ip),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message:
        "Thanks — your review was submitted.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
