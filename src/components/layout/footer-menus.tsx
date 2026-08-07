"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { cities } from "@/content/cities";
import { site, whatsappHref } from "@/content/site";

const bookLinks = [
  { label: "Book appointment", href: "/book" },
  { label: "Manage / pay", href: "/my-booking" },
  { label: "Service menu", href: "/services" },
  { label: "Pricing", href: "/pricing" },
] as const;

const exploreLinks = [
  { label: "Locations", href: "/city" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
  { label: "Coverage", href: "/coverage" },
] as const;

type PanelId = "book" | "explore" | "contact";

function formatWhatsAppDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length === 11) {
    return `+66 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 text-[#7eb8a4] transition-transform duration-300 ease-out ${
        open ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex min-h-10 items-center justify-between gap-3 border-b border-white/[0.06] py-2.5 text-[0.9375rem] text-white/70 last:border-b-0 transition-colors duration-200 hover:text-white"
    >
      <span>{children}</span>
      <span
        aria-hidden
        className="translate-x-0 text-white/0 transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#7eb8a4]"
      >
        →
      </span>
    </Link>
  );
}

function FooterPanel({
  index,
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  index: string;
  title: string;
  hint: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const panelId = useId();
  const buttonId = `${panelId}-btn`;
  const regionId = `${panelId}-region`;

  return (
    <div
      className={`overflow-hidden rounded-sm border transition-[border-color,background-color] duration-300 ${
        open
          ? "border-[#7eb8a4]/35 bg-white/[0.045]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-4 py-4 text-left xs:px-5 xs:py-5 md:cursor-default md:pointer-events-none"
      >
        <span className="mt-0.5 font-display text-lg leading-none text-[#7eb8a4]/80 md:text-xl">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="font-display text-2xl tracking-tight text-white md:text-[1.75rem]">
              {title}
            </span>
            <span className="md:hidden">
              <Chevron open={open} />
            </span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-white/40">{hint}</span>
        </span>
      </button>

      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr] md:grid-rows-[1fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-4 pb-4 pt-1 xs:px-5 xs:pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FooterMenus() {
  const [openPanel, setOpenPanel] = useState<PanelId | null>("book");
  const [isDesktop, setIsDesktop] = useState(false);
  const soonCities = cities.filter((city) => city.status === "coming_soon");
  const whatsappDisplay = formatWhatsAppDisplay(site.contact.whatsapp);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const isOpen = (id: PanelId) => (isDesktop ? true : openPanel === id);

  const toggle = (id: PanelId) => {
    if (isDesktop) return;
    setOpenPanel((current) => (current === id ? null : id));
  };

  return (
    <div className="grid gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
      <FooterPanel
        index="01"
        title="Book"
        hint="Reserve, pay, or browse the menu"
        open={isOpen("book")}
        onToggle={() => toggle("book")}
      >
        <nav aria-label="Book">
          {bookLinks.map((item) => (
            <MenuLink key={item.href} href={item.href}>
              {item.label}
            </MenuLink>
          ))}
        </nav>
      </FooterPanel>

      <FooterPanel
        index="02"
        title="Explore"
        hint="Stories, places, and answers"
        open={isOpen("explore")}
        onToggle={() => toggle("explore")}
      >
        <nav aria-label="Explore">
          {exploreLinks.map((item) => (
            <MenuLink key={item.href} href={item.href}>
              {item.label}
            </MenuLink>
          ))}
        </nav>
      </FooterPanel>

      <FooterPanel
        index="03"
        title="Contact"
        hint="Reach us anytime"
        open={isOpen("contact")}
        onToggle={() => toggle("contact")}
      >
        <div className="space-y-4 pt-2">
          <a
            href={`mailto:${site.contact.email}`}
            className="block break-all text-[0.9375rem] text-white/70 transition hover:text-white"
          >
            {site.contact.email}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="block text-[0.9375rem] text-white/70 transition hover:text-white"
          >
            WhatsApp {whatsappDisplay}
          </a>
          <p className="text-sm text-white/40">Open 24/7 · Chiang Mai</p>
          <Link
            href="/contact"
            className="inline-flex min-h-10 items-center text-sm text-[#7eb8a4] transition hover:text-white"
          >
            Contact page →
          </Link>
          {soonCities.length > 0 ? (
            <p className="border-t border-white/10 pt-4 text-sm text-white/40">
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                Coming soon
              </span>
              <span className="mt-2 block text-white/55">
                {soonCities.map((city, index) => (
                  <span key={city.slug}>
                    {index > 0 ? " · " : ""}
                    <Link
                      href={`/city/${city.slug}`}
                      className="transition hover:text-white"
                    >
                      {city.name}
                    </Link>
                  </span>
                ))}
              </span>
            </p>
          ) : null}
        </div>
      </FooterPanel>
    </div>
  );
}
