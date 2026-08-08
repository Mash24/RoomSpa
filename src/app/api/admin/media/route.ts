import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { AdminMediaRow } from "@/lib/admin/cms-types";

function mapMedia(
  row: Record<string, unknown>,
  serviceIds: string[],
  serviceSlugs: string[],
  locationSlugs: string[],
): AdminMediaRow {
  return {
    id: String(row.id),
    kind: row.kind === "image" ? "image" : "video",
    title: String(row.title),
    description: String(row.description ?? ""),
    mediaUrl: String(row.media_url),
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    status: (row.status as AdminMediaRow["status"]) || "published",
    featured: Boolean(row.featured),
    showOnHomepage: Boolean(row.show_on_homepage),
    sortOrder: Number(row.sort_order ?? 0),
    serviceIds,
    serviceSlugs,
    locationSlugs,
  };
}

export async function GET() {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: media, error: mediaError } = await supabase
    .from("media_assets")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (mediaError) {
    return NextResponse.json(
      {
        error: mediaError.message.includes("media_assets")
          ? "Media tables missing. Run supabase/migrations/20260808_cms_services_media.sql"
          : mediaError.message,
      },
      { status: 400 },
    );
  }

  const ids = (media || []).map((m) => m.id);
  const [{ data: links }, { data: locations }, { data: services }] = await Promise.all([
    ids.length
      ? supabase.from("media_services").select("media_id, service_id").in("media_id", ids)
      : Promise.resolve({ data: [] as { media_id: string; service_id: string }[] }),
    ids.length
      ? supabase.from("media_locations").select("media_id, location_slug").in("media_id", ids)
      : Promise.resolve({ data: [] as { media_id: string; location_slug: string }[] }),
    supabase.from("services").select("id, slug, name"),
  ]);

  const slugById = new Map((services || []).map((s) => [s.id, s.slug]));
  const serviceIdsByMedia = new Map<string, string[]>();
  for (const link of links || []) {
    const list = serviceIdsByMedia.get(link.media_id) || [];
    list.push(link.service_id);
    serviceIdsByMedia.set(link.media_id, list);
  }
  const locsByMedia = new Map<string, string[]>();
  for (const loc of locations || []) {
    const list = locsByMedia.get(loc.media_id) || [];
    list.push(loc.location_slug);
    locsByMedia.set(loc.media_id, list);
  }

  const mapped = (media || []).map((row) => {
    const serviceIds = serviceIdsByMedia.get(row.id) || [];
    return mapMedia(
      row as Record<string, unknown>,
      serviceIds,
      serviceIds.map((id) => slugById.get(id) || id),
      locsByMedia.get(row.id) || [],
    );
  });

  return NextResponse.json({ media: mapped, services: services || [] });
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.mediaUrl) {
    return NextResponse.json({ error: "Title and media URL are required." }, { status: 400 });
  }

  const { data: asset, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      kind: body.kind === "image" ? "image" : "video",
      title: String(body.title).trim(),
      description: String(body.description || "").trim(),
      media_url: String(body.mediaUrl).trim(),
      thumbnail_url: body.thumbnailUrl || null,
      status: body.status || "published",
      featured: Boolean(body.featured),
      show_on_homepage: Boolean(body.showOnHomepage),
      sort_order: Number(body.sortOrder ?? 0),
    })
    .select("id")
    .single();

  if (insertError || !asset) {
    return NextResponse.json({ error: insertError?.message || "Could not create media." }, { status: 400 });
  }

  const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds.filter(Boolean) : [];
  if (serviceIds.length) {
    await supabase.from("media_services").insert(
      serviceIds.map((serviceId: string) => ({ media_id: asset.id, service_id: serviceId })),
    );
  }

  const locationSlugs = Array.isArray(body.locationSlugs)
    ? body.locationSlugs.filter(Boolean)
    : [];
  if (locationSlugs.length) {
    await supabase.from("media_locations").insert(
      locationSlugs.map((location_slug: string) => ({ media_id: asset.id, location_slug })),
    );
  }

  return NextResponse.json({ id: asset.id }, { status: 201 });
}
