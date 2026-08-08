export const BLOG_CATEGORIES = [
  {
    slug: "booking-hotels",
    name: "Booking & hotels",
    description: "Articles on outcall booking, hotel stays, pricing, and evening sessions.",
  },
  {
    slug: "treatments",
    name: "Treatments & techniques",
    description: "Articles on Thai, oil, deep tissue, couples, and recovery bodywork.",
  },
  {
    slug: "wellness-travel",
    name: "Wellness & travel",
    description: "Articles for travelers and nomads who book massage on the road.",
  },
  {
    slug: "areas",
    name: "Chiang Mai areas",
    description: "Articles on neighborhoods where in-room massage works best.",
  },
  {
    slug: "sensual-consent",
    name: "Sensual & consent",
    description: "Articles on consent-led sensual and tantric bodywork.",
  },
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];

export function getBlogCategory(slug: string) {
  return BLOG_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return BLOG_CATEGORIES.some((category) => category.slug === value);
}

export function slugifyBlogTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Split admin body text into display paragraphs. */
export function splitBlogBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function joinBlogBody(paragraphs: string[]): string {
  return paragraphs.map((p) => p.trim()).filter(Boolean).join("\n\n");
}
