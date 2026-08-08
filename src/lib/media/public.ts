import { createAdminishAnonClient } from "@/lib/supabase/anon";

export type PublicMediaItem = {
  id: string;
  kind: "image" | "video";
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  serviceSlugs: string[];
  serviceNames: string[];
};

function mapRow(
  row: {
    id: string;
    kind: string;
    title: string;
    description: string | null;
    media_url: string;
    thumbnail_url: string | null;
  },
  serviceSlugs: string[],
  serviceNames: string[],
): PublicMediaItem {
  return {
    id: row.id,
    kind: row.kind === "image" ? "image" : "video",
    title: row.title,
    description: row.description || "",
    mediaUrl: row.media_url,
    thumbnailUrl: row.thumbnail_url,
    serviceSlugs,
    serviceNames,
  };
}

/** Published media linked to a service slug. */
export async function getPublishedMediaForServiceSlug(slug: string): Promise<PublicMediaItem[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data: service } = await supabase
      .from("services")
      .select("id, name, slug")
      .eq("slug", slug)
      .maybeSingle();
    if (!service?.id) return [];

    const { data: links } = await supabase
      .from("media_services")
      .select("media_id")
      .eq("service_id", service.id);
    const ids = (links || []).map((l) => l.media_id);
    if (!ids.length) return [];

    const { data: rows } = await supabase
      .from("media_assets")
      .select("id, kind, title, description, media_url, thumbnail_url, status, sort_order")
      .in("id", ids)
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    return (rows || []).map((row) =>
      mapRow(row, [service.slug], [service.name || service.slug]),
    );
  } catch {
    return [];
  }
}

/** All published gallery media with service labels. */
export async function getPublishedGalleryMedia(): Promise<PublicMediaItem[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data: rows, error } = await supabase
      .from("media_assets")
      .select("id, kind, title, description, media_url, thumbnail_url, status, sort_order, created_at")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !rows?.length) return [];

    const ids = rows.map((row) => row.id);
    const [{ data: links }, { data: services }] = await Promise.all([
      supabase.from("media_services").select("media_id, service_id").in("media_id", ids),
      supabase.from("services").select("id, slug, name").eq("is_active", true),
    ]);

    const serviceById = new Map((services || []).map((s) => [s.id, s]));
    const byMedia = new Map<string, { slugs: string[]; names: string[] }>();
    for (const link of links || []) {
      const service = serviceById.get(link.service_id);
      if (!service) continue;
      const entry = byMedia.get(link.media_id) || { slugs: [], names: [] };
      entry.slugs.push(service.slug);
      entry.names.push(service.name || service.slug);
      byMedia.set(link.media_id, entry);
    }

    return rows.map((row) => {
      const linked = byMedia.get(row.id) || { slugs: [], names: [] };
      return mapRow(row, linked.slugs, linked.names);
    });
  } catch {
    return [];
  }
}
