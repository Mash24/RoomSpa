import type { Metadata } from "next";
import Link from "next/link";
import { aboutContent } from "@/content/pages";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "RoomSpa brings professional mobile massage to hotels, condos, and homes — classic to tantric, privacy first.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {aboutContent.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {aboutContent.title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{aboutContent.lead}</p>

      <div className="mt-10 space-y-5">
        {aboutContent.story.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-foreground/85 md:text-base">
            {paragraph}
          </p>
        ))}
      </div>

      <ul className="mt-14 space-y-8">
        {aboutContent.values.map((value) => (
          <li key={value.title} className="border-t border-border pt-6">
            <h2 className="font-display text-2xl text-foreground">{value.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">{value.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/services"
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Browse services
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
