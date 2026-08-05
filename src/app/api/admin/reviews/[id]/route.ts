import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { ReviewStatus } from "@/lib/reviews/types";

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { session, supabase, error } = await requireAdminSession();
  if (error || !supabase || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status as ReviewStatus | undefined;
  const rejectionReason = String(body?.rejectionReason ?? "").trim();

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (status === "rejected" && rejectionReason.length > 300) {
    return NextResponse.json({ error: "Rejection reason is too long." }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("reviews")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason : "",
      moderated_at: new Date().toISOString(),
      moderated_by: session.userId,
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ review: data });
}
