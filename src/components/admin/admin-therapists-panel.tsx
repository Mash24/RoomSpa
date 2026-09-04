"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminAlert, AdminPageHeader } from "@/components/admin/admin-ui";
import {
  ATTENTION_LABELS,
  isPublicReady,
  therapistAttentionReasons,
} from "@/lib/therapists/admin-ops";
import type { AdminTherapistRow } from "@/lib/therapists/types";

function formatCity(loc: NonNullable<AdminTherapistRow["location"]>) {
  return loc.city || loc.country || "—";
}

type Filter = "attention" | "all" | "public" | "hidden";

export function AdminTherapistsPanel() {
  const [therapists, setTherapists] = useState<AdminTherapistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("attention");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/therapists");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Could not load.");
        setTherapists(data.therapists || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleGallery(t: AdminTherapistRow) {
    const next = !t.showOnGallery;
    setTogglingId(t.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/therapists/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnGallery: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update gallery visibility.");
      setTherapists((current) =>
        current.map((row) => (row.id === t.id ? { ...row, showOnGallery: next } : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update gallery visibility.");
    } finally {
      setTogglingId(null);
    }
  }

  const withMeta = useMemo(
    () =>
      therapists.map((t) => ({
        therapist: t,
        reasons: therapistAttentionReasons(t),
        ready: isPublicReady(t),
      })),
    [therapists],
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "attention":
        return withMeta.filter((row) => row.reasons.length > 0 && row.therapist.showOnGallery);
      case "public":
        return withMeta.filter((row) => row.ready);
      case "hidden":
        return withMeta.filter((row) => !row.therapist.showOnGallery);
      default:
        return withMeta;
    }
  }, [filter, withMeta]);

  const attentionCount = withMeta.filter(
    (r) => r.reasons.length > 0 && r.therapist.showOnGallery,
  ).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminPageHeader
        eyebrow="Team"
        title="Therapists"
        description="Create quickly, then manage profiles, services, photos, and visibility from the workspace."
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

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["attention", `Needs attention (${attentionCount})`],
            ["all", "All"],
            ["public", "Public ready"],
            ["hidden", "Hidden"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === value
                ? "bg-accent text-accent-foreground"
                : "bg-surface text-muted ring-1 ring-border hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <ul className="admin-card-list">
            {filtered.map(({ therapist: t, reasons, ready }) => (
              <li key={t.id} className="admin-card p-4">
                <p className="font-medium text-foreground">{t.displayName}</p>
                <p className="mt-1 text-sm text-muted">
                  {t.showOnGallery ? "Visible" : "Hidden"} ·{" "}
                  {t.acceptingBookings ? "Accepting" : "Not accepting"} ·{" "}
                  {t.location ? formatCity(t.location) : "—"}
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  {ready
                    ? "✓ Public ready"
                    : reasons.map((r) => ATTENTION_LABELS[r]).join(" · ") || "Not ready"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={togglingId === t.id}
                    onClick={() => void toggleGallery(t)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-3 text-sm font-medium disabled:opacity-60"
                  >
                    {togglingId === t.id
                      ? "…"
                      : t.showOnGallery
                        ? "Hide"
                        : "Show"}
                  </button>
                  <Link
                    href={`/admin/therapists/${t.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="admin-table-wrap admin-table-panel overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Therapist</th>
                  <th className="px-3 py-3 font-medium">Gallery</th>
                  <th className="px-3 py-3 font-medium">Booking</th>
                  <th className="px-3 py-3 font-medium">Readiness</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ therapist: t, reasons, ready }) => (
                  <tr key={t.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{t.displayName}</p>
                      <p className="text-xs text-muted">{t.slug}</p>
                    </td>
                    <td className="px-3 py-3">
                      {t.showOnGallery ? (
                        <span className="text-accent">Visible</span>
                      ) : (
                        <span className="text-muted">Hidden</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {t.acceptingBookings ? (
                        <span className="text-foreground">Accepting</span>
                      ) : (
                        <span className="text-muted">Not accepting</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {ready ? (
                        <span className="text-accent">✓ Public ready</span>
                      ) : (
                        <span className="text-amber-800">
                          {reasons.map((r) => ATTENTION_LABELS[r]).join(" · ") || "Not ready"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {t.location ? formatCity(t.location) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={togglingId === t.id}
                          onClick={() => void toggleGallery(t)}
                          className="text-sm text-muted underline-offset-2 hover:text-foreground hover:underline disabled:opacity-60"
                        >
                          {togglingId === t.id
                            ? "…"
                            : t.showOnGallery
                              ? "Hide"
                              : "Show"}
                        </button>
                        <Link
                          href={`/admin/therapists/${t.id}`}
                          className="text-sm text-accent underline-offset-2 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted">No therapists in this view.</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
