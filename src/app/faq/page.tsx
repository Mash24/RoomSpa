import type { Metadata } from "next";
import Link from "next/link";
import { faqItems } from "@/content/pages";
import { whatsappHref } from "@/content/site";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ | Booking, PIN, payments & sensual sessions",
  description:
    "Questions about RoomSpa mobile massage — booking, PIN, payments, Nuru, Yoni, Lingam, discretion, and Chiang Mai coverage.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <FaqJsonLd />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">FAQ</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Common questions
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Booking, payments, privacy, and sensual sessions — answered plainly.
      </p>

      <dl className="mt-12 space-y-8">
        {faqItems.map((item) => (
          <div key={item.question} className="border-t border-border pt-6">
            <dt className="font-display text-xl text-foreground md:text-2xl">{item.question}</dt>
            <dd className="mt-3 text-sm leading-relaxed text-muted md:text-base">{item.answer}</dd>
          </div>
        ))}
      </dl>

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
          Still unsure? WhatsApp us
        </a>
      </div>
    </section>
  );
}
