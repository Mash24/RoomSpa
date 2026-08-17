"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const linkClass = (active: boolean) =>
    active
      ? "rounded-sm bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground"
      : "rounded-sm border border-border px-3 py-2.5 text-sm text-foreground transition hover:border-accent hover:text-accent";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 xs:px-5 md:px-8">
        <div className="flex min-h-14 items-center justify-between gap-3 py-2 md:min-h-16 md:py-3">
          <div className="min-w-0">
            <Link href="/admin" className="font-display text-xl tracking-tight text-foreground xs:text-2xl">
              {site.name} Admin
            </Link>
            <p className="hidden text-xs text-muted sm:block">Operations dashboard</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="hidden min-h-10 items-center px-2 text-sm text-muted transition hover:text-accent sm:inline-flex"
              target="_blank"
              rel="noreferrer"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="hidden min-h-10 rounded-sm border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent sm:inline-flex sm:items-center"
            >
              Sign out
            </button>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground transition hover:border-accent md:hidden"
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <nav className="hidden items-center gap-2 pb-3 md:flex" aria-label="Admin">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(isActive(pathname, link.href))}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {menuOpen ? (
        <div
          id="admin-mobile-nav"
          className="fixed inset-0 top-14 z-30 flex flex-col bg-surface md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <nav className="flex-1 overflow-y-auto px-4 py-4 xs:px-5" aria-label="Admin mobile">
            <ul className="space-y-2">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex min-h-12 items-center px-3 text-base ${linkClass(active)}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-2 border-t border-border px-4 py-4 xs:px-5">
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
      ) : null}
    </header>
  );
}
