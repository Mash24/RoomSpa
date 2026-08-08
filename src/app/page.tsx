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
  const approved = await getApprovedReviews(4);
  const allForRating = await getApprovedReviews(50);
  const aggregate = aggregateRating(allForRating);
  const fromGuests = approved.length > 0;
  const items = fromGuests
    ? approved.map((review) => ({
        quote: review.body,
        name: review.authorName,
        detail: review.serviceName || "Guest review",
      }))
    : testimonials.slice(0, 4).map((item) => ({
        quote: item.quote,
        name: item.name,
        detail: item.detail,
      }));

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <LocalBusinessJsonLd aggregate={aggregate} />
      <HomeHero />
      <HomeServices services={featured} />
      <HomeHowItWorks />
      <HomeTestimonials items={items} fromGuests={fromGuests} />
    </>
  );
}
