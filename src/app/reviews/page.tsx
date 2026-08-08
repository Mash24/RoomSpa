import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { getApprovedReviews } from "@/lib/reviews/fetch";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Guest reviews of RoomSpa in-room massage in Chiang Mai.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Reviews</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        What guests say
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Real feedback from guests who booked at their hotel, condo, or home.
      </p>

      <div className="mt-12">
        <ReviewsList reviews={reviews} />
      </div>

      <div className="mt-16">
        <Suspense fallback={<p className="text-sm text-muted">Loading review form...</p>}>
          <ReviewForm />
        </Suspense>
      </div>

      <p className="mt-8 text-sm text-muted">
        <Link href="/book" className="text-accent underline">
          Book again
        </Link>
      </p>
    </section>
  );
}
