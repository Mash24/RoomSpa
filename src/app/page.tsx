import { HomeCta } from "@/components/home/home-cta";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeServices } from "@/components/home/home-services";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <HomeHero />
      <HomeServices />
      <HomeHowItWorks />
      <HomeCta />
    </>
  );
}
