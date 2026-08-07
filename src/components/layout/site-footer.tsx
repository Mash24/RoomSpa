import Link from "next/link";
import { cities } from "@/content/cities";
import { site, whatsappHref } from "@/content/site";
import { PaymentBadges } from "@/components/payment/payment-badges";

const exploreLinks = [
  { label: "Services", href: "/services" },
  { label: "Locations", href: "/city" },
  { label: "Pricing", href: "/pricing" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
];

const bookLinks = [
  { label: "Book an appointment", href: "/book" },
  { label: "Manage booking", href: "/my-booking" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cancellation", href: "/cancellation" },
];

function formatWhatsAppDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length === 11) {
    return `+66 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-accent">{children}</p>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-9 items-center text-sm text-foreground/80 transition-colors hover:text-accent"
    >
      <span className="border-b border-transparent transition-[border-color] group-hover:border-accent/40">
        {children}
      </span>
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const soonCities = cities.filter((city) => city.status === "coming_soon");
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] md:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_55%_at_0%_0%,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.3] [background-image:var(--grain)]"
      />

      {/* Closing CTA */}
      <div className="relative border-b border-border bg-surface-elevated/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 xs:px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-8 md:px-8">
          <div className="min-w-0 max-w-lg">
            <p className="font-display text-[1.65rem] leading-tight tracking-tight text-foreground xs:text-3xl sm:text-[2rem]">
              Ready to book?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              In-room massage across Chiang Mai — hotel, condo, or home.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 xs:flex-row sm:w-auto sm:shrink-0">
            <Link
              href="/book"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 sm:min-w-[8.75rem] sm:flex-none"
            >
              Book now
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-border bg-surface/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent sm:min-w-[8.75rem] sm:flex-none"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 xs:px-5 md:px-8 md:py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] md:gap-12 lg:gap-16">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                {site.name}
              </span>
            </Link>
            <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.2em] text-accent">
              GetRoomSpa
            </p>
            <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-foreground/85">
              {site.tagline}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Professional therapists delivered to your room in Chiang Mai. Classic, therapeutic and
              couples massage, designed around your comfort and preferences.
            </p>
            <div className="mt-5">
              <PaymentBadges compact />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-8">
            <nav aria-label="Explore">
              <FooterHeading>Explore</FooterHeading>
              <ul className="mt-3 space-y-0.5">
                {exploreLinks.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Book">
              <FooterHeading>Book</FooterHeading>
              <ul className="mt-3 space-y-0.5">
                {bookLinks.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="col-span-2 sm:col-span-1">
              <FooterHeading>Contact</FooterHeading>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="break-all text-foreground/85 transition hover:text-accent"
                  >
                    {site.contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/85 transition hover:text-accent"
                  >
                    WhatsApp {whatsappDisplay}
                  </a>
                </li>
                <li className="text-muted">Open 24/7 · Chiang Mai</li>
              </ul>
              {soonCities.length > 0 ? (
                <p className="mt-4 text-sm text-muted">
                  <span className="text-[0.6875rem] uppercase tracking-[0.14em]">Coming soon</span>
                  <span className="mt-1.5 block text-foreground/70">
                    {soonCities.map((city, index) => (
                      <span key={city.slug}>
                        {index > 0 ? " · " : ""}
                        <Link href={`/city/${city.slug}`} className="transition hover:text-accent">
                          {city.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs leading-relaxed text-muted xs:px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-8">
          <p>
            © {year} GetRoomSpa
            <span className="mx-1.5 text-foreground/25" aria-hidden>
              ·
            </span>
            Chiang Mai, Thailand
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {legalLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-3">
                {index > 0 ? <span className="text-foreground/25" aria-hidden>·</span> : null}
                <Link href={item.href} className="transition hover:text-accent">
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
