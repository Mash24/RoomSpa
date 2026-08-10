import { NextResponse } from "next/server";
import { generateChatReply, type ChatMessage } from "@/lib/chat/respond";
import { getPublicCatalog } from "@/lib/catalog/public";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function allow(key: string, limit = 30, windowMs = 60 * 60 * 1000) {
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

function normalizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const item of raw.slice(-12)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const content = String((item as { content?: string }).content ?? "").trim();
    if ((role !== "user" && role !== "assistant") || !content) continue;
    if (content.length > 2000) continue;
    out.push({ role, content });
  }
  return out.length ? out : null;
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!allow(`chat:${ip}`)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again in a bit, or Talk to Live Agent / WhatsApp." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const messages = normalizeMessages(body?.messages);
    if (!messages) {
      return NextResponse.json({ error: "Send a chat message." }, { status: 400 });
    }

    const last = messages[messages.length - 1];
    if (last.role !== "user") {
      return NextResponse.json({ error: "Last message must be from the guest." }, { status: 400 });
    }

    const catalog = await getPublicCatalog();
    const result = await generateChatReply(messages, catalog);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat unavailable.";
    console.error("[chat]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
