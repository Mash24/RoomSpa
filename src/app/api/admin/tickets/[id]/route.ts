import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

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

  const { data, error: dbError } = await supabase
    .from("support_tickets")
    .update(patch)
    .eq("id", id)
    .select("id, status, admin_notes")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ ticket: data });
}
