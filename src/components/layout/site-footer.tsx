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
            "radial-gradient(80% 55% at 8% 0%, rgba(126,184,164,0.18), transparent 52%), radial-gradient(60% 45% at 100% 30%, rgba(47,93,80,0.22), transparent 48%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 xs:px-5 sm:pt-14 md:px-8 md:pt-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="inline-block font-display text-4xl tracking-tight text-white md:text-5xl">
              {site.name}
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
              In-room massage in Chiang Mai — hotel, condo, or home.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 xs:flex-row sm:w-auto">
            <Link
              href="/book"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm bg-white px-5 py-3 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 sm:flex-none sm:min-w-[9rem]"
            >
              Book now
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm border border-white/30 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 sm:flex-none sm:min-w-[9rem]"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 h-px bg-white/10 md:mt-12" />

        <div className="py-10 md:py-12">
          <FooterMenus />
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs leading-relaxed text-white/40 xs:px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-8">
          <p>
            © {year} GetRoomSpa · Chiang Mai
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {legalLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center">
                {index > 0 ? (
                  <span className="mx-2.5 text-white/20" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link href={item.href} className="transition hover:text-white/75">
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
