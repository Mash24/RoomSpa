import { HomeCta } from "@/components/home/home-cta";
import { HomeGallery } from "@/components/home/home-gallery";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomePricing } from "@/components/home/home-pricing";
import { HomeServices } from "@/components/home/home-services";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <HomeHero />
      <HomeServices />
      <HomeGallery />
      <HomePricing />
      <HomeHowItWorks />
      <HomeTestimonials />
      <HomeCta />
    </>
  );
}
