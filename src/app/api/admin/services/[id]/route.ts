import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { buildPriceTiers, DURATION_TIERS } from "@/lib/catalog/prices";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name != null) patch.name = String(body.name).trim();
  if (body.slug != null) patch.slug = String(body.slug).trim().toLowerCase();
  if (body.summary != null) patch.summary = String(body.summary).trim();
  if (body.details != null) patch.details = String(body.details).trim();
  if (body.category != null) patch.category = body.category;
  if (body.featured != null) patch.featured = Boolean(body.featured);
  if (body.bookable != null) patch.bookable = Boolean(body.bookable);
  if (body.isActive != null) patch.is_active = Boolean(body.isActive);
  if (body.sortOrder != null) patch.sort_order = Number(body.sortOrder);
  if (body.imageUrl !== undefined) patch.image_url = body.imageUrl || null;
  if (body.seoTitle !== undefined) patch.seo_title = body.seoTitle || null;
  if (body.seoDescription !== undefined) patch.seo_description = body.seoDescription || null;
  if (body.durationLabel != null) patch.duration_label = String(body.durationLabel);

  const price60 = body.price60 != null ? Number(body.price60) : null;
  if (price60 != null) patch.price_thb = price60;

  const { error: updateError } = await supabase.from("services").update(patch).eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (body.price60 != null || body.price90 != null || body.price120 != null) {
    const base = Number(body.price60 ?? patch.price_thb ?? 0);
    const derived = buildPriceTiers(base);
    const tiers = {
      60: Number(body.price60 ?? derived[60]),
      90: Number(body.price90 ?? derived[90]),
      120: Number(body.price120 ?? derived[120]),
    };

    const rows = DURATION_TIERS.map((minutes) => ({
      service_id: id,
      duration_minutes: minutes,
      price_thb: tiers[minutes],
      is_active: true,
      updated_at: new Date().toISOString(),
    }));

    const { error: priceError } = await supabase.from("service_prices").upsert(rows, {
      onConflict: "service_id,duration_minutes",
    });
    if (priceError) {
      return NextResponse.json({ error: priceError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // Soft-delete: hide from public, keep history
  const { error: updateError } = await supabase
    .from("services")
    .update({ is_active: false, bookable: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
