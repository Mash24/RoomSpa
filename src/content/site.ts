export const site = {
  name: "RoomSpa",
  tagline: "We come to you",
  description:
    "Premium private in-room massage in Chiang Mai — signature experiences and wellness massage delivered discreetly to your hotel, condo, or home.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contact: {
    email: "hello@getroomspa.com",
    whatsapp: "+66984712237",
  },
  /** Primary chrome — keep short; secondary links live in the footer */
  nav: [
    { label: "Wellness", href: "/services/wellness" },
    { label: "Signature", href: "/services/signature" },
    { label: "Therapists", href: "/therapists" },
    { label: "Pricing", href: "/pricing" },
    { label: "Locations", href: "/city" },
    { label: "Reviews", href: "/reviews" },
    { label: "Gallery", href: "/gallery" },
    { label: "FAQ", href: "/faq" },
  ],
  hero: {
    brand: "RoomSpa",
    eyebrow: "Private in-room massage · Chiang Mai",
    headline: "Premium massage, delivered to your room",
    support:
      "Hotel · Condo · Home — same-day when slots are open. Discreet arrival, professional therapists.",
    primaryCta: { label: "Book a massage", href: "/book" },
    secondaryCta: { label: "View pricing", href: "/pricing" },
    tiers: {
      wellness: {
        label: "Wellness Massage",
        href: "/services/wellness",
        summary:
          "Classic and therapeutic massage experiences delivered privately to your hotel, condo, or home.",
      },
      signature: {
        label: "Signature Experiences",
        href: "/services/signature",
        summary:
          "Private, sensual and intimate massage experiences for those looking for something beyond traditional massage.",
      },
    },
  },
  howItWorks: [
    {
      step: "01",
      title: "Choose your experience",
      body: "Wellness massage or Signature Experiences — pick what fits you.",
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
  coverageNote: "Serving Chiang Mai — hotel, condo, and home.",
} as const;

const whatsappNumber = site.contact.whatsapp.replace(/\D/g, "");
const whatsappMessage = encodeURIComponent(
  "Hi RoomSpa! I'd like to book a massage at my hotel/condo/home. What times are available?",
);

export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
