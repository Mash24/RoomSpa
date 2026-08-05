import type { Metadata } from "next";
import Link from "next/link";
import { testimonials } from "@/content/marketing";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Guest feedback for RoomSpa mobile massage at hotels, condos, and homes.",
};

export default function ReviewsPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Reviews</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        What guests say
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Early feedback while we grow. Real review collection and moderation land in a later phase —
        these quotes are illustrative launch copy.
      </p>

      <ul className="mt-12 space-y-8">
        {testimonials.map((item) => (
          <li key={item.name} className="border-t border-border pt-6">
            <blockquote className="font-display text-xl leading-relaxed text-foreground md:text-2xl">
              “{item.quote}”
            </blockquote>
            <p className="mt-4 text-sm text-muted">
              {item.name} · {item.detail}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/book"
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Book your session
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Share feedback on WhatsApp
        </a>
      </div>
    </section>
  );
}
