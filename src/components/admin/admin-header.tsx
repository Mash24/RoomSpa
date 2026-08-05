"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { site } from "@/content/site";

export function AdminHeader() {
  const router = useRouter();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div>
          <Link href="/admin" className="font-display text-2xl tracking-tight text-foreground">
            {site.name} Admin
          </Link>
          <p className="text-xs text-muted">Bookings dashboard</p>
        </div>
        <div className="flex items-center gap-3">
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
