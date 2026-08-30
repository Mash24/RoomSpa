import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { therapistStatusFlags } from "@/lib/therapists/status";
import type { AdminTherapistRow, PublicTherapistMedia } from "@/lib/therapists/types";

function mapMedia(row: Record<string, unknown>): PublicTherapistMedia {
  return {
    id: String(row.id),
    url: String(row.url ?? row.photo_url),
    type: row.media_type === "video" ? "video" : "photo",
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    altText: row.alt_text ? String(row.alt_text) : null,
    isPrimary: Boolean(row.is_primary),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapRow(
  row: Record<string, unknown>,
  media: PublicTherapistMedia[],
  serviceIds: string[],
  serviceSlugs: string[],
  serviceAreaIds: string[],
  serviceAreaSlugs: string[],
  location: AdminTherapistRow["location"],
): AdminTherapistRow {
  const status = (row.status as AdminTherapistRow["status"]) || "active";
  return {
    id: String(row.id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    gender: (row.gender as AdminTherapistRow["gender"]) || "unspecified",
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth) : null,
    heightCm: row.height_cm != null ? Number(row.height_cm) : null,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
    nationality: row.nationality ? String(row.nationality) : null,
    ethnicity: row.ethnicity ? String(row.ethnicity) : null,
    bio: String(row.bio ?? ""),
    status,
    verified: Boolean(row.verified),
    showAge: row.show_age !== false,
    showHeight: Boolean(row.show_height),
    showWeight: Boolean(row.show_weight),
    showEthnicity: Boolean(row.show_ethnicity),
    showNationality: Boolean(row.show_nationality),
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    location,
    media,
    serviceIds,
    serviceSlugs,
    serviceAreaIds,
    serviceAreaSlugs,
  };
}

async function mediaTable(supabase: NonNullable<Awaited<ReturnType<typeof requireAdminSession>>["supabase"]>) {
  const probe = await supabase.from("therapist_media").select("id").limit(1);
  return probe.error ? "therapist_photos" : "therapist_media";
}

async function serviceAreasTable(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAdminSession>>["supabase"]>,
) {
  const probe = await supabase.from("therapist_service_areas").select("therapist_id").limit(1);
  return probe.error ? "therapist_coverage" : "therapist_service_areas";
}

export async function GET() {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mediaTbl = await mediaTable(supabase);
  const areasTbl = await serviceAreasTable(supabase);

  const { data: rows, error: listError } = await supabase
    .from("therapists")
    .select("*")
    .order("sort_order", { ascending: true });

  if (listError) {
    return NextResponse.json(
      {
        error: listError.message.includes("therapists")
          ? "Therapists table missing. Run supabase/migrations/20260818_therapists.sql"
          : listError.message,
      },
      { status: 400 },
    );
  }

  const ids = (rows || []).map((r) => r.id as string);
  const [mediaRes, servicesRes, areasRes, locationsRes, allServices, allCoverage] = await Promise.all([
    ids.length ? supabase.from(mediaTbl).select("*").in("therapist_id", ids) : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("therapist_services").select("therapist_id, service_id, services(slug)").in("therapist_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from(areasTbl).select("therapist_id, coverage_area_id, coverage_areas(slug)").in("therapist_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("therapist_locations").select("*").in("therapist_id", ids)
      : Promise.resolve({ data: [] }),
    supabase.from("services").select("id, slug, name").order("sort_order"),
    supabase.from("coverage_areas").select("id, slug, name").eq("is_active", true),
  ]);

  const mapped = (rows || []).map((row) => {
    const tid = row.id as string;
    const media = (mediaRes.data || [])
      .filter((p) => p.therapist_id === tid)
      .map((p) => mapMedia(p as Record<string, unknown>));
    const svcRows = (servicesRes.data || []).filter((s) => s.therapist_id === tid);
    const areaRows = (areasRes.data || []).filter((c) => c.therapist_id === tid);
    const locRow = (locationsRes.data || []).find((l) => l.therapist_id === tid) as Record<string, unknown> | undefined;

    const location: AdminTherapistRow["location"] = locRow
      ? {
          city: String(locRow.city ?? row.city ?? ""),
          country: String(locRow.country ?? row.country ?? ""),
          region: String(locRow.region ?? ""),
          latitude: Number(locRow.latitude ?? row.latitude ?? 18.7883),
          longitude: Number(locRow.longitude ?? row.longitude ?? 98.9853),
          serviceRadiusKm: Number(locRow.service_radius_km ?? row.service_radius_km ?? 12),
          publicAreaSummary: String(locRow.public_area_summary ?? row.area_label ?? ""),
        }
      : row.latitude != null
        ? {
            city: String(row.city ?? ""),
            country: String(row.country ?? ""),
            region: "",
            latitude: Number(row.latitude),
            longitude: Number(row.longitude ?? 98.9853),
            serviceRadiusKm: Number(row.service_radius_km ?? 12),
            publicAreaSummary: String(row.area_label ?? ""),
          }
        : null;

    return mapRow(
      row as Record<string, unknown>,
      media,
      svcRows.map((s) => String(s.service_id)),
      svcRows
        .map((s) => {
          const svc = s.services as { slug: string } | { slug: string }[];
          return Array.isArray(svc) ? svc[0]?.slug : svc?.slug;
        })
        .filter(Boolean) as string[],
      areaRows.map((c) => String(c.coverage_area_id)),
      areaRows
        .map((c) => {
          const area = c.coverage_areas as { slug: string } | { slug: string }[];
          return Array.isArray(area) ? area[0]?.slug : area?.slug;
        })
        .filter(Boolean) as string[],
      location,
    );
  });

  return NextResponse.json({
    therapists: mapped,
    services: allServices.data || [],
    coverageAreas: allCoverage.data || [],
  });
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.displayName || !body?.slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  const status = body.status || (body.isActive === false ? "inactive" : "active");
  const statusFlags = therapistStatusFlags(status);

  const { data: therapist, error: insertError } = await supabase
    .from("therapists")
    .insert({
      slug: String(body.slug).trim().toLowerCase(),
      display_name: String(body.displayName).trim(),
      gender: body.gender || "unspecified",
      date_of_birth: body.dateOfBirth || null,
      height_cm: body.heightCm != null && body.heightCm !== "" ? Number(body.heightCm) : null,
      weight_kg: body.weightKg != null && body.weightKg !== "" ? Number(body.weightKg) : null,
      nationality: body.nationality || null,
      ethnicity: body.ethnicity || null,
      bio: String(body.bio || ""),
      status,
      verified: Boolean(body.verified),
      show_age: body.showAge !== false,
      show_height: Boolean(body.showHeight),
      show_weight: Boolean(body.showWeight),
      show_ethnicity: Boolean(body.showEthnicity),
      show_nationality: Boolean(body.showNationality),
      is_active: statusFlags.is_active,
      is_bookable: statusFlags.is_bookable,
      featured: Boolean(body.featured),
      sort_order: Number(body.sortOrder ?? 100),
    })
    .select("id")
    .single();

  if (insertError || !therapist) {
    return NextResponse.json({ error: insertError?.message || "Could not create therapist." }, { status: 400 });
  }

  const relationError = await syncRelations(supabase, therapist.id, body);
  if (relationError) {
    return NextResponse.json({ error: relationError }, { status: 400 });
  }

  return NextResponse.json({ id: therapist.id }, { status: 201 });
}

async function syncLocation(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAdminSession>>["supabase"]>,
  therapistId: string,
  body: Record<string, unknown>,
) {
  const loc = body.location as Record<string, unknown> | undefined;
  if (!loc) return;

  const hasCoords = loc.latitude != null && loc.longitude != null && loc.latitude !== "" && loc.longitude !== "";
  const textFields = {
    city: String(loc.city || ""),
    country: String(loc.country || ""),
    region: String(loc.region || ""),
    public_area_summary: String(loc.publicAreaSummary || ""),
    active: true,
  };

  let latitude = hasCoords ? Number(loc.latitude) : 18.7883;
  let longitude = hasCoords ? Number(loc.longitude) : 98.9853;
  if (!hasCoords) {
    const { data: existing } = await supabase
      .from("therapist_locations")
      .select("latitude, longitude")
      .eq("therapist_id", therapistId)
      .maybeSingle();
    if (existing?.latitude != null && existing?.longitude != null) {
      latitude = Number(existing.latitude);
      longitude = Number(existing.longitude);
    }
  }

  const row = {
    therapist_id: therapistId,
    ...textFields,
    latitude,
    longitude,
    service_radius_km: Number(loc.serviceRadiusKm ?? 12),
  };

  const { error } = await supabase.from("therapist_locations").upsert(row, { onConflict: "therapist_id" });
  if (error) {
    await supabase.from("therapists").update({
      city: row.city,
      country: row.country,
      area_label: row.public_area_summary,
      latitude: row.latitude,
      longitude: row.longitude,
      service_radius_km: row.service_radius_km,
    }).eq("id", therapistId);
  }
}

export async function syncRelations(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAdminSession>>["supabase"]>,
  therapistId: string,
  body: Record<string, unknown>,
): Promise<string | null> {
  const mediaTbl = await mediaTable(supabase);
  const areasTbl = await serviceAreasTable(supabase);

  const photoUrls = (body.photoUrls as string[]) || (body.mediaUrls as string[]) || [];
  const mediaDelete = await supabase.from(mediaTbl).delete().eq("therapist_id", therapistId);
  if (mediaDelete.error) {
    return `Could not update therapist photos: ${mediaDelete.error.message}`;
  }
  if (photoUrls.length) {
    const payload = photoUrls.map((url, i) =>
      mediaTbl === "therapist_media"
        ? {
            therapist_id: therapistId,
            url,
            media_type: "photo",
            sort_order: i,
            is_primary: i === 0,
          }
        : {
            therapist_id: therapistId,
            photo_url: url,
            sort_order: i,
            is_primary: i === 0,
          },
    );
    const mediaInsert = await supabase.from(mediaTbl).insert(payload);
    if (mediaInsert.error) {
      return `Could not save therapist photos: ${mediaInsert.error.message}`;
    }
  }

  const serviceIds = (body.serviceIds as string[]) || [];
  const serviceDelete = await supabase.from("therapist_services").delete().eq("therapist_id", therapistId);
  if (serviceDelete.error) {
    return `Could not update therapist services: ${serviceDelete.error.message}`;
  }
  if (serviceIds.length) {
    const serviceInsert = await supabase.from("therapist_services").insert(
      serviceIds.map((service_id) => ({ therapist_id: therapistId, service_id, active: true })),
    );
    if (serviceInsert.error) {
      return `Could not save therapist services: ${serviceInsert.error.message}`;
    }
  }

  const serviceAreaIds = (body.serviceAreaIds as string[]) || (body.coverageAreaIds as string[]) || [];
  const areaDelete = await supabase.from(areasTbl).delete().eq("therapist_id", therapistId);
  if (areaDelete.error) {
    return `Could not update therapist service areas: ${areaDelete.error.message}`;
  }
  if (serviceAreaIds.length) {
    const areaInsert = await supabase.from(areasTbl).insert(
      serviceAreaIds.map((coverage_area_id) => ({
        therapist_id: therapistId,
        coverage_area_id,
        active: true,
      })),
    );
    if (areaInsert.error) {
      return `Could not save therapist service areas: ${areaInsert.error.message}`;
    }
  }

  await syncLocation(supabase, therapistId, body);
  return null;
}
