import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SensualZone } from "@/components/sensual/sensual-zone";
import { TherapistProfile } from "@/components/therapists/therapist-profile";
import { getTherapistProfileAccess } from "@/lib/therapists/public";
import { getPublicCatalog } from "@/lib/catalog/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const access = await getTherapistProfileAccess(slug);
  if (access.state === "missing") return { robots: { index: false, follow: true } };
  if (access.state === "unavailable") {
    return buildPageMetadata({
      title: `${access.displayName} | RoomSpa`,
      description: "This therapist profile is currently unavailable.",
      path: `/therapists/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: `${access.therapist.displayName} | RoomSpa therapist`,
    description: `${access.therapist.displayName} — ${access.therapist.serviceNames.join(", ")} in ${access.therapist.city}. ${access.therapist.bio.slice(0, 120)}`,
    path: `/therapists/${slug}`,
    noIndex: true,
  });
}

export default async function TherapistDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const access = await getTherapistProfileAccess(slug);
  if (access.state === "missing") notFound();

  if (access.state === "unavailable") {
    return (
      <div className="therapist-gallery-shell min-h-screen">
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C8A96B]">RoomSpa</p>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-[#F5F1E8]">
            {access.displayName}
          </h1>
          <p className="mt-4 text-base text-[#B8B0A3]">This profile is currently unavailable.</p>
          <Link href="/book" className="mt-8 inline-block text-sm font-medium text-[#C8A96B] hover:underline">
            Request a booking →
          </Link>
        </div>
      </div>
    );
  }

  const catalog = await getPublicCatalog();
  return (
    <div className="therapist-gallery-shell min-h-screen">
      <SensualZone>
        <TherapistProfile therapist={access.therapist} catalog={catalog} dark />
      </SensualZone>
    </div>
  );
}
