import Link from "next/link";
import { FooterMenus } from "@/components/layout/footer-menus";
import { site, whatsappHref } from "@/content/site";

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cancellation", href: "/cancellation" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#121816] text-white pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+5rem))] md:pb-[max(1.75rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 55% at 8% 0%, rgba(126,184,164,0.22), transparent 52%), radial-gradient(60% 45% at 100% 30%, rgba(47,93,80,0.28), transparent 48%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light [background-image:var(--grain)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7eb8a4]/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-14 xs:px-5 sm:pt-16 md:px-8 md:pt-20 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-display text-[2.75rem] leading-none tracking-tight text-white xs:text-5xl md:text-6xl lg:text-[4.25rem]">
                {site.name}
              </span>
            </Link>
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.24em] text-[#7eb8a4]">
              GetRoomSpa
            </p>
            <p className="mt-5 max-w-md font-display text-xl leading-snug tracking-tight text-white/90 xs:text-2xl md:text-[1.65rem]">
              {site.tagline}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55 md:text-[0.9375rem]">
              Professional therapists delivered to your room in Chiang Mai. Classic, therapeutic and
              couples massage, designed around your comfort and preferences.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:items-stretch lg:items-end lg:text-right">
            <p className="text-sm leading-relaxed text-white/55 lg:max-w-xs">
              In-room massage across Chiang Mai — hotel, condo, or home.
            </p>
            <div className="flex w-full flex-col gap-2.5 xs:flex-row lg:w-auto lg:justify-end">
              <Link
                href="/book"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm bg-white px-5 py-3 text-sm font-medium text-[#1a221c] transition duration-200 hover:bg-white/90 lg:flex-none lg:min-w-[10rem]"
              >
                Book now
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm border border-white/30 px-5 py-3 text-sm font-medium text-white transition duration-200 hover:border-white hover:bg-white/10 lg:flex-none lg:min-w-[10rem]"
              >
                WhatsApp
              </a>
            </div>
            <p className="text-xs tracking-wide text-white/40">
              Cash or card · Secure online booking
              <span className="mx-2 text-white/20" aria-hidden>
                ·
              </span>
              Visa · Mastercard · Amex
            </p>
          </div>
        </div>

        <div className="mt-12 h-px bg-gradient-to-r from-white/15 via-white/10 to-transparent md:mt-16" />

        <div className="py-12 md:py-14">
          <p className="mb-5 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/35">
            Find your way
          </p>
          <FooterMenus />
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs leading-relaxed text-white/40 xs:px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-8">
          <p>
            © {year} GetRoomSpa
            <span className="mx-1.5 text-white/20" aria-hidden>
              ·
            </span>
            Chiang Mai, Thailand
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {legalLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center">
                {index > 0 ? (
                  <span className="mx-2.5 text-white/20" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link href={item.href} className="transition duration-200 hover:text-white/75">
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
