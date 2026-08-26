"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { site } from "@/content/site";

const links = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/tickets", label: "Care" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/therapists", label: "Therapists" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/reviews", label: "Reviews" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const drawer =
    menuOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-[#0c1210]/55 backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
            />
            <div
              id="admin-mobile-nav"
              className="absolute inset-y-0 right-0 flex w-[min(20.5rem,88vw)] flex-col bg-[#1a221c] text-white shadow-2xl"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                    RoomSpa
                  </p>
                  <p className="font-display text-2xl tracking-tight">Admin</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-label="Close menu"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
                <ul className="space-y-1.5">
                  {links.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={
                            active
                              ? "flex min-h-12 items-center rounded-full bg-white px-4 text-base font-medium text-[#1a221c]"
                              : "flex min-h-12 items-center rounded-full px-4 text-base text-white/80 transition hover:bg-white/10 hover:text-white"
                          }
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="space-y-2 border-t border-white/10 px-3 py-4">
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-center justify-center rounded-full border border-white/20 text-sm font-medium text-white/90"
                >
                  View site
                </Link>
                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a221c]/95 text-white pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(126,184,164,0.22), transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 xs:px-5 md:px-8">
          <div className="flex min-h-14 items-center justify-between gap-3 py-2.5 md:min-h-[4.25rem] md:py-3">
            <Link href="/admin" className="min-w-0">
              <span className="block truncate font-display text-xl tracking-tight xs:text-2xl">
                {site.name}
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                Operations
              </span>
            </Link>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1a221c] md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                )}
              </svg>
            </button>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Link
                href="/"
                className="inline-flex min-h-10 items-center rounded-full px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                View site
              </Link>
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav
            className="hidden items-center gap-1 overflow-x-auto pb-3 scrollbar-hide md:flex"
            aria-label="Admin"
          >
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "shrink-0 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-[#1a221c]"
                      : "shrink-0 rounded-full px-3.5 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {drawer}
    </>
  );
}
