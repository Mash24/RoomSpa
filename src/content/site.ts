export const site = {
  name: "GetRoomSpa",
  tagline: "Private in-room massage across Thailand",
  description:
    "Private Signature and wellness massage delivered to your hotel, condo, or villa in Bangkok, Phuket, and Chiang Mai. Consent-led, discreet, and bookable online.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contact: {
    email: "hello@getroomspa.com",
    whatsapp: "+66984712237",
    /** LINE user ID — also used in line.me deep links */
    lineId: "mashth",
  },
  /** Keep primary chrome short — company links live in the footer */
  nav: [
    { label: "Services", href: "/services" },
    { label: "Therapists", href: "/therapists" },
    { label: "Cities", href: "/city" },
    { label: "Pricing", href: "/pricing" },
    { label: "My Booking", href: "/my-booking" },
  ],
  hero: {
    brand: "GetRoomSpa",
    eyebrow: "Private in-room massage · Thailand",
    headline: "Massage, delivered to your room",
    support:
      "Book private Signature and wellness massage at your hotel, condo or villa in Bangkok, Phuket or Chiang Mai.",
    primaryCta: { label: "Book now", href: "/book" },
    secondaryCta: { label: "Explore experiences", href: "/services/signature" },
    tiers: {
      signature: {
        label: "Signature Experiences",
        href: "/services/signature",
        summary:
          "Private, sensual, consent-led sessions — Tantric, Nuru, body-to-body, Yoni, Lingam, and couples.",
      },
      wellness: {
        label: "Wellness Massage",
        href: "/services/wellness",
        summary:
          "Classic Swedish, Thai, deep tissue, and recovery massage — available when you want something quieter.",
      },
    },
  },
  howItWorks: [
    {
      step: "01",
      title: "Choose your experience",
      body: "Select the massage or therapist you want — Signature or wellness.",
    },
    {
      step: "02",
      title: "Tell us where and when",
      body: "Hotel, condo or villa in Bangkok, Phuket, or Chiang Mai — same-day when slots are open.",
    },
    {
      step: "03",
      title: "Relax in your room",
      body: "Your confirmed therapist comes to you. You stay where you are.",
    },
  ],
  coverageNote:
    "Serving Bangkok, Phuket, and Chiang Mai — private in-room massage across Thailand.",
} as const;

const whatsappNumber = site.contact.whatsapp.replace(/\D/g, "");

/** Static SSR fallback — prefer <WhatsAppLink cta="..." /> for tracked clicks. */
export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Hi GetRoomSpa! I'd like to book a massage at my address. What openings are available?",
)}`;

/** Opens a chat with GetRoomSpa on LINE (user ID). */
export const lineHref = `https://line.me/ti/p/~${site.contact.lineId}`;
