import Link from "next/link";
import { getActiveCities } from "@/content/cities";
import { lineHref, site } from "@/content/site";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";

const bookLinks = [
  { label: "Signature Experiences", href: "/services/signature" },
  { label: "Wellness Massage", href: "/services/wellness" },
  { label: "Therapists", href: "/therapists" },
  { label: "Pricing", href: "/pricing" },
  { label: "My Booking", href: "/my-booking" },
] as const;

const helpLinks = [
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
] as const;

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cancellation", href: "/cancellation" },
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
  const activeCities = getActiveCities();
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-5 md:grid-cols-4 md:gap-8">
      <Column title="Book">
        <nav aria-label="Book" className="flex flex-col">
          {bookLinks.map((item) => (
            <MenuLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </Column>

      <Column title="Cities">
        <nav aria-label="Cities" className="flex flex-col">
          {activeCities.map((city) => (
            <MenuLink key={city.slug} href={`/city/${city.slug}`} label={city.name} />
          ))}
          <MenuLink href="/city" label="All cities" />
        </nav>
      </Column>

      <Column title="Help">
        <nav aria-label="Help" className="flex flex-col">
          {helpLinks.map((item) => (
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
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <a
            href={`mailto:${site.contact.email}`}
            className="block break-all text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
          >
            {site.contact.email}
          </a>
          <div>
            <WhatsAppLink
              cta="footer-menu"
              className="block text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
            >
              WhatsApp {whatsappDisplay}
            </WhatsAppLink>
            <p className="mt-0.5 select-all font-mono text-[0.65rem] text-white/40 sm:text-xs">
              {site.contact.whatsapp}
            </p>
          </div>
          <div>
            <a
              href={lineHref}
              target="_blank"
              rel="noreferrer"
              className="block text-xs leading-snug text-white/70 transition hover:text-white sm:text-sm"
            >
              LINE GetRoomSpa
            </a>
            <p className="mt-0.5 select-all font-mono text-[0.65rem] text-white/40 sm:text-xs">
              LINE ID: {site.contact.lineId}
            </p>
          </div>
        </div>
      </Column>
    </div>
  );
}
