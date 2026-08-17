import { getServiceMedia, type ServiceMedia } from "@/content/service-media";
import { createAdminishAnonClient } from "@/lib/supabase/anon";

export type ServiceImageRow = {
  slug: string;
  imageUrl: string | null;
  imageHeroUrl: string | null;
  imageAlt: string | null;
  imageFocus: string | null;
};

export async function getServiceImageRows(): Promise<ServiceImageRow[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase
      .from("services")
      .select("slug, image_url, image_hero_url, image_alt, image_focus")
      .not("image_url", "is", null);

    if (error || !data?.length) return [];

    return data.map((row) => ({
      slug: String(row.slug),
      imageUrl: (row.image_url as string | null) ?? null,
      imageHeroUrl: (row.image_hero_url as string | null) ?? null,
      imageAlt: (row.image_alt as string | null) ?? null,
      imageFocus: (row.image_focus as string | null) ?? null,
    }));
  } catch {
    return [];
  }
}

export function buildServiceImageMap(rows: ServiceImageRow[]) {
  const map = new Map<string, ServiceImageRow>();
  for (const row of rows) {
    if (row.imageUrl) map.set(row.slug, row);
  }
  return map;
}

export function mergeServiceMedia(
  slug: string,
  override: ServiceImageRow | undefined,
  fallbackName?: string,
): ServiceMedia {
  const staticMedia = getServiceMedia(slug);

  if (!override?.imageUrl) {
    return staticMedia;
  }

  return {
    image: override.imageUrl,
    imageHero: override.imageHeroUrl || undefined,
    imageAlt:
      override.imageAlt?.trim() ||
      (fallbackName ? `${fallbackName} — RoomSpa in-room session` : staticMedia.imageAlt),
    imageFocus: override.imageFocus || "center center",
    imageFit: "cover",
    video: staticMedia.video,
  };
}

export async function resolveServiceMedia(
  slug: string,
  map?: Map<string, ServiceImageRow>,
  fallbackName?: string,
): Promise<ServiceMedia> {
  const imageMap = map ?? buildServiceImageMap(await getServiceImageRows());
  return mergeServiceMedia(slug, imageMap.get(slug), fallbackName);
}
