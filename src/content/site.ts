/** Site content — CMS-ready shape for Phase 1 admin later */
import { catalogServices, featuredServices } from "@/content/services";

const homeServicePicks = (() => {
  const featured = featuredServices.slice(0, 4);
  if (featured.length >= 4) return featured;
  const extras = catalogServices.filter(
    (service) => !featured.some((item) => item.slug === service.slug),
  );
  return [...featured, ...extras].slice(0, 4);
})();

export const site = {
  name: "RoomSpa",
  tagline: "Premium massage, wherever you are",
  description:
    "Book professional in-room massage at your hotel, condo, or home in Chiang Mai — classic, therapeutic, and couples sessions.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contact: {
    email: "hello@getroomspa.com",
    whatsapp: "+66984712237",
  },
  /** Primary chrome — keep short; secondary links live in the footer */
  nav: [
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "Gallery", href: "/gallery" },
    { label: "Reviews", href: "/reviews" },
  ],
  hero: {
    brand: "RoomSpa",
    headline: "Spa-quality massage at your door",
    support:
      "A professional therapist comes to your hotel, condo, or home in Chiang Mai. Book online in minutes.",
    primaryCta: { label: "Book now", href: "/book" },
    secondaryCta: { label: "View services", href: "/services" },
  },
  services: homeServicePicks.map((service) => ({
    slug: service.slug,
    title: service.name,
    summary: service.summary,
    duration: service.duration,
  })),
  howItWorks: [
    {
      step: "01",
      title: "Choose a service",
      body: "Pick the treatment and length that fits you.",
    },
    {
      step: "02",
      title: "Pick time & place",
      body: "Hotel, condo, or home — same-day when slots are open.",
    },
    {
      step: "03",
      title: "Relax in place",
      body: "Your therapist arrives prepared. You stay where you are.",
    },
  ],
  coverageNote:
    "Launching in Chiang Mai. City-flexible by design — expand without renaming the brand.",
} as const;

const whatsappNumber = site.contact.whatsapp.replace(/\D/g, "");
const whatsappMessage = encodeURIComponent(
  "Hi RoomSpa! I'd like to book a massage at my hotel/condo/home. What times are available?",
);

export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
