import { notFound, permanentRedirect } from "next/navigation";
import { getCatalogProduct } from "@/content/services";
import { getPublicCatalogProduct } from "@/lib/catalog/public";
import { getServiceLocationPath } from "@/lib/catalog/service-paths";
import { getSeoLocation } from "@/lib/seo/locations";

type PageProps = {
  params: Promise<{ slug: string; location: string }>;
};

export const revalidate = 60;

/** Legacy flat location URLs → /services/{tier}/{slug}/{location} */
export default async function LegacyServiceLocationRedirectPage({ params }: PageProps) {
  const { slug, location: locationSlug } = await params;
  const service = (await getPublicCatalogProduct(slug)) ?? getCatalogProduct(slug);
  const location = getSeoLocation(locationSlug);
  if (!service?.bookable || !location) notFound();
  permanentRedirect(getServiceLocationPath(service, location.slug));
}
