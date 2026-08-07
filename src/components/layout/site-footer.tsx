import Link from "next/link";
import { site, whatsappHref } from "@/content/site";
import { PaymentBadges } from "@/components/payment/payment-badges";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl tracking-tight text-foreground">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}</p>
          <div className="mt-6">
            <PaymentBadges compact />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Explore</p>
          <ul className="mt-4 space-y-2">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-foreground/80 transition hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="text-sm text-foreground/80 transition hover:text-accent">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-foreground/80 transition hover:text-accent">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Book</p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/book" className="text-sm text-foreground/80 transition hover:text-accent">
                Book appointment
              </Link>
            </li>
            <li>
              <Link href="/my-booking" className="text-sm text-foreground/80 transition hover:text-accent">
                Manage / pay
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="text-sm text-foreground/80 transition hover:text-accent"
              >
                {site.contact.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-foreground/80 transition hover:text-accent"
              >
                WhatsApp: {site.contact.whatsapp}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Cash on arrival · Visa · Mastercard · Amex</p>
        </div>
      </div>
    </footer>
  );
}
