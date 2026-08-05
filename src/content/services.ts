import { dualPriceLabel } from "@/lib/currency";

export type ServiceCategoryId =
  | "classic"
  | "therapeutic"
  | "shared"
  | "sensual";

export type ServiceCategory = {
  id: ServiceCategoryId;
  title: string;
  summary: string;
};

export type CatalogService = {
  slug: string;
  name: string;
  summary: string;
  details: string;
  duration: string;
  durationMinutes: number;
  amountThb: number;
  category: ServiceCategoryId;
  /** Stripe products only exist for a subset today; others use cash / card later. */
  stripeProductId?: string;
  stripePriceId?: string;
  featured?: boolean;
  bookable: boolean;
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: "classic",
    title: "Classic & relaxing",
    summary: "Soft-to-medium pressure sessions for unwind, jet lag, and everyday tension.",
  },
  {
    id: "therapeutic",
    title: "Therapeutic",
    summary: "Focused work for tight muscles, posture strain, and recovery.",
  },
  {
    id: "shared",
    title: "For two",
    summary: "Side-by-side or dual-therapist sessions in your hotel, condo, or home.",
  },
  {
    id: "sensual",
    title: "Sensual & tantric",
    summary:
      "Consent-led bodywork for intimacy, connection, and deep body awareness — always private and professional.",
  },
];

/**
 * Full mobile-capable catalog.
 * Swedish + Couples keep live Stripe sandbox IDs; other services are bookable
 * with cash or card-later until Stripe products are added.
 */
export const catalogServices: CatalogService[] = [
  {
    slug: "swedish",
    name: "Swedish Massage",
    summary:
      "Classic full-body therapy with long, flowing strokes to ease tension and improve circulation.",
    details:
      "Ideal after travel or a long day. Medium pressure unless you ask otherwise. We bring oils, towels, and a portable table when space allows.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 800,
    category: "classic",
    stripeProductId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_SWEDISH ?? "prod_V0lNbo1klB5AQn",
    stripePriceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_SWEDISH ?? "price_1U0jqz2E50DqFYh5G4dF1w1M",
    featured: true,
    bookable: true,
  },
  {
    slug: "aromatherapy",
    name: "Aromatherapy Massage",
    summary: "Gentle massage with essential oils chosen for calm, clarity, or deep rest.",
    details:
      "A softer Swedish-style session scented with blended oils. Tell us any scent preferences or sensitivities when you book.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 1000,
    category: "classic",
    bookable: true,
  },
  {
    slug: "hot-oil",
    name: "Hot Oil Massage",
    summary: "Warm oil poured and massaged along the body for deep heat and glide.",
    details:
      "Slower pace, richer oil coverage, and a very warm, grounding feel. Popular for evening bookings and cool nights.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 1200,
    category: "classic",
    bookable: true,
  },
  {
    slug: "balinese",
    name: "Balinese Massage",
    summary: "Rhythmic palm pressure, stretching, and acupressure for full-body release.",
    details:
      "A flowing traditional style that blends kneading, rolling, and gentle stretches — excellent for whole-body reset.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 1100,
    category: "classic",
    bookable: true,
  },
  {
    slug: "oil",
    name: "Full Body Oil Massage",
    summary: "Smooth oil-based full-body massage tailored to your preferred pressure.",
    details:
      "Straightforward, highly customizable oil massage. Say if you want light, medium, or firm pressure.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 900,
    category: "classic",
    bookable: true,
  },
  {
    slug: "deep-tissue",
    name: "Deep Tissue",
    summary: "Firm, targeted pressure for knots, travel fatigue, and desk strain.",
    details:
      "Slower strokes and deeper work on problem areas. Communicate pressure throughout — we adjust as we go.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 1100,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "thai",
    name: "Thai Massage",
    summary: "Traditional Thai stretching, compression, and energy-line work — usually clothed.",
    details:
      "Performed on a mat when space allows. Wear comfortable, loose clothing. Great for flexibility and stiff backs.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 1000,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "sports",
    name: "Sports Massage",
    summary: "Pre- or post-activity work for athletes, hikers, and active travelers.",
    details:
      "Focuses on major muscle groups, recovery, and mobility. Tell us your sport or sore spots in the booking notes.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 1100,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "foot-reflexology",
    name: "Foot Reflexology",
    summary: "Focused foot and lower-leg work mapped to whole-body relaxation.",
    details:
      "Perfect if you have limited space or prefer a shorter, seated-or-reclined session after a day of walking.",
    duration: "45–60 min",
    durationMinutes: 50,
    amountThb: 700,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "head-shoulder",
    name: "Head, Neck & Shoulder",
    summary: "Upper-body relief for laptop strain, headaches, and stiff necks.",
    details:
      "A compact session that still packs a lot of relief. Easy to book between meetings or after long flights.",
    duration: "45 min",
    durationMinutes: 45,
    amountThb: 600,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "prenatal",
    name: "Prenatal Massage",
    summary: "Side-lying, pregnancy-safe techniques for comfort and circulation.",
    details:
      "Available for uncomplicated pregnancies in the second and third trimesters (with your clinician’s OK). Tell us your week when booking.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 1100,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "lymphatic",
    name: "Lymphatic Drainage",
    summary: "Light, rhythmic strokes to support fluid movement and a lighter feel.",
    details:
      "Gentle technique — not deep pressure. Often chosen for puffiness, recovery, or a soft reset.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 1200,
    category: "therapeutic",
    bookable: true,
  },
  {
    slug: "couples",
    name: "Couples Massage",
    summary:
      "Two therapists, side by side, in the same private room — for couples, friends, or family.",
    details:
      "Requires enough floor or bed space for two setups. Choose matching styles (e.g. both Swedish) in the notes if you have a preference.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 2500,
    category: "shared",
    stripeProductId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_COUPLES ?? "prod_V0lPwaRImIqAPQ",
    stripePriceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLES ?? "price_1U0jsJ2E50DqFYh5EItwggZ4",
    featured: true,
    bookable: true,
  },
  {
    slug: "four-hands",
    name: "Four-Hands Massage",
    summary: "Two therapists work on one guest in synchronized rhythm.",
    details:
      "An immersive, deeply relaxing experience. Best with a bit of open floor space in your room or suite.",
    duration: "60 min",
    durationMinutes: 60,
    amountThb: 2200,
    category: "shared",
    bookable: true,
  },
  {
    slug: "nuru",
    name: "Nuru Massage",
    summary:
      "Full-body Nuru gel massage with smooth, continuous contact — private and consent-led.",
    details:
      "Performed on waterproof sheets we provide. Clear boundaries are set before the session begins. Shower access is helpful but not always required.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 3500,
    category: "sensual",
    featured: true,
    bookable: true,
  },
  {
    slug: "body-to-body",
    name: "Body-to-Body Massage",
    summary: "Close-contact oil massage using the therapist’s body for broad, flowing pressure.",
    details:
      "A sensual full-body experience with agreed boundaries upfront. Discreet arrival and professional conduct throughout.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 3000,
    category: "sensual",
    bookable: true,
  },
  {
    slug: "yoni",
    name: "Yoni Massage",
    summary:
      "Tantric, consent-based genital massage for women — focused on presence, breath, and body trust.",
    details:
      "Not a sexual service in the escort sense: sessions are structured, respectful, and paced by your comfort. A brief intake conversation happens before touch begins.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 2800,
    category: "sensual",
    bookable: true,
  },
  {
    slug: "lingam",
    name: "Lingam Massage",
    summary:
      "Tantric, consent-based genital massage for men — awareness, breath, and full-body relaxation.",
    details:
      "Clear consent and boundaries before and during the session. Designed as bodywork, not a rushed sexual appointment.",
    duration: "60–90 min",
    durationMinutes: 75,
    amountThb: 2800,
    category: "sensual",
    bookable: true,
  },
  {
    slug: "tantric",
    name: "Tantric Massage",
    summary: "Slow, full-body tantric touch combining breath, presence, and energy awareness.",
    details:
      "May include sensual full-body work depending on your stated boundaries. Ideal when you want something slower and more intentional than a classic spa massage.",
    duration: "90 min",
    durationMinutes: 90,
    amountThb: 3200,
    category: "sensual",
    bookable: true,
  },
  {
    slug: "couples-sensual",
    name: "Couples Sensual / Tantric",
    summary: "Guided dual session for partners who want shared intimacy and relaxation at home.",
    details:
      "Two therapists or a facilitated couples format depending on availability. Boundaries and goals are confirmed before we begin.",
    duration: "90 min",
    durationMinutes: 90,
    amountThb: 4500,
    category: "shared",
    bookable: true,
  },
];

export const catalogProducts = catalogServices.filter((service) => service.bookable);

export const featuredServices = catalogServices.filter((service) => service.featured);

export function productPriceLabel(amountThb: number) {
  return dualPriceLabel(amountThb);
}

export function getCatalogProduct(slug: string) {
  return catalogServices.find((service) => service.slug === slug && service.bookable);
}

export function getServicesByCategory(category: ServiceCategoryId) {
  return catalogServices.filter(
    (service) => service.category === category && service.bookable,
  );
}

export function serviceAcceptsCardNow(service: CatalogService) {
  return Boolean(service.stripePriceId);
}
