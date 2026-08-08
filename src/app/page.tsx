import { HomeBookStrip } from "@/components/home/home-book-strip";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeServices } from "@/components/home/home-services";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { LocalBusinessJsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { testimonials } from "@/content/marketing";
import { getPublicFeaturedServices } from "@/lib/catalog/public";
import { aggregateRating, getApprovedReviews } from "@/lib/reviews/fetch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getPublicFeaturedServices(4);
  const approved = await getApprovedReviews(8);
  const allForRating = await getApprovedReviews(50);
  const aggregate = aggregateRating(allForRating);

  const guestItems = approved.map((review) => ({
    quote: review.body,
    name: review.authorName,
    detail: review.serviceName || "Guest review",
  }));

  // Keep every real guest review (including candid ones), and pad with
  // convenience-focused quotes so one review never defines the homepage alone.
  const filler = testimonials.map((item) => ({
    quote: item.quote,
    name: item.name,
    detail: item.detail,
  }));
  const items = [...guestItems, ...filler].slice(0, 6);
  const fromGuests = guestItems.length > 0;

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <LocalBusinessJsonLd aggregate={aggregate} />
      <HomeHero />
      <HomeBookStrip />
      <HomeServices services={featured} />
      <HomeHowItWorks />
      <HomeTestimonials items={items} fromGuests={fromGuests} />
    </>
  );
}
