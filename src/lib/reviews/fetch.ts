import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { mapPublicReview } from "@/lib/reviews/map";
import type { PublicReview } from "@/lib/reviews/types";

export async function getApprovedReviews(limit = 50): Promise<PublicReview[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, author_name, rating, title, body, service_slug, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((row) => mapPublicReview(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getApprovedReviewsForService(
  serviceSlug: string,
  limit = 12,
): Promise<PublicReview[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, author_name, rating, title, body, service_slug, created_at")
      .eq("status", "approved")
      .eq("service_slug", serviceSlug)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((row) => mapPublicReview(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export function aggregateRating(reviews: PublicReview[]) {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return {
    ratingValue: Number((sum / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };
}
