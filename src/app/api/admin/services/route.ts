import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { buildPriceTiers, DURATION_TIERS } from "@/lib/catalog/prices";
import type { AdminServiceRow } from "@/lib/admin/cms-types";

function mapService(row: Record<string, unknown>, prices: AdminServiceRow["prices"]): AdminServiceRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    summary: String(row.summary ?? ""),
    details: String(row.details ?? ""),
    category: (row.category as AdminServiceRow["category"]) || "classic",
    durationMinutes: Number(row.duration_minutes ?? 60),
    durationLabel: String(row.duration_label ?? ""),
    priceThb: Number(row.price_thb ?? 0),
    featured: Boolean(row.featured),
    bookable: row.bookable !== false,
    isActive: row.is_active !== false,
    sortOrder: Number(row.sort_order ?? 0),
    imageUrl: (row.image_url as string | null) ?? null,
    seoTitle: (row.seo_title as string | null) ?? null,
    seoDescription: (row.seo_description as string | null) ?? null,
    prices,
  };
}

export async function GET() {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select(
      "id, slug, name, summary, details, category, duration_minutes, duration_label, price_thb, featured, bookable, is_active, sort_order, image_url, seo_title, seo_description",
    )
    .order("sort_order", { ascending: true });

  if (servicesError) {
    return NextResponse.json(
      {
        error:
          servicesError.message.includes("category") || servicesError.message.includes("details")
            ? "CMS columns missing. Run supabase/migrations/20260808_cms_services_media.sql"
            : servicesError.message,
      },
      { status: 400 },
    );
  }

  const ids = (services || []).map((s) => s.id);
  const { data: priceRows } = ids.length
    ? await supabase.from("service_prices").select("*").in("service_id", ids)
    : { data: [] as Record<string, unknown>[] };

  const byService = new Map<string, AdminServiceRow["prices"]>();
  for (const row of priceRows || []) {
    const sid = String(row.service_id);
    const list = byService.get(sid) || [];
    list.push({
      durationMinutes: Number(row.duration_minutes) as 60 | 90 | 120,
      priceThb: Number(row.price_thb),
      isActive: row.is_active !== false,
    });
    byService.set(sid, list);
  }

  const mapped = (services || []).map((row) => {
    const existing = byService.get(row.id) || [];
    const tiers = buildPriceTiers(Number(row.price_thb || 0));
    const prices = DURATION_TIERS.map((minutes) => {
      const found = existing.find((p) => p.durationMinutes === minutes);
      return (
        found || {
          durationMinutes: minutes,
          priceThb: tiers[minutes],
          isActive: true,
        }
      );
    });
    return mapService(row as Record<string, unknown>, prices);
  });

  return NextResponse.json({ services: mapped });
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  const price60 = Number(body.price60 ?? body.priceThb ?? 0);
  const tiers = {
    60: price60,
    90: Number(body.price90 ?? buildPriceTiers(price60)[90]),
    120: Number(body.price120 ?? buildPriceTiers(price60)[120]),
  };

  const { data: service, error: insertError } = await supabase
    .from("services")
    .insert({
      slug: String(body.slug).trim().toLowerCase(),
      name: String(body.name).trim(),
      summary: String(body.summary || "").trim(),
      details: String(body.details || "").trim(),
      category: body.category || "classic",
      duration_minutes: 60,
      duration_label: "60 / 90 / 120 min",
      price_thb: tiers[60],
      featured: Boolean(body.featured),
      bookable: body.bookable !== false,
      is_active: body.isActive !== false,
      sort_order: Number(body.sortOrder ?? 100),
      image_url: body.imageUrl || null,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
    })
    .select("id")
    .single();

  if (insertError || !service) {
    return NextResponse.json({ error: insertError?.message || "Could not create service." }, { status: 400 });
  }

  const priceRows = DURATION_TIERS.map((minutes) => ({
    service_id: service.id,
    duration_minutes: minutes,
    price_thb: tiers[minutes],
    is_active: true,
  }));

  const { error: priceError } = await supabase.from("service_prices").upsert(priceRows, {
    onConflict: "service_id,duration_minutes",
  });

  if (priceError) {
    return NextResponse.json({ error: priceError.message }, { status: 400 });
  }

  return NextResponse.json({ id: service.id }, { status: 201 });
}
