import type { Metadata } from "next";
import Link from "next/link";
import { coverageAreas } from "@/content/coverage";
import { formatThb } from "@/lib/currency";
import { site, whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Coverage Area",
  description:
    "RoomSpa mobile massage coverage in Chiang Mai — Old City, Nimman, and Airport / Hang Dong.",
};

export default function CoveragePage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Coverage</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Where we come to you
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        {site.coverageNote} Hotels, condos, and private homes in these zones are our standard reach.
      </p>

      <ul className="mt-12 space-y-4">
        {coverageAreas.map((area) => (
          <li key={area.slug} className="border border-border bg-surface-elevated p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl text-foreground">{area.name}</h2>
              <span className="text-sm text-muted">{area.city}</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Travel fee:{" "}
              {area.travelFeeThb === 0
                ? "Included — no extra travel fee"
                : `${formatThb(area.travelFeeThb)} (may vary by exact distance)`}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Outside these zones? We often still can help —{" "}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-accent underline">
          message us on WhatsApp
        </a>{" "}
        with your hotel or area.
      </p>

      <Link
        href="/book"
        className="mt-8 inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        Book in coverage
      </Link>
    </section>
  );
}
