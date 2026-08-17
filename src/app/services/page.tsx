import type { Metadata } from "next";
import Link from "next/link";
import { ServicesHashRedirect } from "@/components/services/services-hash-redirect";
import { whatsappHref } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Services | RoomSpa Chiang Mai",
  description:
    "Choose Wellness Massage or Signature Experiences — premium in-room massage delivered to your hotel, condo, or home in Chiang Mai.",
  path: "/services",
});

export default function ServicesHubPage() {
  return (
    <div>
      <ServicesHashRedirect />
      <section className="border-b border-border bg-surface px-4 py-14 xs:px-5 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Services</p>
          <h1 className="mt-3 max-w-2xl font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            Two experiences. One RoomSpa.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Wellness massage for classic relaxation and recovery. Signature Experiences for
            something more intimate — both book through the same private in-room service.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 xs:px-5 md:grid-cols-2 md:gap-10 md:px-8 md:py-16">
        <ExperienceHubCard
          eyebrow="Wellness"
          title="Wellness Massage"
          summary="Swedish, Thai, deep tissue, hot oil, sports, prenatal, couples, and more — professional spa massage in your room."
          href="/services/wellness"
          cta="Explore Wellness"
          variant="wellness"
        />
        <ExperienceHubCard
          eyebrow="Signature"
          title="Signature Experiences"
          summary="Tantric, Nuru, body-to-body, Yoni, Lingam, and couples sensual — private, consent-led, and discreet."
          href="/services/signature"
          cta="Explore Signature Experiences"
          variant="signature"
        />
      </div>

      <div className="border-t border-border bg-surface-elevated px-4 py-10 xs:px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Ready to book? Same flow for both experiences.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              Book now
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceHubCard({
  eyebrow,
  title,
  summary,
  href,
  cta,
  variant,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
  variant: "wellness" | "signature";
}) {
  const isSignature = variant === "signature";

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-sm p-8 transition md:p-10 ${
        isSignature
          ? "bg-[#0c0a09] ring-1 ring-[#c9a86c]/25 hover:ring-[#c9a86c]/45"
          : "bg-surface-elevated ring-1 ring-border hover:ring-accent/35"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-[0.2em] ${
          isSignature ? "text-[#c9a86c]" : "text-accent"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-3xl tracking-tight md:text-4xl ${
          isSignature ? "text-[#f5f0e8]" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-4 flex-1 text-sm leading-relaxed md:text-base ${
          isSignature ? "text-[#f5f0e8]/75" : "text-muted"
        }`}
      >
        {summary}
      </p>
      <span
        className={`mt-6 inline-flex min-h-10 items-center text-sm font-medium underline underline-offset-4 ${
          isSignature
            ? "text-[#f5f0e8] decoration-[#c9a86c]/50 group-hover:decoration-[#c9a86c]"
            : "text-foreground decoration-border group-hover:decoration-accent"
        }`}
      >
        {cta} →
      </span>
    </Link>
  );
}
