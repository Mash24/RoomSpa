import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SensualZone } from "@/components/sensual/sensual-zone";
import { TherapistProfile } from "@/components/therapists/therapist-profile";
import { getVisibleTherapistBySlug } from "@/lib/therapists/public";
import { getPublicCatalog } from "@/lib/catalog/public";
import { isSignatureExperience } from "@/lib/catalog/experience-tier";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const therapist = await getVisibleTherapistBySlug(slug);
  if (!therapist) return {};
  return buildPageMetadata({
    title: `${therapist.displayName} | RoomSpa therapist`,
    description: `${therapist.displayName} — ${therapist.serviceNames.join(", ")} in ${therapist.city}. ${therapist.bio.slice(0, 120)}`,
    path: `/therapists/${slug}`,
  });
}

export default async function TherapistDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const therapist = await getVisibleTherapistBySlug(slug);
  if (!therapist) notFound();

  const catalog = await getPublicCatalog();
  const dark = therapist.serviceSlugs.some((serviceSlug: string) => {
    const svc = catalog.find((c) => c.slug === serviceSlug);
    return svc && isSignatureExperience(svc);
  });

  const profile = <TherapistProfile therapist={therapist} catalog={catalog} dark={dark} />;
  return dark ? <SensualZone>{profile}</SensualZone> : profile;
}
