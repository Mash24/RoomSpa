import { notFound, permanentRedirect } from "next/navigation";
import { getPublicCatalogProduct } from "@/lib/catalog/public";
import { getServicePath } from "@/lib/catalog/service-paths";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

/** Legacy flat URLs → /services/{tier}/{slug} */
export default async function LegacyServiceRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getPublicCatalogProduct(slug);
  if (!service?.bookable) notFound();
  permanentRedirect(getServicePath(service));
}
