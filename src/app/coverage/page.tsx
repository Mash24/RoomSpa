import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { coverageAreas } from "@/content/coverage";
import { getActiveCities } from "@/content/cities";
import { formatThb } from "@/lib/currency";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Coverage zones | GetRoomSpa",
  description:
    "GetRoomSpa booking areas across Thailand — Bangkok, Phuket, and Chiang Mai. See live zones and book private in-room massage.",
  path: "/coverage",
});

export default function CoveragePage() {
  const cities = getActiveCities();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Coverage</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Where we book today
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        GetRoomSpa is available in{" "}
        {cities.map((c) => c.name).join(", ").replace(/, ([^,]*)$/, ", and $1")}. Detailed travel
        zones below help with Chiang Mai routing; for Bangkok and Phuket, tell us your hotel or
        neighbourhood when you book.
      </p>

      <ul className="mt-8 flex flex-wrap gap-2">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/city/${city.slug}`}
              className="inline-flex rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition hover:border-accent hover:text-accent"
            >
              {city.name}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl tracking-tight text-foreground">
        Chiang Mai travel zones
      </h2>
      <ul className="mt-6 space-y-4">
        {coverageAreas.map((area) => (
          <li key={area.slug} className="border border-border bg-surface-elevated p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl text-foreground">{area.name}</h3>
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
        <WhatsAppLink cta="coverage" className="text-accent underline">
          WhatsApp us
        </WhatsAppLink>{" "}
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
