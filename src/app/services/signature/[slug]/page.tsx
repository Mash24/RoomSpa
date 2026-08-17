import type { Metadata } from "next";
import { catalogServices } from "@/content/services";
import { productPriceLabel } from "@/content/services";
import { ServiceDetailContent } from "@/components/services/service-detail-content";
import { getPublicCatalogProduct } from "@/lib/catalog/public";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getServicePath } from "@/lib/catalog/service-paths";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return catalogServices
    .filter((s) => s.bookable && s.category === "sensual")
    .map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublicCatalogProduct(slug);
  if (!service) return {};

  return buildPageMetadata({
    title: `${service.name} Chiang Mai | In-room mobile massage`,
    description: `${service.summary} Book ${service.name} at your hotel, condo, or home in Chiang Mai. From ${productPriceLabel(service.amountThb)}.`,
    path: getServicePath(service),
  });
}

export default async function SignatureServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <ServiceDetailContent slug={slug} expectedTier="signature" />;
}
