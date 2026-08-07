import Link from "next/link";
import { cities } from "@/content/cities";
import { site, whatsappHref } from "@/content/site";

const bookLinks = [
  { label: "Book appointment", href: "/book", short: "Book" },
  { label: "Manage / pay", href: "/my-booking", short: "Manage / pay" },
  { label: "Service menu", href: "/services", short: "Services" },
  { label: "Pricing", href: "/pricing", short: "Pricing" },
] as const;

const exploreLinks = [
  { label: "Locations", href: "/city" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
  { label: "Coverage", href: "/coverage" },
] as const;

function formatWhatsAppDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length === 11) {
    return `+66 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

function MenuLink({
  href,
  label,
  short,
}: {
  href: string;
  label: string;
  short?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-8 items-center py-1 text-[0.7rem] leading-snug text-white/70 transition-colors duration-200 hover:text-white xs:min-h-9 xs:text-xs sm:text-sm md:min-h-10 md:py-1.5 md:text-[0.9375rem]"
    >
      <span className="border-b border-transparent transition-[border-color] duration-200 group-hover:border-white/35">
        {short ? (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </span>
    </Link>
  );
}

function Column({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-sm border border-white/10 bg-white/[0.03] px-2.5 py-3 xs:px-3 xs:py-3.5 sm:px-4 sm:py-4 md:border-[#7eb8a4]/25 md:bg-white/[0.045] md:px-5 md:py-5">
      <div className="flex items-baseline gap-1.5 xs:gap-2">
        <span className="font-display text-[0.7rem] leading-none text-[#7eb8a4]/75 xs:text-xs sm:text-sm md:text-lg">
          {index}
        </span>
        <h3 className="font-display text-base leading-none tracking-tight text-white xs:text-lg sm:text-xl md:text-[1.75rem]">
          {title}
        </h3>
      </div>
      <p className="mt-1 hidden text-[0.65rem] leading-snug text-white/35 sm:block md:mt-1.5 md:text-xs">
        {hint}
      </p>
      <div className="mt-2.5 border-t border-white/10 pt-2 sm:mt-3 sm:pt-2.5 md:mt-4 md:pt-3">
        {children}
      </div>
    </div>
  );
}

export function FooterMenus() {
  const soonCities = cities.filter((city) => city.status === "coming_soon");
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  return (
    <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-5">
      <Column index="01" title="Book" hint="Reserve, pay, or browse the menu">
        <nav aria-label="Book" className="flex flex-col">
          {bookLinks.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              label={item.label}
              short={item.short}
            />
          ))}
        </nav>
      </Column>

      <Column index="02" title="Explore" hint="Stories, places, and answers">
        <nav aria-label="Explore" className="flex flex-col">
          {exploreLinks.map((item) => (
            <MenuLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </Column>

      <Column index="03" title="Contact" hint="Reach us anytime">
        <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3">
          <a
            href={`mailto:${site.contact.email}`}
            className="break-all text-[0.65rem] leading-snug text-white/70 transition hover:text-white xs:text-[0.7rem] sm:text-xs md:text-sm"
          >
            <span className="sm:hidden">Email us</span>
            <span className="hidden sm:inline">{site.contact.email}</span>
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="text-[0.65rem] leading-snug text-white/70 transition hover:text-white xs:text-[0.7rem] sm:text-xs md:text-sm"
          >
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">WhatsApp {whatsappDisplay}</span>
          </a>
          <p className="text-[0.6rem] leading-snug text-white/40 xs:text-[0.65rem] sm:text-xs md:text-sm">
            <span className="sm:hidden">24/7 · CNX</span>
            <span className="hidden sm:inline">Open 24/7 · Chiang Mai</span>
          </p>
          <Link
            href="/contact"
            className="text-[0.65rem] text-[#7eb8a4] transition hover:text-white xs:text-[0.7rem] sm:text-xs md:text-sm"
          >
            More →
          </Link>
          {soonCities.length > 0 ? (
            <p className="mt-1 border-t border-white/10 pt-2 text-[0.6rem] leading-snug text-white/40 xs:text-[0.65rem] sm:text-xs md:text-sm">
              <span className="block text-[0.55rem] uppercase tracking-[0.14em] text-white/30 sm:text-[0.65rem]">
                Soon
              </span>
              <span className="mt-1 block text-white/55">
                {soonCities.map((city, index) => (
                  <span key={city.slug}>
                    {index > 0 ? " · " : ""}
                    <Link href={`/city/${city.slug}`} className="transition hover:text-white">
                      {city.name}
                    </Link>
                  </span>
                ))}
              </span>
            </p>
          ) : null}
        </div>
      </Column>
    </div>
  );
}
