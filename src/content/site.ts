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
    "Book professional in-room massage at your hotel, condo, or home — classic, therapeutic, couples, and consent-led sensual or tantric sessions including Nuru, Yoni, and Lingam.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contact: {
    email: "hello@roomspa.com",
    whatsapp: "+66984712237",
  },
  nav: [
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "Coverage", href: "/coverage" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
  ],
  hero: {
    brand: "RoomSpa",
    headline: "Spa-quality massage at your door",
    support:
      "Professional therapists travel to your hotel, condo, or home — classic to tantric, book in minutes.",
    primaryCta: { label: "Book an appointment", href: "/book" },
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
      title: "Choose your service",
      body: "From Swedish and Thai to Nuru, Yoni, Lingam, and couples — pick what you need.",
    },
    {
      step: "02",
      title: "Pick a time & place",
      body: "Hotel, condo, or home. Multiple therapists mean overlapping times are fine.",
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
