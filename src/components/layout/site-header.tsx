"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site, whatsappHref } from "@/content/site";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHero = pathname === "/";

  const shell = onHero
    ? "absolute inset-x-0 top-0 z-40"
    : "sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md";

  const brand = onHero
    ? "font-display text-2xl tracking-tight text-white drop-shadow-sm md:text-[1.65rem]"
    : "font-display text-2xl tracking-tight text-foreground md:text-[1.65rem]";

  const link = onHero
    ? "text-sm text-white/80 transition hover:text-white"
    : "text-sm text-foreground/75 transition hover:text-accent";

  const book = onHero
    ? "rounded-sm bg-white px-4 py-2 text-sm font-medium text-[#1a221c] transition hover:bg-white/90"
    : "rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90";

  const menuBtn = onHero
    ? "inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/30 text-white"
    : "inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground";

  return (
    <header className={shell}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link href="/" className={brand}>
          {site.name}
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className={link}>
              {item.label}
            </Link>
          ))}
          <Link href="/my-booking" className={link}>
            My booking
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={link}
          >
            WhatsApp
          </a>
          <ThemeToggle lightOnDark={onHero} />
          <Link href="/book" className={book}>
            Book
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle lightOnDark={onHero} />
          <button
            type="button"
            className={menuBtn}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
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
              ? "animate-fade-in border-t border-white/15 bg-[rgba(18,28,24,0.94)] px-5 py-5 backdrop-blur-md md:hidden"
              : "animate-fade-in border-t border-border bg-background px-5 py-5 md:hidden"
          }
        >
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={onHero ? "text-base text-white/90" : "text-base text-foreground"}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/my-booking"
              className={onHero ? "text-base text-white/90" : "text-base text-foreground"}
              onClick={() => setOpen(false)}
            >
              My booking
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={onHero ? "text-base text-white/90" : "text-base text-foreground"}
              onClick={() => setOpen(false)}
            >
              WhatsApp us
            </a>
            <Link
              href="/book"
              className={
                onHero
                  ? "mt-2 inline-flex items-center justify-center rounded-sm bg-white px-4 py-3 text-sm font-medium text-[#1a221c]"
                  : "mt-2 inline-flex items-center justify-center rounded-sm bg-accent px-4 py-3 text-sm font-medium text-accent-foreground"
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
