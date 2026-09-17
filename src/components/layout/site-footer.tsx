import Link from "next/link";
import { FooterMenus } from "@/components/layout/footer-menus";
import { WhatsAppLink } from "@/components/analytics/whatsapp-link";
import { site } from "@/content/site";

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cancellation", href: "/cancellation" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#121816] text-white pb-[max(8rem,calc(env(safe-area-inset-bottom)+7.25rem))] lg:pb-[max(1.75rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 55% at 8% 0%, rgba(126,184,164,0.18), transparent 52%), radial-gradient(60% 45% at 100% 30%, rgba(47,93,80,0.22), transparent 48%)",
        }}
      />

      <div className="page-gutter relative mx-auto max-w-6xl pt-12 sm:pt-14 md:pt-16 xl:max-w-7xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-block font-display text-[1.85rem] tracking-tight text-white min-[360px]:text-[2rem] xs:text-4xl md:text-5xl"
            >
              {site.name}
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
              Private in-room massage across Thailand — Bangkok, Phuket, and Chiang Mai.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2.5 xs:grid-cols-2 sm:w-auto sm:flex">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-white px-5 py-3 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 sm:min-w-[9rem]"
            >
              Book now
            </Link>
            <WhatsAppLink
              cta="footer-cta"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/30 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 sm:min-w-[9rem]"
            >
              WhatsApp
            </WhatsAppLink>
          </div>
        </div>

        <div className="mt-10 h-px bg-white/10 md:mt-12" />

        <div className="py-10 md:py-12">
          <FooterMenus />
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="page-gutter mx-auto flex max-w-6xl flex-col gap-3 py-5 text-xs leading-relaxed text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6 xl:max-w-7xl">
          <p>© {year} GetRoomSpa · Thailand</p>
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
