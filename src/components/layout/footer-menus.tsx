import Link from "next/link";
import { cities } from "@/content/cities";
import { site, whatsappHref } from "@/content/site";

const bookLinks = [
  { label: "Book", href: "/book" },
  { label: "My booking", href: "/my-booking" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
] as const;

const exploreLinks = [
  { label: "Reviews", href: "/reviews" },
  { label: "Locations", href: "/city" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
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
  const soonCities = cities.filter((city) => city.status === "coming_soon");
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  return (
    <div className="grid grid-cols-3 gap-4 xs:gap-5 md:gap-8">
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

      <Column title="Contact">
        <div className="flex flex-col gap-1.5">
          <a
            href={`mailto:${site.contact.email}`}
            className="break-all text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
          >
            <span className="sm:hidden">Email</span>
            <span className="hidden sm:inline">{site.contact.email}</span>
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
          >
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">WhatsApp {whatsappDisplay}</span>
          </a>
          <p className="text-[0.65rem] leading-snug text-white/40 sm:text-xs">
            Chiang Mai · 24/7
          </p>
          <Link
            href="/contact"
            className="text-xs text-[#7eb8a4] transition hover:text-white sm:text-sm"
          >
            Contact page
          </Link>
          {soonCities.length > 0 ? (
            <p className="mt-2 border-t border-white/10 pt-2 text-[0.65rem] leading-snug text-white/40 sm:text-xs">
              Coming soon:{" "}
              {soonCities.map((city, index) => (
                <span key={city.slug}>
                  {index > 0 ? ", " : ""}
                  <Link href={`/city/${city.slug}`} className="text-white/55 transition hover:text-white">
                    {city.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </Column>
    </div>
  );
}
