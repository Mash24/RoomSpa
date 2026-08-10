import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

const VALID_FILTER = ["open", "in_progress", "resolved", "spam", "all"] as const;

export type AdminTicket = {
  id: string;
  referenceCode: string;
  status: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  subject: string;
  message: string;
  pagePath: string | null;
  transcript: { role: string; content: string }[];
  adminNotes: string;
  endedAt: string | null;
  endedBy: string | null;
  rating: number | null;
  ratingComment: string;
  ratingShareOk: boolean;
  createdAt: string;
  messages: { id: string; sender: string; body: string; createdAt: string }[];
};

function mapTicket(
  row: Record<string, unknown>,
  messages: { id: string; sender: string; body: string; createdAt: string }[],
): AdminTicket {
  const transcript = Array.isArray(row.transcript)
    ? (row.transcript as { role: string; content: string }[])
    : [];
  return {
    id: String(row.id),
    referenceCode: String(row.reference_code ?? ""),
    status: String(row.status ?? "open"),
    guestName: String(row.guest_name ?? ""),
    guestEmail: row.guest_email ? String(row.guest_email) : null,
    guestPhone: row.guest_phone ? String(row.guest_phone) : null,
    subject: String(row.subject ?? ""),
    message: String(row.message ?? ""),
    pagePath: row.page_path ? String(row.page_path) : null,
    transcript,
    adminNotes: String(row.admin_notes ?? ""),
    endedAt: row.ended_at ? String(row.ended_at) : null,
    endedBy: row.ended_by ? String(row.ended_by) : null,
    rating: typeof row.rating === "number" ? row.rating : row.rating ? Number(row.rating) : null,
    ratingComment: String(row.rating_comment ?? ""),
    ratingShareOk: Boolean(row.rating_share_ok),
    createdAt: String(row.created_at ?? ""),
    messages,
  };
}

export async function GET(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterParam = searchParams.get("status") ?? "open";
  const filter = VALID_FILTER.includes(filterParam as (typeof VALID_FILTER)[number])
    ? filterParam
    : "open";

  let query = supabase
    .from("support_tickets")
    .select(
      "id, reference_code, status, guest_name, guest_email, guest_phone, subject, message, page_path, transcript, admin_notes, ended_at, ended_by, rating, rating_comment, rating_share_ok, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error: dbError } = await query;
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const rows = data ?? [];
  const ids = rows.map((row) => row.id as string);
  const messagesByTicket = new Map<
    string,
    { id: string; sender: string; body: string; createdAt: string }[]
  >();

  if (ids.length) {
    const { data: messageRows } = await supabase
      .from("support_ticket_messages")
      .select("id, ticket_id, sender, body, created_at")
      .in("ticket_id", ids)
      .order("created_at", { ascending: true });

    for (const message of messageRows ?? []) {
      const list = messagesByTicket.get(String(message.ticket_id)) || [];
      list.push({
        id: String(message.id),
        sender: String(message.sender),
        body: String(message.body),
        createdAt: String(message.created_at),
      });
      messagesByTicket.set(String(message.ticket_id), list);
    }
  }

  return NextResponse.json({
    tickets: rows.map((row) =>
      mapTicket(row as Record<string, unknown>, messagesByTicket.get(String(row.id)) || []),
    ),
    filter,
  });
}
