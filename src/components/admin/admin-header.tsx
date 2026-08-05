"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { site } from "@/content/site";

const links = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/reviews", label: "Reviews" },
];

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Link href="/admin" className="font-display text-2xl tracking-tight text-foreground">
            {site.name} Admin
          </Link>
          <p className="text-xs text-muted">Operations dashboard</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-2" aria-label="Admin">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
                      : "rounded-sm border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/"
            className="text-sm text-muted transition hover:text-accent"
            target="_blank"
            rel="noreferrer"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-sm border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
