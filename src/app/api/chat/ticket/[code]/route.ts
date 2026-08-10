import { NextResponse } from "next/server";
import { createAdminishAnonClient } from "@/lib/supabase/anon";

type RouteContext = {
  params: Promise<{ code: string }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    const token = new URL(request.url).searchParams.get("token")?.trim() || "";
    if (!code || !isUuid(token)) {
      return NextResponse.json({ error: "Missing chat details." }, { status: 400 });
    }

    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase.rpc("ticket_guest_fetch", {
      p_code: code,
      p_token: token,
    });

    if (error) {
      console.error("[ticket fetch]", error);
      return NextResponse.json({ error: "Could not load this chat." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "We couldn’t find that chat." }, { status: 404 });
    }

    return NextResponse.json({ ticket: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load this chat.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    const body = await request.json().catch(() => null);
    const token = String(body?.token ?? "").trim();
    const action = String(body?.action ?? "message").trim();

    if (!code || !isUuid(token)) {
      return NextResponse.json({ error: "Missing chat details." }, { status: 400 });
    }

    const supabase = createAdminishAnonClient();

    if (action === "message") {
      const text = String(body?.message ?? "").trim();
      if (text.length < 1) {
        return NextResponse.json({ error: "Write a short message first." }, { status: 400 });
      }

      const { data, error } = await supabase.rpc("ticket_guest_post_message", {
        p_code: code,
        p_token: token,
        p_body: text,
      });

      if (error) {
        const ended = error.message?.includes("ticket_ended");
        return NextResponse.json(
          {
            error: ended
              ? "This chat has already ended. Start a fresh one anytime."
              : "Could not send your message.",
          },
          { status: ended ? 409 : 500 },
        );
      }
      if (!data) {
        return NextResponse.json({ error: "We couldn’t find that chat." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, message: data });
    }

    if (action === "end") {
      const ratingRaw = body?.rating;
      const rating =
        ratingRaw === null || ratingRaw === undefined || ratingRaw === ""
          ? null
          : Number(ratingRaw);
      const comment = String(body?.comment ?? "").trim().slice(0, 1000);
      const shareOk = Boolean(body?.shareOk);

      if (rating !== null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
        return NextResponse.json({ error: "Choose a rating from 1 to 5, or skip." }, { status: 400 });
      }

      const { data, error } = await supabase.rpc("ticket_guest_end", {
        p_code: code,
        p_token: token,
        p_rating: rating,
        p_comment: comment,
        p_share: shareOk,
      });

      if (error) {
        console.error("[ticket end]", error);
        return NextResponse.json({ error: "Could not close this chat." }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "We couldn’t find that chat." }, { status: 404 });
      }

      // Optional: turn a shared rating into a pending public guest story.
      if (shareOk && rating && comment.length >= 20) {
        try {
          const { data: ticketRow } = await supabase.rpc("ticket_guest_fetch", {
            p_code: code,
            p_token: token,
          });
          const guestName = String(ticketRow?.guestName ?? "Guest").slice(0, 80);
          await supabase.from("reviews").insert({
            author_name: guestName,
            rating,
            title: "Chat with RoomSpa",
            body: comment.slice(0, 1000),
            status: "pending",
          });
        } catch (reviewError) {
          console.error("[ticket] optional review share failed:", reviewError);
        }
      }

      return NextResponse.json({ ok: true, result: data });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
