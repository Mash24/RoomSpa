import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TherapistsDirectory } from "@/components/therapists/therapists-directory";
import { getPublicCatalog } from "@/lib/catalog/public";
import { getPublicTherapists } from "@/lib/therapists/public";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Our therapists | Signature massage Thailand",
  description:
    "Meet RoomSpa therapists — view Signature and wellness services, locations, and book where therapists are live across Thailand.",
  path: "/therapists",
});

export default async function TherapistsPage() {
  const [therapists, catalog] = await Promise.all([getPublicTherapists({}), getPublicCatalog()]);

  const serviceOptions = catalog.map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Therapists" }]} />

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">Our team</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Meet our therapists
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Browse RoomSpa therapists by experience, service, and how close they are to where you are staying.
        Only therapists who offer your chosen service and cover your area appear — never a cross-city mismatch.
      </p>

      <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading filters…</p>}>
        <div className="mt-8">
          <TherapistsDirectory initialTherapists={therapists} serviceOptions={serviceOptions} />
        </div>
      </Suspense>

      <div className="mt-14 border-t border-border pt-8">
        <Link href="/book" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
          Ready to book? Choose service & therapist →
        </Link>
        <span className="mx-2 text-muted">·</span>
        <WhatsAppLink cta="therapists" className="text-sm text-muted hover:text-accent">
          WhatsApp
        </WhatsAppLink>
      </div>
    </section>
  );
}
