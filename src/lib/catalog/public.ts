import {
  catalogServices,
  isPrivateExperience,
  type CatalogService,
  type ServiceCategoryId,
} from "@/content/services";
import {
  buildPriceTiers,
  DURATION_TIERS,
  type DurationMinutes,
} from "@/lib/catalog/prices";
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
    category: isCategory(row.category) ? row.category : fallback?.category ?? "classic",
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
 * Featured services for homepage cards.
 * Private/sensual experiences always lead; CMS `featured` ranks within that set.
 * Wellness stays available but never crowds out the commercial focus.
 */
export async function getPublicFeaturedServices(limit = 6) {
  const catalog = await getPublicCatalog();
  const privateOnes = catalog.filter(isPrivateExperience);
  const privateFeatured = privateOnes.filter((service) => service.featured);
  const privateRest = privateOnes.filter((service) => !service.featured);
  const otherFeatured = catalog.filter(
    (service) => service.featured && !isPrivateExperience(service),
  );
  const otherRest = catalog.filter(
    (service) => !service.featured && !isPrivateExperience(service),
  );

  return uniqueBySlug([
    ...privateFeatured,
    ...privateRest,
    ...otherFeatured,
    ...otherRest,
  ]).slice(0, limit);
}

/** Treatments for the homepage book strip — private first, then wellness. */
export async function getBookStripTreatments() {
  const catalog = await getPublicCatalog();
  const privateOnes = catalog.filter(isPrivateExperience);
  const others = catalog.filter((service) => !isPrivateExperience(service));
  return [...privateOnes, ...others].map((service) => ({
    label: service.name,
    slug: service.slug,
  }));
}

export async function getPublicServicesByCategory(category: ServiceCategoryId) {
  const catalog = await getPublicCatalog();
  return catalog.filter((service) => service.category === category);
}
