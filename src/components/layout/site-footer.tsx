import Link from "next/link";
import { cities } from "@/content/cities";
import { site, whatsappHref } from "@/content/site";
import { PaymentBadges } from "@/components/payment/payment-badges";

const exploreLinks = [
  ...site.nav,
  { label: "Coverage", href: "/coverage" },
  { label: "Contact", href: "/contact" },
];

const bookLinks = [
  { label: "Book appointment", href: "/book" },
  { label: "Manage / pay", href: "/my-booking" },
  { label: "Services menu", href: "/services" },
  { label: "Pricing", href: "/pricing" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const liveCities = cities.filter((city) => city.status === "active");
  const soonCities = cities.filter((city) => city.status === "coming_soon");

  return (
    <footer className="border-t border-border bg-surface pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Primary CTA strip — especially useful on phones */}
      <div className="border-b border-border bg-surface-elevated">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 xs:px-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div className="min-w-0">
            <p className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
              Ready to book?
            </p>
            <p className="mt-1 text-sm text-muted">
              In-room massage across Chiang Mai — hotel, condo, or home.
            </p>
          </div>
          <div className="flex flex-col gap-2 xs:flex-row">
            <Link
              href="/book"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 sm:flex-none"
            >
              Book now
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent sm:flex-none"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 xs:px-5 md:px-8 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-3xl tracking-tight text-foreground">{site.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-accent">GetRoomSpa</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Professional therapists to your room in Chiang Mai. Classic, therapeutic, couples, and
              consent-led sensual sessions.
            </p>
            <div className="mt-5">
              <PaymentBadges compact />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-1">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 items-center text-sm text-foreground/85 transition hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Book</p>
            <ul className="mt-4 space-y-2.5">
              {bookLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 items-center text-sm text-foreground/85 transition hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Contact</p>
            <ul className="mt-4 space-y-3 text-sm">
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
                  WhatsApp {site.contact.whatsapp}
                </a>
              </li>
              <li className="text-muted">
                Live now:{" "}
                {liveCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    {city.name}
                  </Link>
                ))}
              </li>
              {soonCities.length > 0 ? (
                <li className="text-muted">
                  Coming soon:{" "}
                  {soonCities.map((city, index) => (
                    <span key={city.slug}>
                      {index > 0 ? ", " : ""}
                      <Link href={`/city/${city.slug}`} className="hover:text-accent">
                        {city.name}
                      </Link>
                    </span>
                  ))}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs leading-relaxed text-muted xs:px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {year} {site.name} (GetRoomSpa). In-room massage · Chiang Mai, Thailand.
          </p>
          <p className="md:text-right">
            Cash on arrival · Visa · Mastercard · Amex · Same-day booking when slots are open
          </p>
        </div>
      </div>
    </footer>
  );
}
