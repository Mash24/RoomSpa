import Link from "next/link";
import { cities, cityStatusLabel } from "@/content/cities";
import { site } from "@/content/site";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";

const bookLinks = [
  { label: "Book Signature", href: "/book" },
  { label: "My booking", href: "/my-booking" },
  { label: "Signature Experiences", href: "/services/signature" },
  { label: "Wellness Massage", href: "/services/wellness" },
  { label: "Pricing", href: "/pricing" },
] as const;

const exploreLinks = [
  { label: "Locations", href: "/city" },
  { label: "Reviews", href: "/reviews" },
  { label: "Gallery", href: "/gallery" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
] as const;

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

function formatWhatsAppDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length === 11) {
    return `+66 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-9 items-center py-1 text-xs leading-snug text-white/70 transition-colors duration-200 hover:text-white sm:text-sm"
    >
      {label}
    </Link>
  );
}

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="font-display text-base tracking-tight text-white xs:text-lg md:text-xl">
        {title}
      </h3>
      <div className="mt-3 border-t border-white/10 pt-2.5">{children}</div>
    </div>
  );
}

export function FooterMenus() {
  const expandingCities = cities.filter(
    (city) => city.status === "enquiries" || city.status === "coming_soon",
  );
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-5 md:gap-8">
      <Column title="Book">
        <nav aria-label="Book" className="flex flex-col">
          {bookLinks.map((item) => (
            <MenuLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </Column>

      <Column title="Explore">
        <nav aria-label="Explore" className="flex flex-col">
          {exploreLinks.map((item) => (
            <MenuLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </Column>

      <Column title="Company">
        <nav aria-label="Company" className="flex flex-col">
          {companyLinks.map((item) => (
            <MenuLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
          <a
            href={`mailto:${site.contact.email}`}
            className="block break-all text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
          >
            <span className="sm:hidden">Email</span>
            <span className="hidden sm:inline">{site.contact.email}</span>
          </a>
          <WhatsAppLink
            cta="footer-menu"
            className="block text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
          >
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">WhatsApp {whatsappDisplay}</span>
          </WhatsAppLink>
          <p className="text-[0.65rem] leading-snug text-white/40 sm:text-xs">
            Thailand · Signature · 24/7 enquiries
          </p>
          {expandingCities.length > 0 ? (
            <p className="pt-1 text-[0.65rem] leading-snug text-white/40 sm:text-xs">
              Expanding:{" "}
              {expandingCities.map((city, index) => (
                <span key={city.slug}>
                  {index > 0 ? " · " : ""}
                  <Link href={`/city/${city.slug}`} className="text-white/55 transition hover:text-white">
                    {city.name}
                  </Link>
                  <span className="text-white/35"> ({cityStatusLabel(city.status)})</span>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </Column>
    </div>
  );
}
