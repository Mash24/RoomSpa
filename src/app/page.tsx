import { HomeCta } from "@/components/home/home-cta";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeServices } from "@/components/home/home-services";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { testimonials } from "@/content/marketing";
import { getApprovedReviews } from "@/lib/reviews/fetch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const approved = await getApprovedReviews(6);
  const fromGuests = approved.length > 0;
  const items = fromGuests
    ? approved.map((review) => ({
        quote: review.body,
        name: review.authorName,
        detail: review.serviceName || "Guest review",
      }))
    : testimonials.map((item) => ({
        quote: item.quote,
        name: item.name,
        detail: item.detail,
      }));

  return (
    <>
      <LocalBusinessJsonLd />
      <HomeHero />
      <HomeServices />
      <HomeHowItWorks />
      <HomeTestimonials items={items} fromGuests={fromGuests} />
      <HomeCta />
    </>
  );
}
