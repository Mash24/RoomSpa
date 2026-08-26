import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="admin-shell relative flex min-h-screen items-center justify-center px-5 py-12 md:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(47,93,80,0.18), transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(126,184,164,0.16), transparent 40%)",
        }}
        aria-hidden
      />
      <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 shadow-[0_20px_60px_rgba(26,34,28,0.12)] xs:p-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
          RoomSpa admin
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Manage bookings, confirm appointments, and track performance.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
