import type { Metadata } from "next";
import Link from "next/link";
import { TherapistsDirectory } from "@/components/therapists/therapists-directory";
import { getPublicTherapists } from "@/lib/therapists/public";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";

export const revalidate = 60;

const THERAPIST_LOAD_TIMEOUT_MS = 5000;

async function loadTherapistsForGallery() {
  try {
    return await Promise.race([
      getPublicTherapists({}),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Therapist directory timed out")), THERAPIST_LOAD_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return [];
  }
}

export const metadata: Metadata = buildPageMetadata({
  title: "Meet Your RoomSpa Therapists",
  description:
    "Meet the therapists behind RoomSpa — carefully selected for private experiences at your hotel, residence, or villa.",
  path: "/therapists",
});

export default async function TherapistsPage() {
  const therapists = await loadTherapistsForGallery();

  return (
    <div className="therapist-gallery-shell min-h-screen">
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 xs:px-5 md:px-8 md:pb-28 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#C8A96B]">RoomSpa</p>
        <h1 className="mt-5 max-w-3xl font-display text-[2.35rem] leading-[1.05] tracking-tight text-[#F5F1E8] xs:text-5xl md:text-6xl">
          Our therapists
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#B8B0A3] md:text-lg">
          Meet the therapists who bring private in-room massage to your hotel, condo, or villa —
          selected with care for a calm experience wherever you’re staying.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/book"
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#C8A96B] px-5 py-3 text-sm font-medium text-[#11100F] transition hover:bg-[#D4B87A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A96B]"
          >
            Request a booking →
          </Link>
          <WhatsAppLink
            cta="therapists-intro"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[rgba(200,169,107,0.35)] px-5 py-3 text-sm text-[#F5F1E8] transition hover:border-[#C8A96B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A96B]"
          >
            WhatsApp
          </WhatsAppLink>
        </div>

        <div className="mt-10 md:mt-12">
          <TherapistsDirectory initialTherapists={therapists} galleryMode />
        </div>

        <div className="mt-20 border-t border-[rgba(200,169,107,0.16)] pt-10 md:mt-28 md:pt-12">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C8A96B]">
              Not sure who to choose?
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-tight text-[#F5F1E8] md:text-4xl">
              We can make the introduction.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#B8B0A3]">
              Tell us where you’re staying and when. We’ll help you find a thoughtful match.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#C8A96B] px-5 py-3 text-sm font-medium text-[#11100F] transition hover:bg-[#D4B87A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A96B]"
            >
              Request a booking →
            </Link>
            <WhatsAppLink
              cta="therapists"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[rgba(200,169,107,0.35)] px-5 py-3 text-sm text-[#F5F1E8] transition hover:border-[#C8A96B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A96B]"
            >
              WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
