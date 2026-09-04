import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { ServicesHashRedirect } from "@/components/services/services-hash-redirect";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Services | Signature & wellness Thailand",
  description:
    "Signature Experiences lead RoomSpa — Tantric, Nuru, body-to-body, and more. Wellness massage also available. Private in-room delivery across Thailand.",
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
            Signature first. Wellness when you want it.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Most guests come for private Signature Experiences. Classic wellness massage is still
            here — both book through the same discreet in-room service.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 xs:px-5 md:grid-cols-2 md:gap-10 md:px-8 md:py-16">
        <ExperienceHubCard
          eyebrow="Primary · Signature"
          title="Signature Experiences"
          summary="Tantric, Nuru, body-to-body, Yoni, Lingam, and couples sensual — private, consent-led, and discreet. This is what RoomSpa is known for."
          href="/services/signature"
          cta="Explore Signature Experiences"
          variant="signature"
        />
        <ExperienceHubCard
          eyebrow="Also available · Wellness"
          title="Wellness Massage"
          summary="Swedish, Thai, deep tissue, hot oil, sports, prenatal, couples, and more — professional spa massage in your room."
          href="/services/wellness"
          cta="Explore Wellness"
          variant="wellness"
        />
      </div>

      <div className="border-t border-border bg-surface-elevated px-4 py-10 xs:px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Ready for Signature? Same private booking flow.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              Book Signature
            </Link>
            <WhatsAppLink
              cta="services-hub"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              WhatsApp us
            </WhatsAppLink>
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
      className={`group flex flex-col justify-between rounded-sm border p-6 transition md:min-h-[18rem] md:p-8 ${
        isSignature
          ? "border-[#c9a86c]/35 bg-[#0c0a09] text-[#f5f0e8] hover:border-[#c9a86c]/60"
          : "border-border bg-surface-elevated hover:border-accent/40"
      }`}
    >
      <div>
        <p
          className={`text-[0.65rem] font-medium uppercase tracking-[0.2em] ${
            isSignature ? "text-[#c9a86c]" : "text-accent"
          }`}
        >
          {eyebrow}
        </p>
        <h2
          className={`mt-3 font-display text-2xl tracking-tight md:text-3xl ${
            isSignature ? "text-[#f5f0e8]" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-3 text-sm leading-relaxed md:text-base ${
            isSignature ? "text-[#f5f0e8]/75" : "text-muted"
          }`}
        >
          {summary}
        </p>
      </div>
      <span
        className={`mt-8 inline-flex text-sm font-medium underline underline-offset-4 ${
          isSignature
            ? "text-[#f5f0e8] decoration-[#c9a86c]/45 group-hover:decoration-[#c9a86c]"
            : "text-accent decoration-accent/30"
        }`}
      >
        {cta} →
      </span>
    </Link>
  );
}
