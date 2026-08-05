import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact RoomSpa on WhatsApp or email for bookings, coverage questions, and partnerships.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Contact</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Talk to us
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        Fastest reply is WhatsApp. For booking changes, use My booking with your email and PIN, or
        message us with your reference code.
      </p>

      <ul className="mt-12 space-y-6">
        <li className="border border-border bg-surface-elevated p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">WhatsApp</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-display text-2xl text-accent"
          >
            {site.contact.whatsapp}
          </a>
          <p className="mt-2 text-sm text-muted">Bookings, last-minute requests, coverage questions.</p>
        </li>
        <li className="border border-border bg-surface-elevated p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Email</p>
          <a
            href={`mailto:${site.contact.email}`}
            className="mt-2 inline-block font-display text-2xl text-foreground"
          >
            {site.contact.email}
          </a>
          <p className="mt-2 text-sm text-muted">
            Partnerships and non-urgent notes. Confirmation emails go live once our domain is set up.
          </p>
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/book"
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Book online
        </Link>
        <Link
          href="/my-booking"
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Manage booking
        </Link>
      </div>
    </section>
  );
}
