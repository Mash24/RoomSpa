import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { faqItems } from "@/content/pages";
import { whatsappHref } from "@/content/site";
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
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Common questions
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Tap a question to read the answer.
      </p>

      <FaqAccordion items={faqItems} />

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/book"
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Book now
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          WhatsApp us
        </a>
      </div>
    </section>
  );
}
