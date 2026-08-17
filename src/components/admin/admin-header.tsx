"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { site } from "@/content/site";

const links = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/tickets", label: "Care chats" },
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

  const desktopLinkClass = (active: boolean) =>
    active
      ? "rounded-sm bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground"
      : "rounded-sm px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-accent-soft hover:text-foreground";

  const drawer = menuOpen && mounted
    ? createPortal(
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="admin-mobile-nav"
            className="absolute inset-y-0 right-0 flex w-[min(20.5rem,88vw)] flex-col bg-surface-elevated shadow-2xl"
            style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="font-display text-xl tracking-tight text-foreground">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-foreground text-background"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin">
              <ul className="space-y-1">
                {links.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={
                          active
                            ? "flex min-h-12 items-center rounded-sm bg-accent px-3 text-base font-medium text-accent-foreground"
                            : "flex min-h-12 items-center rounded-sm px-3 text-base text-foreground hover:bg-accent-soft"
                        }
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="space-y-2 border-t border-border px-3 py-3">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-center rounded-sm border border-border text-sm font-medium text-foreground"
              >
                View site
              </Link>
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="flex min-h-12 w-full items-center justify-center rounded-sm border border-border text-sm font-medium text-foreground"
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
      <header className="sticky top-0 z-40 border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-6xl px-4 xs:px-5 md:px-8">
          <div className="flex min-h-14 items-center justify-between gap-3 py-2 md:min-h-16 md:py-3">
            <Link href="/admin" className="min-w-0 truncate font-display text-xl tracking-tight text-foreground xs:text-2xl">
              {site.name}
              <span className="ml-2 text-sm font-sans font-medium tracking-normal text-muted">Admin</span>
            </Link>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-foreground text-background md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
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
                className="inline-flex min-h-10 items-center px-2 text-sm text-muted transition hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                View site
              </Link>
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="inline-flex min-h-10 items-center rounded-sm border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav className="hidden items-center gap-1 overflow-x-auto pb-3 md:flex" aria-label="Admin">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={desktopLinkClass(isActive(pathname, link.href))}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {drawer}
    </>
  );
}
