import { coverageAreas } from "@/content/coverage";

/**
 * City status:
 * - active — therapists live; guests can book online
 * - enquiries — demand / expansion city; WhatsApp first, not full inventory yet
 * - coming_soon — listed for SEO / roadmap only
 *
 * Add Nairobi (and other countries) the same way when you have local therapists.
 */
export type CityStatus = "active" | "enquiries" | "coming_soon";

export type CityDefinition = {
  slug: string;
  name: string;
  country: string;
  status: CityStatus;
  headline: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  neighborhoods: {
    slug: string;
    name: string;
    summary: string;
    coverageSlug?: string;
  }[];
};

export const cities: CityDefinition[] = [
  {
    slug: "chiang-mai",
    name: "Chiang Mai",
    country: "Thailand",
    status: "active",
    headline: "Signature in-room massage in Chiang Mai",
    summary:
      "Book private Signature Experiences — Tantric, Nuru, body-to-body, and more — plus wellness massage at hotels, condos, and homes across Old City, Nimman, and the Airport / Hang Dong corridor.",
    seoTitle: "Signature in-room massage Chiang Mai | Private hotel & condo",
    seoDescription:
      "Book private Signature massage in Chiang Mai — Tantric, Nuru, body-to-body, and more delivered to your hotel, condo, or home. Old City, Nimman, Airport corridor.",
    neighborhoods: [
      {
        slug: "old-city",
        name: "Old City / Center",
        summary:
          "Discrete in-room Signature and wellness massage for hotels and guesthouses inside and around the old walls.",
        coverageSlug: "chiang-mai-old-city",
      },
      {
        slug: "nimman",
        name: "Nimman / University area",
        summary:
          "Hotel and condo massage near Nimmanhaemin Road, Maya, and the university strip — fast booking for travelers and couples.",
        coverageSlug: "chiang-mai-nimman",
      },
      {
        slug: "airport-hang-dong",
        name: "Airport / Hang Dong",
        summary:
          "Mobile massage for airport-area hotels and Hang Dong residences. A small travel fee may apply — shown at booking.",
        coverageSlug: "chiang-mai-airport",
      },
    ],
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    status: "enquiries",
    headline: "Signature in-room massage in Bangkok — enquiries open",
    summary:
      "We’re building Bangkok coverage for private Signature Experiences. WhatsApp us with your area and preferred treatment — availability varies while we onboard therapists.",
    seoTitle: "Signature in-room massage Bangkok — enquiries open | RoomSpa",
    seoDescription:
      "RoomSpa accepts Bangkok enquiries for private Signature massage (Tantric, Nuru, and more). Message WhatsApp with your area — therapist availability varies.",
    neighborhoods: [
      { slug: "sukhumvit", name: "Sukhumvit", summary: "Enquiries open — tell us your hotel or condo." },
      { slug: "silom", name: "Silom / Sathorn", summary: "Enquiries open for business-district stays." },
    ],
  },
  {
    slug: "phuket",
    name: "Phuket",
    country: "Thailand",
    status: "enquiries",
    headline: "Signature in-room massage in Phuket — enquiries open",
    summary:
      "Phuket guests already reach out for private Signature Experiences. WhatsApp us with your resort or villa area — we’ll confirm what we can cover while supply grows.",
    seoTitle: "Signature in-room massage Phuket — enquiries open | RoomSpa",
    seoDescription:
      "RoomSpa accepts Phuket enquiries for private Signature massage at resorts and villas. Message WhatsApp — availability by area while we expand.",
    neighborhoods: [
      { slug: "patong", name: "Patong", summary: "Enquiries open for resort and hotel stays." },
      { slug: "kata", name: "Kata / Karon", summary: "Enquiries open for beachside stays." },
      { slug: "rawai", name: "Rawai / Nai Harn", summary: "Enquiries open for villa coverage." },
    ],
  },
  // Next country when therapists are ready, e.g.:
  // { slug: "nairobi", name: "Nairobi", country: "Kenya", status: "enquiries", ... }
];

export function cityStatusLabel(status: CityStatus): string {
  switch (status) {
    case "active":
      return "Available now";
    case "enquiries":
      return "Enquiries open";
    default:
      return "Coming soon";
  }
}

export function getCity(slug: string) {
  return cities.find((city) => city.slug === slug);
}

export function getActiveCities() {
  return cities.filter((city) => city.status === "active");
}

export function getBookableOrEnquiryCities() {
  return cities.filter((city) => city.status === "active" || city.status === "enquiries");
}

export function getNeighborhood(citySlug: string, areaSlug: string) {
  const city = getCity(citySlug);
  if (!city) return null;
  const area = city.neighborhoods.find((item) => item.slug === areaSlug);
  if (!area) return null;
  return { city, area };
}

export function coverageForNeighborhood(coverageSlug?: string) {
  if (!coverageSlug) return null;
  return coverageAreas.find((area) => area.slug === coverageSlug) ?? null;
}
