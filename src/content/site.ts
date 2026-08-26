export const site = {
  name: "RoomSpa",
  tagline: "Private Signature massage, to your door",
  description:
    "Private Signature Experiences delivered to your hotel, condo, or home across Thailand — Tantric, Nuru, body-to-body, and more. Consent-led, discreet, and bookable where therapists are live.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contact: {
    email: "hello@getroomspa.com",
    whatsapp: "+66984712237",
  },
  /** Primary chrome — Signature leads; wellness secondary; cities in Locations */
  nav: [
    { label: "Signature", href: "/services/signature" },
    { label: "Wellness", href: "/services/wellness" },
    { label: "Therapists", href: "/therapists" },
    { label: "Pricing", href: "/pricing" },
    { label: "Locations", href: "/city" },
    { label: "Reviews", href: "/reviews" },
    { label: "Gallery", href: "/gallery" },
    { label: "FAQ", href: "/faq" },
  ],
  hero: {
    brand: "RoomSpa",
    eyebrow: "Private Signature Experiences · Thailand",
    headline: "Intimate massage, delivered to your room",
    support:
      "Tantric, Nuru, body-to-body, and more — discreet arrival at your hotel, condo, or home. Book where therapists are live; enquire for other cities.",
    primaryCta: { label: "Book Signature", href: "/book" },
    secondaryCta: { label: "View Signature menu", href: "/services/signature" },
    tiers: {
      signature: {
        label: "Signature Experiences",
        href: "/services/signature",
        summary:
          "Private, sensual, consent-led sessions — Tantric, Nuru, body-to-body, Yoni, Lingam, and couples. This is what RoomSpa is known for.",
      },
      wellness: {
        label: "Wellness Massage",
        href: "/services/wellness",
        summary:
          "Classic Swedish, Thai, deep tissue, and recovery massage — also available when you want something quieter.",
      },
    },
  },
  howItWorks: [
    {
      step: "01",
      title: "Choose your Signature",
      body: "Pick Tantric, Nuru, body-to-body, or another private experience — or wellness if you prefer classic massage.",
    },
    {
      step: "02",
      title: "Tell us where you are",
      body: "Hotel, condo, or home anywhere we cover — same-day when slots are open.",
    },
    {
      step: "03",
      title: "Relax in place",
      body: "Your therapist arrives prepared and discreet. You stay where you are.",
    },
  ],
  coverageNote:
    "Serving Thailand — book live cities now; enquire for Bangkok, Phuket, and expanding coverage.",
} as const;

const whatsappNumber = site.contact.whatsapp.replace(/\D/g, "");

/** Static SSR fallback — prefer <WhatsAppLink cta="..." /> for tracked clicks. */
export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Hi RoomSpa! I'm interested in a Signature experience (Tantric / Nuru / body-to-body). Which cities are available?",
)}`;
