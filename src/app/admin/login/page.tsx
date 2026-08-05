import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">RoomSpa admin</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground">Sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Manage bookings, confirm appointments, and track revenue.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
