import type { ServiceCategoryId } from "@/content/services";
import type { DurationMinutes } from "@/lib/catalog/prices";

export type AdminServicePrice = {
  durationMinutes: DurationMinutes;
  priceThb: number;
  isActive: boolean;
};

export type AdminServiceRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  details: string;
  category: ServiceCategoryId;
  durationMinutes: number;
  durationLabel: string;
  priceThb: number;
  featured: boolean;
  bookable: boolean;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  prices: AdminServicePrice[];
};

export type AdminMediaRow = {
  id: string;
  kind: "image" | "video";
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  status: "draft" | "published" | "hidden";
  featured: boolean;
  showOnHomepage: boolean;
  sortOrder: number;
  serviceIds: string[];
  serviceSlugs: string[];
  locationSlugs: string[];
};
