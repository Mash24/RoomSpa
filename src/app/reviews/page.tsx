import type { Metadata } from "next";
import Link from "next/link";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { getApprovedReviews } from "@/lib/reviews/fetch";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read guest reviews of RoomSpa mobile massage and share your experience. All reviews are moderated before publishing.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Reviews</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        What guests say
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Honest feedback from guests. New reviews are checked by our team before they appear here.
      </p>

      <div className="mt-12">
        <ReviewsList reviews={reviews} />
      </div>

      <div className="mt-16">
        <ReviewForm />
      </div>

      <p className="mt-8 text-sm text-muted">
        Prefer to book again first?{" "}
        <Link href="/book" className="text-accent underline">
          Book an appointment
        </Link>
        .
      </p>
    </section>
  );
}
