import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

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
  if (body.title != null) patch.title = String(body.title).trim();
  if (body.description != null) patch.description = String(body.description).trim();
  if (body.mediaUrl != null) patch.media_url = String(body.mediaUrl).trim();
  if (body.thumbnailUrl !== undefined) patch.thumbnail_url = body.thumbnailUrl || null;
  if (body.kind != null) patch.kind = body.kind === "image" ? "image" : "video";
  if (body.status != null) patch.status = body.status;
  if (body.featured != null) patch.featured = Boolean(body.featured);
  if (body.showOnHomepage != null) patch.show_on_homepage = Boolean(body.showOnHomepage);
  if (body.sortOrder != null) patch.sort_order = Number(body.sortOrder);

  const { error: updateError } = await supabase.from("media_assets").update(patch).eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (Array.isArray(body.serviceIds)) {
    await supabase.from("media_services").delete().eq("media_id", id);
    if (body.serviceIds.length) {
      await supabase.from("media_services").insert(
        body.serviceIds.map((service_id: string) => ({ media_id: id, service_id })),
      );
    }
  }

  if (Array.isArray(body.locationSlugs)) {
    await supabase.from("media_locations").delete().eq("media_id", id);
    if (body.locationSlugs.length) {
      await supabase.from("media_locations").insert(
        body.locationSlugs.map((location_slug: string) => ({ media_id: id, location_slug })),
      );
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
  const { error: deleteError } = await supabase.from("media_assets").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
