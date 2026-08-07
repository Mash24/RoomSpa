import type { Metadata } from "next";
import { site } from "@/content/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  /** Absolute or site-relative image path */
  image?: string;
  noIndex?: boolean;
};

/** Consistent titles, descriptions, canonicals, and social previews. */
export function buildPageMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = `${site.url.replace(/\/$/, "")}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${site.url.replace(/\/$/, "")}${image.startsWith("/") ? image : `/${image}`}`
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
  };
}
