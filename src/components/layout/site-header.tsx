"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, whatsappHref } from "@/content/site";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHero = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const shell = onHero
    ? "absolute inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]"
    : "sticky top-0 z-40 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md";

  const brand = onHero
    ? "font-display text-[1.35rem] tracking-tight text-white drop-shadow-sm xs:text-2xl md:text-[1.65rem]"
    : "font-display text-[1.35rem] tracking-tight text-foreground xs:text-2xl md:text-[1.65rem]";

  const link = onHero
    ? "text-sm text-white/80 transition hover:text-white"
    : "text-sm text-foreground/75 transition hover:text-accent";

  const book = onHero
    ? "inline-flex min-h-10 items-center justify-center rounded-sm bg-white px-3 py-2 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 xs:px-4"
    : "inline-flex min-h-10 items-center justify-center rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 xs:px-4";

  const menuBtn = onHero
    ? "inline-flex h-11 w-11 items-center justify-center rounded-sm border border-white/30 text-white"
    : "inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground";

  return (
    <header className={shell}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 xs:px-5 xs:py-4 md:gap-4 md:px-8 md:py-5">
        <Link href="/" className={`${brand} min-w-0 truncate`}>
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex lg:gap-7" aria-label="Primary">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className={link}>
              {item.label}
            </Link>
          ))}
          <Link href="/my-booking" className={link}>
            My booking
          </Link>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className={link}>
            WhatsApp
          </a>
          <ThemeToggle lightOnDark={onHero} />
          <Link href="/book" className={book}>
            Book
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 xs:gap-2 lg:hidden">
          <ThemeToggle lightOnDark={onHero} />
          <Link href="/book" className={book}>
            Book
          </Link>
          <button
            type="button"
            className={menuBtn}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className={
            onHero
              ? "animate-fade-in max-h-[min(80vh,32rem)] overflow-y-auto border-t border-white/15 bg-[rgba(18,28,24,0.96)] px-4 py-5 backdrop-blur-md xs:px-5 lg:hidden"
              : "animate-fade-in max-h-[min(80vh,32rem)] overflow-y-auto border-t border-border bg-background px-4 py-5 xs:px-5 lg:hidden"
          }
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  onHero
                    ? "min-h-11 rounded-sm px-1 py-2.5 text-base text-white/90"
                    : "min-h-11 rounded-sm px-1 py-2.5 text-base text-foreground"
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/my-booking"
              className={
                onHero
                  ? "min-h-11 rounded-sm px-1 py-2.5 text-base text-white/90"
                  : "min-h-11 rounded-sm px-1 py-2.5 text-base text-foreground"
              }
              onClick={() => setOpen(false)}
            >
              My booking
            </Link>
            <Link
              href="/coverage"
              className={
                onHero
                  ? "min-h-11 rounded-sm px-1 py-2.5 text-base text-white/90"
                  : "min-h-11 rounded-sm px-1 py-2.5 text-base text-foreground"
              }
              onClick={() => setOpen(false)}
            >
              Coverage
            </Link>
            <Link
              href="/contact"
              className={
                onHero
                  ? "min-h-11 rounded-sm px-1 py-2.5 text-base text-white/90"
                  : "min-h-11 rounded-sm px-1 py-2.5 text-base text-foreground"
              }
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={
                onHero
                  ? "min-h-11 rounded-sm px-1 py-2.5 text-base text-white/90"
                  : "min-h-11 rounded-sm px-1 py-2.5 text-base text-foreground"
              }
              onClick={() => setOpen(false)}
            >
              WhatsApp us
            </a>
            <Link
              href="/book"
              className={
                onHero
                  ? "mt-3 inline-flex min-h-12 items-center justify-center rounded-sm bg-white px-4 py-3 text-sm font-medium text-[#1a221c]"
                  : "mt-3 inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-4 py-3 text-sm font-medium text-accent-foreground"
              }
              onClick={() => setOpen(false)}
            >
              Book an appointment
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
