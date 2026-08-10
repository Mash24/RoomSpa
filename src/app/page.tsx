import { HomeBookStrip } from "@/components/home/home-book-strip";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeServices } from "@/components/home/home-services";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { LocalBusinessJsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { testimonials } from "@/content/marketing";
import {
  getBookStripTreatments,
  getPublicFeaturedServices,
} from "@/lib/catalog/public";
import { aggregateRating, getApprovedReviews } from "@/lib/reviews/fetch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, bookTreatments] = await Promise.all([
    getPublicFeaturedServices(6),
    getBookStripTreatments(),
  ]);
  const approved = await getApprovedReviews(12);
  const allForRating = await getApprovedReviews(50);
  const aggregate = aggregateRating(allForRating);

  const guestItems = approved.map((review) => ({
    quote: review.body,
    name: review.authorName,
    detail: review.serviceName || "Guest review",
  }));

  // Only show placeholder quotes when there are no approved guest reviews yet.
  const items =
    guestItems.length > 0
      ? guestItems
      : testimonials.map((item) => ({
          quote: item.quote,
          name: item.name,
          detail: item.detail,
        }));
  const fromGuests = guestItems.length > 0;

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <LocalBusinessJsonLd aggregate={aggregate} />
      <HomeHero />
      <HomeBookStrip treatments={bookTreatments} />
      <HomeServices services={featured} />
      <HomeHowItWorks />
      <HomeTestimonials items={items} fromGuests={fromGuests} />
    </>
  );
}
