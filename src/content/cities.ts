import { coverageAreas } from "@/content/coverage";

/**
 * City status:
 * - active — therapists live; guests can book online
 * - enquiries — reserved for future cities only (not Bangkok / Phuket / Chiang Mai)
 * - coming_soon — listed for SEO / roadmap only
 */
export type CityStatus = "active" | "enquiries" | "coming_soon";

export type CityDefinition = {
  slug: string;
  name: string;
  country: string;
  status: CityStatus;
  /** Public discovery order: Bangkok → Phuket → Chiang Mai */
  displayOrder: number;
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
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    status: "active",
    displayOrder: 1,
    headline: "In-room massage in Bangkok",
    summary:
      "Private Signature Experiences and wellness massage delivered to hotels, condos, and homes across Bangkok — including Sukhumvit, Silom, and Sathorn.",
    seoTitle: "In-Room Massage Bangkok | GetRoomSpa",
    seoDescription:
      "Book private in-room massage in Bangkok — Signature and wellness sessions at your hotel, condo, or home. Same-day when therapists are available.",
    neighborhoods: [
      {
        slug: "sukhumvit",
        name: "Sukhumvit",
        summary: "Hotels and condos along Sukhumvit — discreet in-room sessions.",
      },
      {
        slug: "silom",
        name: "Silom / Sathorn",
        summary: "Business-district hotels and residences for private in-room massage.",
      },
    ],
  },
  {
    slug: "phuket",
    name: "Phuket",
    country: "Thailand",
    status: "active",
    displayOrder: 2,
    headline: "In-room massage in Phuket",
    summary:
      "Private Signature Experiences and wellness massage at resorts, hotels, and villas across Phuket — including Patong, Kata / Karon, and Rawai / Nai Harn.",
    seoTitle: "In-Room Massage Phuket | GetRoomSpa",
    seoDescription:
      "Book private in-room massage in Phuket — Signature and wellness sessions at your resort, hotel, or villa. Tell us your area so we can match therapists nearby.",
    neighborhoods: [
      {
        slug: "patong",
        name: "Patong",
        summary: "Resort and hotel stays in Patong for private in-room sessions.",
      },
      {
        slug: "kata",
        name: "Kata / Karon",
        summary: "Beachside hotels and residences in Kata and Karon.",
      },
      {
        slug: "rawai",
        name: "Rawai / Nai Harn",
        summary: "Villas and quieter stays around Rawai and Nai Harn — tell us your property when you book.",
      },
    ],
  },
  {
    slug: "chiang-mai",
    name: "Chiang Mai",
    country: "Thailand",
    status: "active",
    displayOrder: 3,
    headline: "In-room massage in Chiang Mai",
    summary:
      "Private Signature Experiences and wellness massage at hotels, condos, and homes across Old City, Nimman, and the Airport / Hang Dong corridor.",
    seoTitle: "In-Room Massage Chiang Mai | GetRoomSpa",
    seoDescription:
      "Book private in-room massage in Chiang Mai — Signature and wellness sessions delivered to your hotel, condo, or home. Old City, Nimman, Airport corridor.",
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
          "Hotel and condo massage near Nimmanhaemin Road, Maya, and the university strip.",
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

/** Active cities in public display order (Bangkok → Phuket → Chiang Mai). */
export function getActiveCities() {
  return cities
    .filter((city) => city.status === "active")
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getBookableOrEnquiryCities() {
  return cities
    .filter((city) => city.status === "active" || city.status === "enquiries")
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
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
