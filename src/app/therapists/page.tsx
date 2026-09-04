import type { Metadata } from "next";
import Link from "next/link";
import { TherapistsDirectory } from "@/components/therapists/therapists-directory";
import { getPublicTherapists } from "@/lib/therapists/public";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Meet Your RoomSpa Therapists",
  description:
    "Meet the therapists behind RoomSpa — carefully selected for private experiences at your hotel, residence, or villa.",
  path: "/therapists",
  noIndex: true,
});

export default async function TherapistsPage() {
  const therapists = await getPublicTherapists({});

  return (
    <div className="therapist-gallery-shell min-h-screen">
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 xs:px-5 md:px-8 md:pb-28 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#C8A96B]">RoomSpa</p>
        <h1 className="mt-5 max-w-3xl font-display text-[2.35rem] leading-[1.05] tracking-tight text-[#F5F1E8] xs:text-5xl md:text-6xl">
          Our therapists
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#B8B0A3] md:text-lg">
          The people who make RoomSpa feel personal — selected with care for quiet, private sessions
          wherever you’re staying.
        </p>

        <div className="mt-14 md:mt-16">
          <TherapistsDirectory initialTherapists={therapists} galleryMode />
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[rgba(200,169,107,0.16)] pt-8">
          <Link
            href="/book"
            className="text-sm font-medium text-[#C8A96B] underline-offset-4 hover:underline"
          >
            Request a booking →
          </Link>
          <WhatsAppLink cta="therapists" className="text-sm text-[#B8B0A3] hover:text-[#C8A96B]">
            WhatsApp
          </WhatsAppLink>
        </div>
      </section>
    </div>
  );
}
