import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { mapAdminReview } from "@/lib/reviews/map";
import type { ReviewStatus } from "@/lib/reviews/types";

const VALID_FILTER = ["pending", "approved", "rejected", "all"] as const;

export async function GET(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterParam = searchParams.get("status") ?? "pending";
  const filter = VALID_FILTER.includes(filterParam as (typeof VALID_FILTER)[number])
    ? filterParam
    : "pending";

  let query = supabase
    .from("reviews")
    .select(
      "id, author_name, author_email, rating, title, body, service_slug, booking_reference, status, rejection_reason, moderated_at, created_at",
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

  return NextResponse.json({
    reviews: (data ?? []).map((row) => mapAdminReview(row as Record<string, unknown>)),
    filter,
  });
}
