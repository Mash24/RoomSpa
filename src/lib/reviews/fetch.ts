import { unstable_cache } from "next/cache";
import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache/public";
import { mapPublicReview } from "@/lib/reviews/map";
import type { PublicReview } from "@/lib/reviews/types";

export async function getApprovedReviews(limit = 50): Promise<PublicReview[]> {
  return unstable_cache(
    async (capped: number): Promise<PublicReview[]> => {
      try {
        const supabase = createAdminishAnonClient();
        const { data, error } = await supabase
          .from("reviews")
          .select("id, author_name, rating, title, body, service_slug, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(capped);

        if (error || !data) return [];
        return data.map((row) => mapPublicReview(row as Record<string, unknown>));
      } catch {
        return [];
      }
    },
    ["approved-reviews"],
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["reviews"] },
  )(limit);
}

export async function getApprovedReviewsForService(
  serviceSlug: string,
  limit = 12,
): Promise<PublicReview[]> {
  return unstable_cache(
    async (slug: string, capped: number): Promise<PublicReview[]> => {
      try {
        const supabase = createAdminishAnonClient();
        const { data, error } = await supabase
          .from("reviews")
          .select("id, author_name, rating, title, body, service_slug, created_at")
          .eq("status", "approved")
          .eq("service_slug", slug)
          .order("created_at", { ascending: false })
          .limit(capped);

        if (error || !data) return [];
        return data.map((row) => mapPublicReview(row as Record<string, unknown>));
      } catch {
        return [];
      }
    },
    ["approved-reviews-service"],
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["reviews"] },
  )(serviceSlug, limit);
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
