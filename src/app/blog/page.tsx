import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "RoomSpa guides on hotel massage, travel recovery, and in-room wellness in Chiang Mai.",
};

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Blog</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Guides & notes
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        SEO articles and guest guides are next — hotel massage tips, what to expect from Nuru or
        tantric sessions, and Chiang Mai coverage notes. For now, start with our service menu.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/services"
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Browse services
        </Link>
        <Link
          href="/faq"
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Read the FAQ
        </Link>
      </div>
    </section>
  );
}
