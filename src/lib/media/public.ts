import { createAdminishAnonClient } from "@/lib/supabase/anon";

export type PublicMediaItem = {
  id: string;
  kind: "image" | "video";
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
};

/** Published media linked to a service slug (empty if CMS tables not migrated yet). */
export async function getPublishedMediaForServiceSlug(slug: string): Promise<PublicMediaItem[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data: service } = await supabase
      .from("services")
      .select("id")
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

    return (rows || []).map((row) => ({
      id: row.id,
      kind: row.kind === "image" ? "image" : "video",
      title: row.title,
      description: row.description || "",
      mediaUrl: row.media_url,
      thumbnailUrl: row.thumbnail_url,
    }));
  } catch {
    return [];
  }
}
