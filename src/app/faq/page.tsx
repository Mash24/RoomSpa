import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { faqItems } from "@/content/pages";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ | Booking, payments & coverage",
  description:
    "Questions about RoomSpa mobile massage — booking, PIN, payments, privacy, and Chiang Mai coverage.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <FaqJsonLd />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">FAQ</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Common questions
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
        Tap a question to read the answer.
      </p>

      <FaqAccordion items={faqItems} />

      <div className="mt-12 flex flex-col gap-2.5 xs:flex-row xs:flex-wrap xs:gap-3">
        <Link
          href="/book"
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Book now
        </Link>
        <WhatsAppLink
          cta="faq"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          WhatsApp us
        </WhatsAppLink>
      </div>
    </section>
  );
}
