export type ReviewStatus = "pending" | "approved" | "rejected";

export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  serviceSlug: string | null;
  serviceName: string | null;
  createdAt: string;
};

export type AdminReview = PublicReview & {
  authorEmail: string | null;
  bookingReference: string | null;
  status: ReviewStatus;
  rejectionReason: string;
  moderatedAt: string | null;
};
