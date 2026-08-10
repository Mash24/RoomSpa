import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { sendTicketReplyToGuest } from "@/lib/email/ticket";
import { site } from "@/content/site";

const VALID_STATUSES = ["open", "in_progress", "resolved", "spam"] as const;
type TicketStatus = (typeof VALID_STATUSES)[number];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const action = String(body?.action ?? "status").trim();

  if (action === "reply") {
    const reply = String(body?.message ?? "").trim();
    if (reply.length < 1 || reply.length > 4000) {
      return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("id, reference_code, guest_name, guest_email, status, ended_at")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }
    if (ticket.ended_at || ticket.status === "resolved" || ticket.status === "spam") {
      return NextResponse.json(
        { error: "This chat has already ended." },
        { status: 409 },
      );
    }

    const { error: messageError } = await supabase.from("support_ticket_messages").insert({
      ticket_id: id,
      sender: "admin",
      body: reply,
    });

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 400 });
    }

    await supabase
      .from("support_tickets")
      .update({ status: "in_progress" })
      .eq("id", id);

    if (ticket.guest_email) {
      void sendTicketReplyToGuest({
        guestName: ticket.guest_name,
        guestEmail: ticket.guest_email,
        referenceCode: ticket.reference_code,
        replyBody: reply,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url,
      });
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "end") {
    const { data, error: dbError } = await supabase
      .from("support_tickets")
      .update({
        status: "resolved",
        ended_at: new Date().toISOString(),
        ended_by: "admin",
      })
      .eq("id", id)
      .select("id, status, ended_at, ended_by")
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ ticket: data });
  }

  const status = body?.status as TicketStatus | undefined;
  const adminNotes = body?.adminNotes !== undefined ? String(body.adminNotes) : undefined;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  if (status) patch.status = status;
  if (adminNotes !== undefined) patch.admin_notes = adminNotes.slice(0, 2000);

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  if (status === "resolved") {
    patch.ended_at = new Date().toISOString();
    patch.ended_by = "admin";
  }

  const { data, error: dbError } = await supabase
    .from("support_tickets")
    .update(patch)
    .eq("id", id)
    .select("id, status, admin_notes, ended_at, ended_by")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ ticket: data });
}
