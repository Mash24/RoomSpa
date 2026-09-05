import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { lineHref, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact RoomSpa on WhatsApp, LINE, or email for bookings, coverage questions, and partnerships.",
};

function formatWhatsAppDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length === 11) {
    return `+66 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

export default function ContactPage() {
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 xs:px-5 md:px-8 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Contact</p>
      <h1 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
        Talk to us
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
        WhatsApp or LINE is fastest. Copy the number or ID into your phone if you prefer — or tap to
        open a chat. For an existing booking, use My booking or message us with your reference.
      </p>

      <ul className="mt-12 space-y-6">
        <li className="border border-border bg-surface-elevated p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">WhatsApp</p>
          <WhatsAppLink cta="contact" className="mt-2 inline-block font-display text-2xl text-accent">
            {whatsappDisplay}
          </WhatsAppLink>
          <p className="mt-2 select-all font-mono text-sm text-foreground">{site.contact.whatsapp}</p>
          <p className="mt-2 text-sm text-muted">Bookings and same-day requests. Tap to chat, or copy the number.</p>
        </li>
        <li className="border border-border bg-surface-elevated p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">LINE</p>
          <a
            href={lineHref}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-display text-2xl text-accent"
          >
            {site.contact.lineId}
          </a>
          <p className="mt-2 select-all font-mono text-sm text-foreground">LINE ID: {site.contact.lineId}</p>
          <p className="mt-2 text-sm text-muted">Tap to open LINE, or copy the ID into the app.</p>
        </li>
        <li className="border border-border bg-surface-elevated p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Email</p>
          <a
            href={`mailto:${site.contact.email}`}
            className="mt-2 inline-block break-all font-display text-2xl text-foreground"
          >
            {site.contact.email}
          </a>
          <p className="mt-2 text-sm text-muted">Partnerships and general questions.</p>
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
