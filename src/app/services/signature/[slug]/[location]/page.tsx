import type { Metadata } from "next";
import { catalogServices } from "@/content/services";
import {
  ServiceLocationContent,
  buildServiceLocationMetadata,
} from "@/components/services/service-location-content";
import { getServiceLocationParams } from "@/lib/seo/locations";

type PageProps = {
  params: Promise<{ slug: string; location: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getServiceLocationParams().filter(({ slug }) => {
    const service = catalogServices.find((s) => s.slug === slug);
    return service?.category === "sensual";
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, location } = await params;
  return buildServiceLocationMetadata(slug, location);
}

export default async function SignatureServiceLocationPage({ params }: PageProps) {
  const { slug, location } = await params;
  return <ServiceLocationContent slug={slug} locationSlug={location} expectedTier="signature" />;
}
