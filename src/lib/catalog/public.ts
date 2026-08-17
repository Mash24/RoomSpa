import {
  catalogServices,
  isSignatureExperience,
  type CatalogService,
  type ServiceCategoryId,
} from "@/content/services";
import { filterSignatureCatalog } from "@/lib/catalog/signature";
import { filterWellnessCatalog } from "@/lib/catalog/wellness";
import {
  buildPriceTiers,
  DURATION_TIERS,
  type DurationMinutes,
} from "@/lib/catalog/prices";
import type { BookStripTreatment } from "@/lib/catalog/book-strip-types";
import { createAdminishAnonClient } from "@/lib/supabase/anon";

type DbService = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  details: string | null;
  category: string | null;
  duration_minutes: number | null;
  duration_label: string | null;
  price_thb: number | null;
  featured: boolean | null;
  bookable: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
};

type DbPrice = {
  service_id: string;
  duration_minutes: number;
  price_thb: number;
  is_active: boolean | null;
};

function isCategory(value: string | null | undefined): value is ServiceCategoryId {
  return value === "classic" || value === "therapeutic" || value === "shared" || value === "sensual";
}

function fallbackBySlug(slug: string) {
  return catalogServices.find((service) => service.slug === slug);
}

function mapService(row: DbService, priceRows: DbPrice[]): CatalogService {
  const fallback = fallbackBySlug(row.slug);
  const derived = buildPriceTiers(Number(row.price_thb ?? fallback?.amountThb ?? 0));
  const tiers: Partial<Record<DurationMinutes, number>> = {};

  for (const minutes of DURATION_TIERS) {
    const found = priceRows.find(
      (price) => price.duration_minutes === minutes && price.is_active !== false,
    );
    tiers[minutes] = found ? Number(found.price_thb) : derived[minutes];
  }

  const amountThb = Number(tiers[60] ?? row.price_thb ?? fallback?.amountThb ?? 0);

  return {
    slug: row.slug,
    name: row.name || fallback?.name || row.slug,
    summary: (row.summary || fallback?.summary || "").trim(),
    details: (row.details || fallback?.details || "").trim(),
    duration: row.duration_label || fallback?.duration || "60 / 90 / 120 min",
    durationMinutes: 60,
    amountThb,
    priceTiers: {
      60: Number(tiers[60] ?? amountThb),
      90: Number(tiers[90] ?? derived[90]),
      120: Number(tiers[120] ?? derived[120]),
    },
    category: (() => {
      const dbCat = isCategory(row.category) ? row.category : null;
      const staticCat = fallback?.category;
      // Static catalog wins for known signature slugs when DB category was not migrated yet.
      if (staticCat === "sensual" && dbCat !== "sensual") return "sensual";
      return dbCat ?? staticCat ?? "classic";
    })(),
    featured: Boolean(row.featured ?? fallback?.featured),
    bookable: row.bookable !== false,
  };
}

/** Active + bookable services from Supabase CMS. Falls back to static catalog if DB is empty. */
export async function getPublicCatalog(): Promise<CatalogService[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data: rows, error } = await supabase
      .from("services")
      .select(
        "id, slug, name, summary, details, category, duration_minutes, duration_label, price_thb, featured, bookable, is_active, sort_order",
      )
      .eq("is_active", true)
      .eq("bookable", true)
      .order("sort_order", { ascending: true });

    if (error || !rows?.length) {
      return catalogServices.filter((service) => service.bookable);
    }

    const ids = rows.map((row) => row.id as string);
    const { data: priceRows } = await supabase
      .from("service_prices")
      .select("service_id, duration_minutes, price_thb, is_active")
      .in("service_id", ids)
      .eq("is_active", true);

    const byService = new Map<string, DbPrice[]>();
    for (const price of (priceRows || []) as DbPrice[]) {
      const list = byService.get(price.service_id) || [];
      list.push(price);
      byService.set(price.service_id, list);
    }

    return (rows as DbService[]).map((row) => mapService(row, byService.get(row.id) || []));
  } catch {
    return catalogServices.filter((service) => service.bookable);
  }
}

export async function getPublicCatalogProduct(slug: string) {
  const catalog = await getPublicCatalog();
  return catalog.find((service) => service.slug === slug) ?? null;
}

function uniqueBySlug(services: CatalogService[]) {
  const seen = new Set<string>();
  const out: CatalogService[] = [];
  for (const service of services) {
    if (seen.has(service.slug)) continue;
    seen.add(service.slug);
    out.push(service);
  }
  return out;
}

/**
 * Signature-only services for homepage & signature zone — never backfills with wellness.
 */
export async function getPublicSignatureServices(limit = 6) {
  const catalog = await getPublicCatalog();
  const signature = filterSignatureCatalog(catalog);
  const featured = signature.filter((service) => service.featured);
  const rest = signature.filter((service) => !service.featured);
  return uniqueBySlug([...featured, ...rest]).slice(0, limit);
}

/** @deprecated Use getPublicSignatureServices */
export async function getPublicSensualServices(limit = 6) {
  return getPublicSignatureServices(limit);
}

/** @deprecated Prefer getPublicSignatureServices */
export async function getPublicFeaturedServices(limit = 6) {
  return getPublicSignatureServices(limit);
}

/** Wellness-only services — never includes signature experiences. */
export async function getPublicWellnessServices(limit = 12) {
  const catalog = await getPublicCatalog();
  const wellness = filterWellnessCatalog(catalog);
  const featured = wellness.filter((service) => service.featured);
  const rest = wellness.filter((service) => !service.featured);
  return uniqueBySlug([...featured, ...rest]).slice(0, limit);
}

export type { BookStripTreatment } from "@/lib/catalog/book-strip-types";

/** Homepage book strip — signature treatments first, then wellness (separate optgroups). */
export async function getBookStripTreatments(): Promise<BookStripTreatment[]> {
  const catalog = await getPublicCatalog();
  const signature = filterSignatureCatalog(catalog);
  const wellness = filterWellnessCatalog(catalog);
  return [...signature, ...wellness].map((service) => ({
    label: service.name,
    slug: service.slug,
    tier: isSignatureExperience(service) ? ("signature" as const) : ("wellness" as const),
  }));
}

export async function getPublicServicesByCategory(category: ServiceCategoryId) {
  const catalog = await getPublicCatalog();
  return catalog.filter((service) => service.category === category);
}
