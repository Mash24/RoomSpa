"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminAlert, AdminPageHeader } from "@/components/admin/admin-ui";
import type { AdminTherapistRow } from "@/lib/therapists/types";
import { therapistStatusLabel } from "@/lib/therapists/status";

function formatAdminLocation(loc: NonNullable<AdminTherapistRow["location"]>) {
  return [loc.publicAreaSummary, loc.city, loc.region, loc.country].filter(Boolean).join(" · ");
}

export function AdminTherapistsPanel() {
  const [therapists, setTherapists] = useState<AdminTherapistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/therapists");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load.");
      setTherapists(data.therapists || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminPageHeader
        eyebrow="Team"
        title="Therapists"
        description="Manage team profiles, photos, services, and coverage areas for booking filters."
        actions={
          <Link
            href="/admin/therapists/new"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 sm:w-auto"
          >
            + Add therapist
          </Link>
        }
      />

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <ul className="admin-card-list">
            {therapists.map((t) => (
              <li key={t.id} className="admin-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{t.displayName}</p>
                    <p className="text-xs text-muted">
                      {t.slug}
                      {t.featured ? " · Featured" : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${t.status === "active" ? "text-accent" : "text-muted"}`}>
                    {therapistStatusLabel(t.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {t.location ? formatAdminLocation(t.location) : "No location set"}
                </p>
                {t.serviceSlugs.length > 0 ? (
                  <p className="mt-2 line-clamp-2 text-xs text-muted">{t.serviceSlugs.join(", ")}</p>
                ) : null}
                <Link
                  href={`/admin/therapists/${t.id}`}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground"
                >
                  Edit profile
                </Link>
              </li>
            ))}
          </ul>

          <div className="admin-table-wrap admin-table-panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Services</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {therapists.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.displayName}</p>
                    <p className="text-xs text-muted">{t.slug}{t.featured ? " · Featured" : ""}</p>
                  </td>
                  <td className="px-3 py-3 text-foreground">
                    {t.location ? formatAdminLocation(t.location) : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted">{t.serviceSlugs.join(", ") || "—"}</td>
                  <td className="px-3 py-3">
                    <span className={t.status === "active" ? "text-accent" : "text-muted"}>
                      {therapistStatusLabel(t.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/therapists/${t.id}`} className="text-accent underline-offset-2 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {therapists.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">
              No therapists yet. Run the seed SQL or add one manually.
            </p>
          ) : null}
        </div>
        </>
      )}
    </div>
  );
}
