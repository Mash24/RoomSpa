"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminAlert, AdminPageHeader } from "@/components/admin/admin-ui";
import type { AdminTherapistRow } from "@/lib/therapists/types";

function formatCity(loc: NonNullable<AdminTherapistRow["location"]>) {
  return loc.city || loc.country || "—";
}

function primaryPhotoUrl(t: AdminTherapistRow): string | null {
  const photos = t.media.filter((m) => m.type === "photo");
  const primary = photos.find((m) => m.isPrimary);
  return primary?.url ?? photos[0]?.url ?? null;
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75l16.5 16.5M9.88 9.94A2.75 2.75 0 0 0 14.06 14.1M6.6 6.74C4.3 8.2 2.7 10.4 2.25 12c0 0 3.75 6.75 9.75 6.75 1.7 0 3.2-.4 4.5-1.02M10.4 5.4A10.4 10.4 0 0 1 12 5.25c6 0 9.75 6.75 9.75 6.75a17.4 17.4 0 0 1-2.4 3.05"
      />
    </svg>
  );
}

function IconPen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.86 3.86a2.12 2.12 0 0 1 3 3L8.25 18.47 4.5 19.5l1.03-3.75L16.86 3.86Z"
      />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 7.5h15M9.75 7.5V5.25A1.5 1.5 0 0 1 11.25 3.75h1.5a1.5 1.5 0 0 1 1.5 1.5V7.5m2.25 0V18a1.5 1.5 0 0 1-1.5 1.5h-7.5A1.5 1.5 0 0 1 6 18V7.5h12Z"
      />
    </svg>
  );
}

const iconBtn =
  "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border disabled:opacity-60 xs:min-h-10 xs:min-w-10 sm:min-h-11 sm:min-w-11";
const iconClass = "h-4 w-4 xs:h-[1.05rem] xs:w-[1.05rem] sm:h-5 sm:w-5";

type Filter = "all" | "visible" | "hidden";

export function AdminTherapistsPanel() {
  const [therapists, setTherapists] = useState<AdminTherapistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function removeTherapist(t: AdminTherapistRow) {
    const confirmed = window.confirm(
      `Permanently delete ${t.displayName} from the database?\n\nThis cannot be undone. Past bookings stay, but their therapist link is cleared.`,
    );
    if (!confirmed) return;

    setDeletingId(t.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/therapists/${t.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete therapist.");
      setTherapists((current) => current.filter((row) => row.id !== t.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete therapist.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    switch (filter) {
      case "visible":
        return therapists.filter((t) => t.showOnGallery);
      case "hidden":
        return therapists.filter((t) => !t.showOnGallery);
      default:
        return therapists;
    }
  }, [filter, therapists]);

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminPageHeader
        eyebrow="Team"
        title="Therapists"
        description="Create quickly, then manage profiles, services, photos, and visibility from the workspace."
        actions={
          <Link
            href="/admin/therapists/new"
            className="inline-flex min-h-9 w-full items-center justify-center rounded-full bg-white px-4 text-xs font-medium text-[#1a221c] transition hover:bg-white/90 xs:min-h-10 xs:px-5 xs:text-sm sm:min-h-11 sm:w-auto"
          >
            + Add therapist
          </Link>
        }
      />

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      <div className="flex flex-wrap gap-1.5 xs:gap-2">
        {(
          [
            ["all", "All"],
            ["visible", "Visible"],
            ["hidden", "Hidden"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-2.5 py-1 text-[0.7rem] font-medium transition xs:px-3 xs:py-1.5 xs:text-xs ${
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
            {filtered.map((t) => {
              const photo = primaryPhotoUrl(t);
              const busy = togglingId === t.id || deletingId === t.id;
              return (
                <li key={t.id} className="admin-card p-4">
                  <div className="flex gap-2.5 xs:gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-surface ring-1 ring-border xs:h-20 xs:w-16">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={t.displayName}
                          fill
                          sizes="(max-width: 384px) 48px, 64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[0.6rem] text-muted xs:text-[0.65rem]">
                          No photo
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground xs:text-base">{t.displayName}</p>
                      <p className="mt-0.5 text-xs text-muted xs:mt-1 xs:text-sm">
                        {t.showOnGallery ? "Visible" : "Hidden"} ·{" "}
                        {t.acceptingBookings ? "Accepting" : "Not accepting"} ·{" "}
                        {t.location ? formatCity(t.location) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 xs:gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleGallery(t)}
                      title={t.showOnGallery ? "Hide from gallery" : "Show on gallery"}
                      aria-label={t.showOnGallery ? "Hide from gallery" : "Show on gallery"}
                      className={`${iconBtn} border-border text-muted hover:text-foreground`}
                    >
                      {togglingId === t.id ? (
                        <span className="text-xs">…</span>
                      ) : t.showOnGallery ? (
                        <IconEye className={iconClass} />
                      ) : (
                        <IconEyeOff className={iconClass} />
                      )}
                    </button>
                    <Link
                      href={`/admin/therapists/${t.id}`}
                      title="Edit"
                      aria-label={`Edit ${t.displayName}`}
                      className={`${iconBtn} border-transparent bg-accent text-accent-foreground`}
                    >
                      <IconPen className={iconClass} />
                    </Link>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeTherapist(t)}
                      title="Delete permanently"
                      aria-label={`Delete ${t.displayName}`}
                      className={`${iconBtn} border-red-300 text-red-700`}
                    >
                      {deletingId === t.id ? (
                        <span className="text-xs">…</span>
                      ) : (
                        <IconTrash className={iconClass} />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="admin-table-wrap admin-table-panel overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Therapist</th>
                  <th className="px-3 py-3 font-medium">Gallery</th>
                  <th className="px-3 py-3 font-medium">Booking</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const photo = primaryPhotoUrl(t);
                  const busy = togglingId === t.id || deletingId === t.id;
                  return (
                    <tr key={t.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-surface ring-1 ring-border">
                            {photo ? (
                              <Image
                                src={photo}
                                alt={t.displayName}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-[0.55rem] text-muted">
                                —
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{t.displayName}</p>
                            <p className="text-xs text-muted">{t.slug}</p>
                          </div>
                        </div>
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
                      <td className="px-3 py-3 text-foreground">
                        {t.location ? formatCity(t.location) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5 xs:gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void toggleGallery(t)}
                            title={t.showOnGallery ? "Hide from gallery" : "Show on gallery"}
                            aria-label={t.showOnGallery ? "Hide from gallery" : "Show on gallery"}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground disabled:opacity-60"
                          >
                            {togglingId === t.id ? (
                              <span className="text-xs">…</span>
                            ) : t.showOnGallery ? (
                              <IconEye className="h-4 w-4" />
                            ) : (
                              <IconEyeOff className="h-4 w-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/therapists/${t.id}`}
                            title="Edit"
                            aria-label={`Edit ${t.displayName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-accent transition hover:bg-surface"
                          >
                            <IconPen className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeTherapist(t)}
                            title="Delete permanently"
                            aria-label={`Delete ${t.displayName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingId === t.id ? (
                              <span className="text-xs">…</span>
                            ) : (
                              <IconTrash className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
