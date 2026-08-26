import { HomeBookStrip } from "@/components/home/home-book-strip";
import { HomeExperienceChooser } from "@/components/home/home-experience-chooser";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeSignaturePreview } from "@/components/home/home-signature-preview";
import { HomeTherapistSearch } from "@/components/home/home-therapist-search";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { LocalBusinessJsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { testimonials } from "@/content/marketing";
import {
  getBookStripTreatments,
  getPublicCatalog,
  getPublicSignatureServices,
} from "@/lib/catalog/public";
import { getPublicTherapists } from "@/lib/therapists/public";
import { aggregateRating, getApprovedReviews } from "@/lib/reviews/fetch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [signature, bookTreatments, therapists, catalog] = await Promise.all([
    getPublicSignatureServices(4),
    getBookStripTreatments(),
    getPublicTherapists({ limit: 12 }),
    getPublicCatalog(),
  ]);
  const approved = await getApprovedReviews(12);
  const allForRating = await getApprovedReviews(50);
  const aggregate = aggregateRating(allForRating);

  const guestItems = approved.map((review) => ({
    id: review.id,
    quote: review.body,
    name: review.authorName,
    detail: review.serviceName || "Guest review",
  }));

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
      {signature.length > 0 ? <HomeSignaturePreview services={signature} /> : null}
      <HomeExperienceChooser />
      <HomeTherapistSearch
        initialTherapists={therapists}
        serviceOptions={catalog.map((s) => ({ slug: s.slug, name: s.name }))}
      />
      <HomeHowItWorks />
      <HomeTestimonials items={items} fromGuests={fromGuests} />
    </>
  );
}
