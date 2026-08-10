import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { isEmail, normalizeEmail } from "@/lib/payments/lookup";
import { sendNewTicketOpsEmail } from "@/lib/email/ticket";
import { site } from "@/content/site";
import { createHash } from "crypto";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function allow(key: string, limit = 5, windowMs = 60 * 60 * 1000) {
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

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function referenceCode() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `T${n}`;
}

type TranscriptLine = { role: string; content: string };

function normalizeTranscript(raw: unknown): TranscriptLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-20)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const role = String((item as { role?: string }).role ?? "");
      const content = String((item as { content?: string }).content ?? "").trim();
      if (!content || content.length > 2000) return null;
      if (role !== "user" && role !== "assistant") return null;
      return { role, content };
    })
    .filter((line): line is TranscriptLine => Boolean(line));
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!allow(`ticket:${ip}`)) {
      return NextResponse.json(
        { error: "Too many tickets from this connection. Please WhatsApp us instead." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const guestName = String(body.guestName ?? "").trim();
    const guestPhone = String(body.guestPhone ?? "").trim();
    const guestEmailRaw = String(body.guestEmail ?? "").trim();
    const subject = String(body.subject ?? "").trim().slice(0, 160);
    const message = String(body.message ?? "").trim();
    const pagePath = String(body.pagePath ?? "").trim().slice(0, 200) || null;
    const transcript = normalizeTranscript(body.transcript);

    if (guestName.length < 2 || guestName.length > 80) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (message.length < 10 || message.length > 4000) {
      return NextResponse.json(
        { error: "Please add a short message (at least 10 characters)." },
        { status: 400 },
      );
    }
    if (!guestPhone && !guestEmailRaw) {
      return NextResponse.json(
        { error: "Add a WhatsApp/phone number or email so we can reach you." },
        { status: 400 },
      );
    }
    if (guestEmailRaw && !isEmail(guestEmailRaw)) {
      return NextResponse.json({ error: "That email does not look valid." }, { status: 400 });
    }

    const guestEmail = guestEmailRaw ? normalizeEmail(guestEmailRaw) : null;
    const code = referenceCode();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url;

    let ticketId: string | null = null;
    let stored = false;

    try {
      const supabase = createAdminishAnonClient();
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          reference_code: code,
          status: "open",
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || null,
          subject: subject || "Talk to Live Agent",
          message,
          page_path: pagePath,
          transcript,
          ip_hash: hashIp(ip),
        })
        .select("id, reference_code")
        .single();

      if (error) {
        console.error("[ticket] insert failed (will still email ops):", error);
      } else {
        ticketId = data.id;
        stored = true;
      }
    } catch (dbError) {
      console.error("[ticket] database unavailable (will still email ops):", dbError);
    }

    const emailResult = await sendNewTicketOpsEmail({
      referenceCode: code,
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      subject: subject || "Talk to Live Agent",
      message,
      pagePath,
      transcript,
      siteUrl,
    });

    // Guest handoff succeeds if we emailed ops OR saved the row.
    if (!stored && !emailResult.sent) {
      return NextResponse.json(
        {
          error:
            "Could not reach customer care just now. Please WhatsApp us — we’ll help right away.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      referenceCode: code,
      id: ticketId,
      stored,
      emailed: emailResult.sent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open ticket.";
    console.error("[ticket]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
