import { createHash } from "crypto";
import { getCatalogProduct } from "@/content/services";
import type { AdminReview, PublicReview, ReviewStatus } from "@/lib/reviews/types";

export function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function mapPublicReview(row: Record<string, unknown>): PublicReview {
  const slug = (row.service_slug as string | null) ?? null;
  const catalog = slug ? getCatalogProduct(slug) : null;

  return {
    id: row.id as string,
    authorName: row.author_name as string,
    rating: row.rating as number,
    title: (row.title as string) ?? "",
    body: row.body as string,
    serviceSlug: slug,
    serviceName: catalog?.name ?? null,
    createdAt: row.created_at as string,
  };
}

export function mapAdminReview(row: Record<string, unknown>): AdminReview {
  return {
    ...mapPublicReview(row),
    authorEmail: (row.author_email as string | null) ?? null,
    bookingReference: (row.booking_reference as string | null) ?? null,
    status: row.status as ReviewStatus,
    rejectionReason: (row.rejection_reason as string) ?? "",
    moderatedAt: (row.moderated_at as string | null) ?? null,
  };
}

export function formatReviewDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function starsLabel(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}
