import Image from "next/image";
import type { ServiceMedia } from "@/content/service-media";

type Props = {
  media: ServiceMedia;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** `card` = grid/list thumbnail; `hero` = detail page (uses 16:10 crop when available) */
  variant?: "card" | "hero";
};

export function serviceDisplayImage(media: ServiceMedia, variant: "card" | "hero" = "card") {
  if (variant === "hero" && media.imageHero) return media.imageHero;
  return media.image;
}

export function ServiceImage({
  media,
  sizes,
  priority,
  className = "",
  variant = "card",
}: Props) {
  const fit = media.imageFit ?? "cover";
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  const src = serviceDisplayImage(media, variant);

  return (
    <Image
      src={src}
      alt={media.imageAlt}
      fill
      sizes={sizes}
      priority={priority}
      className={`${fitClass} ${className}`.trim()}
      style={
        fit === "cover" && media.imageFocus
          ? { objectPosition: media.imageFocus }
          : undefined
      }
    />
  );
}
