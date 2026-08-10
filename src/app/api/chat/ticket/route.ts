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
        { error: "A few too many requests — please try WhatsApp for now." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
    }

    const guestName = String(body.guestName ?? "").trim();
    const guestPhone = String(body.guestPhone ?? "").trim();
    const guestEmailRaw = String(body.guestEmail ?? "").trim();
    const subject = String(body.subject ?? "").trim().slice(0, 160);
    const message = String(body.message ?? "").trim();
    const pagePath = String(body.pagePath ?? "").trim().slice(0, 200) || null;
    const transcript = normalizeTranscript(body.transcript);

    if (guestName.length < 2 || guestName.length > 80) {
      return NextResponse.json({ error: "Please share your name." }, { status: 400 });
    }
    if (message.length < 10 || message.length > 4000) {
      return NextResponse.json(
        { error: "Tell us a little more about how we can help (a short note is perfect)." },
        { status: 400 },
      );
    }
    if (!guestPhone && !guestEmailRaw) {
      return NextResponse.json(
        { error: "Leave a WhatsApp number or email so we can reach you." },
        { status: 400 },
      );
    }
    if (guestEmailRaw && !isEmail(guestEmailRaw)) {
      return NextResponse.json({ error: "That email doesn’t look quite right." }, { status: 400 });
    }

    const guestEmail = guestEmailRaw ? normalizeEmail(guestEmailRaw) : null;
    const code = referenceCode();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url;

    let ticketId: string | null = null;
    let guestToken: string | null = null;
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
          subject: subject || "Care team request",
          message,
          page_path: pagePath,
          transcript,
          ip_hash: hashIp(ip),
        })
        .select("id, reference_code, guest_token")
        .single();

      if (error) {
        console.error("[ticket] insert failed (will still email care team):", error);
      } else {
        ticketId = data.id;
        guestToken = data.guest_token;
        stored = true;

        // Seed first guest note via secure RPC (RLS blocks direct message inserts).
        await supabase.rpc("ticket_guest_post_message", {
          p_code: data.reference_code,
          p_token: data.guest_token,
          p_body: message,
        });
      }
    } catch (dbError) {
      console.error("[ticket] database unavailable (will still email care team):", dbError);
    }

    const emailResult = await sendNewTicketOpsEmail({
      referenceCode: code,
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      subject: subject || "Care team request",
      message,
      pagePath,
      transcript,
      siteUrl,
    });

    if (!stored && !emailResult.sent) {
      return NextResponse.json(
        {
          error:
            "We couldn’t reach the care team just now. WhatsApp us and we’ll look after you right away.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      referenceCode: code,
      id: ticketId,
      guestToken,
      stored,
      emailed: emailResult.sent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the care team.";
    console.error("[ticket]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
