import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

const WELLNESS_IMAGE = "/media/services/stills/v-hands.jpg";
const SIGNATURE_IMAGE = "/media/marketing/pricing-sensual-dark.jpg";

export function HomeExperienceChooser() {
  const { tiers } = site.hero;

  return (
    <section className="border-b border-border bg-background px-4 py-14 xs:px-5 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          What we&apos;re known for
        </p>
        <h2 className="mt-3 max-w-xl font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
          Signature first. Wellness when you want it.
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted md:text-base">
          Most guests come for private Signature Experiences. Classic wellness massage is still
          available — just not what leads RoomSpa.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
          <ExperienceCard
            title={tiers.signature.label}
            summary={tiers.signature.summary}
            href={tiers.signature.href}
            cta="Explore Signature Experiences"
            image={SIGNATURE_IMAGE}
            imageAlt="Signature Experiences — private, intimate in-room massage"
            variant="signature"
            featured
          />
          <ExperienceCard
            title={tiers.wellness.label}
            summary={tiers.wellness.summary}
            href={tiers.wellness.href}
            cta="Explore Wellness"
            image={WELLNESS_IMAGE}
            imageAlt="Swedish and therapeutic in-room massage — calm wellness"
            variant="wellness"
          />
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({
  title,
  summary,
  href,
  cta,
  image,
  imageAlt,
  variant,
  featured = false,
}: {
  title: string;
  summary: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  variant: "wellness" | "signature";
  featured?: boolean;
}) {
  const isSignature = variant === "signature";

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-sm transition duration-500 md:min-h-[26rem] ${
        isSignature
          ? "ring-1 ring-[#c9a86c]/35 hover:ring-[#c9a86c]/60 md:min-h-[28rem]"
          : "ring-1 ring-border hover:ring-accent/40"
      } ${featured ? "md:col-span-1" : ""}`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition duration-700 group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0"
        style={{
          background: isSignature
            ? "linear-gradient(180deg, rgba(12,10,9,0.15) 0%, rgba(12,10,9,0.55) 55%, rgba(12,10,9,0.92) 100%)"
            : "linear-gradient(180deg, rgba(18,24,22,0.1) 0%, rgba(18,24,22,0.45) 55%, rgba(18,24,22,0.88) 100%)",
        }}
      />
      <div className="relative p-6 md:p-8">
        <p
          className={`text-[0.65rem] font-medium uppercase tracking-[0.24em] ${
            isSignature ? "text-[#c9a86c]" : "text-white/70"
          }`}
        >
          {isSignature ? "Primary · Signature" : "Also available · Wellness"}
        </p>
        <h3
          className={`mt-2 font-display text-2xl tracking-tight md:text-3xl ${
            isSignature ? "text-[#f5f0e8]" : "text-white"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-3 max-w-sm text-sm leading-relaxed ${
            isSignature ? "text-[#f5f0e8]/80" : "text-white/80"
          }`}
        >
          {summary}
        </p>
        <span
          className={`mt-5 inline-flex min-h-10 items-center text-sm font-medium underline underline-offset-4 transition ${
            isSignature
              ? "text-[#f5f0e8] decoration-[#c9a86c]/50 group-hover:decoration-[#c9a86c]"
              : "text-white decoration-white/35 group-hover:decoration-white"
          }`}
        >
          {cta} →
        </span>
      </div>
    </Link>
  );
}
