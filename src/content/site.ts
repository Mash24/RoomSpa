/** Site content — CMS-ready shape for Phase 1 admin later */
export const site = {
  name: "RoomSpa",
  tagline: "Premium massage, wherever you are",
  description:
    "Book a professional in-room massage at your hotel, condo, or home. Designed for travelers, expats, and anyone who wants spa-quality care without leaving the room.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contact: {
    email: "hello@roomspa.com",
    whatsapp: "+66000000000",
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
      "Licensed therapists travel to your hotel, condo, or home — book in minutes.",
    primaryCta: { label: "Book an appointment", href: "/book" },
    secondaryCta: { label: "View services", href: "/services" },
  },
  services: [
    {
      slug: "swedish",
      title: "Swedish Massage",
      summary: "Classic full-body relaxation with long, flowing strokes.",
      duration: "60–90 min",
    },
    {
      slug: "deep-tissue",
      title: "Deep Tissue",
      summary: "Targeted pressure for tension, travel fatigue, and desk strain.",
      duration: "60–90 min",
    },
    {
      slug: "aromatherapy",
      title: "Aromatherapy",
      summary: "Essential oils paired with gentle technique for deep calm.",
      duration: "60–90 min",
    },
    {
      slug: "couples",
      title: "Couples Massage",
      summary: "Side-by-side sessions for two — ideal for hotels and suites.",
      duration: "60–90 min",
    },
  ],
  howItWorks: [
    {
      step: "01",
      title: "Choose your service",
      body: "Pick the massage style, duration, and where we should meet you.",
    },
    {
      step: "02",
      title: "Pick a time",
      body: "Real-time availability — we block travel time so nothing overlaps.",
    },
    {
      step: "03",
      title: "Relax in place",
      body: "Your therapist arrives prepared. You stay where you are.",
    },
  ],
  coverageNote:
    "City-flexible by design. Launch areas first, then expand without renaming the brand.",
} as const;
