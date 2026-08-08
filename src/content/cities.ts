import { coverageAreas } from "@/content/coverage";

export type CityDefinition = {
  slug: string;
  name: string;
  status: "active" | "coming_soon";
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

/**
 * Local SEO cities. Only Chiang Mai is live today.
 * Add Bangkok / Phuket when therapists & ops are ready — do not invent thin fake city pages.
 */
export const cities: CityDefinition[] = [
  {
    slug: "chiang-mai",
    name: "Chiang Mai",
    status: "active",
    headline: "In-room massage in Chiang Mai",
    summary:
      "RoomSpa brings Swedish, Thai, deep tissue, couples, and consent-led sensual massage to hotels, condos, and homes across Old City, Nimman, and the Airport / Hang Dong corridor.",
    seoTitle: "In-room massage Chiang Mai | Hotel & condo massage",
    seoDescription:
      "Book mobile massage in Chiang Mai — Swedish, Thai, deep tissue, couples, Nuru, and more at your hotel, condo, or home. Old City, Nimman, Airport corridor.",
    neighborhoods: [
      {
        slug: "old-city",
        name: "Old City / Center",
        summary:
          "Discrete in-room massage for hotels and guesthouses inside and around the old walls — ideal after temple days or night markets.",
        coverageSlug: "chiang-mai-old-city",
      },
      {
        slug: "nimman",
        name: "Nimman / University area",
        summary:
          "Hotel and condo massage near Nimmanhaemin Road, Maya, and the university strip — fast booking for digital nomads and couples.",
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
    status: "coming_soon",
    headline: "In-room massage in Bangkok — coming soon",
    summary:
      "Bangkok hotel and condo coverage is coming soon. Message us on WhatsApp, or book Chiang Mai today.",
    seoTitle: "In-room massage Bangkok — coming soon | RoomSpa",
    seoDescription:
      "RoomSpa mobile massage is expanding to Bangkok. Message WhatsApp for updates, or book Chiang Mai now.",
    neighborhoods: [
      { slug: "sukhumvit", name: "Sukhumvit", summary: "Hotel & condo coverage coming soon." },
      { slug: "silom", name: "Silom / Sathorn", summary: "Business-district coverage coming soon." },
    ],
  },
  {
    slug: "phuket",
    name: "Phuket",
    status: "coming_soon",
    headline: "In-room massage in Phuket — coming soon",
    summary:
      "Resort and villa in-room massage is coming soon. WhatsApp us for updates, or book Chiang Mai today.",
    seoTitle: "In-room massage Phuket — coming soon | RoomSpa",
    seoDescription:
      "RoomSpa is expanding mobile massage to Phuket. Message WhatsApp for updates.",
    neighborhoods: [
      { slug: "patong", name: "Patong", summary: "Resort coverage coming soon." },
      { slug: "rawai", name: "Rawai / Nai Harn", summary: "Villa coverage coming soon." },
    ],
  },
];

export function getCity(slug: string) {
  return cities.find((city) => city.slug === slug);
}

export function getActiveCities() {
  return cities.filter((city) => city.status === "active");
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
