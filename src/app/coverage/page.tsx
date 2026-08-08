import type { Metadata } from "next";
import Link from "next/link";
import { coverageAreas } from "@/content/coverage";
import { formatThb } from "@/lib/currency";
import { whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Coverage | Chiang Mai hotel & condo massage zones",
  description:
    "RoomSpa mobile massage coverage in Chiang Mai — Old City, Nimman, and Airport / Hang Dong. Travel fees and booking.",
  path: "/coverage",
});

export default function CoveragePage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Coverage</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Where we come to you
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Hotels, condos, and homes across these Chiang Mai areas. See also{" "}
        <Link href="/city/chiang-mai" className="text-accent underline">
          Chiang Mai
        </Link>
        .
      </p>

      <ul className="mt-12 space-y-4">
        {coverageAreas.map((area) => (
          <li key={area.slug} className="border border-border bg-surface-elevated p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl text-foreground">{area.name}</h2>
              <span className="text-sm text-muted">{area.city}</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              {area.travelFeeThb === 0
                ? "No extra travel fee"
                : `Travel fee from ${formatThb(area.travelFeeThb)}`}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Outside these areas?{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          WhatsApp us
        </a>{" "}
        with your hotel or neighborhood.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/book"
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Book now
        </Link>
        <Link
          href="/city"
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm transition hover:border-accent hover:text-accent"
        >
          All cities
        </Link>
      </div>
    </section>
  );
}
