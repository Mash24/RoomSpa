"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  IconClose,
  IconEye,
  IconEyeOff,
  IconPen,
  IconTrash,
} from "@/components/admin/admin-icons";
import { TherapistPhotoGallery } from "@/components/therapists/therapist-photo-gallery";
import { computeAgeFromDob, formatHeightCm, formatWeightKg } from "@/lib/therapists/profile";
import type { AdminTherapistRow } from "@/lib/therapists/types";

type Props = { therapistId: string };

const iconBtn =
  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border disabled:opacity-60 xs:min-h-11 xs:min-w-11";
const iconClass = "h-4 w-4 xs:h-5 xs:w-5";

export function AdminTherapistPreview({ therapistId }: Props) {
  const router = useRouter();
  const [therapist, setTherapist] = useState<AdminTherapistRow | null>(null);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [areaNames, setAreaNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/therapists");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load.");
      const t = (data.therapists as AdminTherapistRow[]).find((row) => row.id === therapistId);
      if (!t) throw new Error("Therapist not found.");
      setTherapist(t);

      const names: Record<string, string> = {};
      for (const s of data.services || []) {
        names[String(s.id)] = String(s.name);
      }
      setServiceNames(names);

      const areas: Record<string, string> = {};
      for (const a of data.coverageAreas || []) {
        areas[String(a.id)] = String(a.name);
      }
      setAreaNames(areas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load.");
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleGallery() {
    if (!therapist) return;
    const next = !therapist.showOnGallery;
    setToggling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/therapists/${therapist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnGallery: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update gallery visibility.");
      setTherapist({ ...therapist, showOnGallery: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update gallery visibility.");
    } finally {
      setToggling(false);
    }
  }

  async function removeTherapist() {
    if (!therapist) return;
    const confirmed = window.confirm(
      `Permanently delete ${therapist.displayName} from the database?\n\nThis cannot be undone. Past bookings stay, but their therapist link is cleared.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/therapists/${therapist.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete therapist.");
      router.push("/admin/therapists");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete therapist.");
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="px-4 py-12 text-sm text-muted">Loading profile…</p>;
  }

  if (!therapist) {
    return (
      <div className="space-y-4 px-4 py-12">
        <p className="text-sm text-red-700">{error || "Therapist not found."}</p>
        <Link href="/admin/therapists" className="text-sm text-accent underline-offset-2 hover:underline">
          ← Back to therapists
        </Link>
      </div>
    );
  }

  const photos = therapist.media
    .filter((m) => m.type === "photo")
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  const age = computeAgeFromDob(therapist.dateOfBirth, therapist.showAge);
  const height = formatHeightCm(therapist.heightCm, therapist.showHeight);
  const weight = formatWeightKg(therapist.weightKg, therapist.showWeight);
  const languages = therapist.languages.length ? therapist.languages.join(" · ") : null;
  const experience =
    therapist.yearsExperience != null
      ? `${therapist.yearsExperience} year${therapist.yearsExperience === 1 ? "" : "s"} experience`
      : null;
  const busy = toggling || deleting;

  return (
    <div className="pb-28">
      <article className="mx-auto max-w-3xl px-4 pt-6 xs:px-5 md:px-8 md:pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Admin preview</p>
        <p className="mt-1 text-sm text-muted">Read-only view — use the bar below to act.</p>

        {error ? (
          <div className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="mt-6">
          <TherapistPhotoGallery photos={photos} displayName={therapist.displayName} />
        </div>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl tracking-tight text-foreground xs:text-4xl md:text-5xl">
              {therapist.displayName}
            </h1>
            {therapist.verified ? (
              <span className="text-sm font-medium text-accent">Verified</span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 ${
                therapist.showOnGallery
                  ? "bg-accent/15 text-accent"
                  : "bg-surface text-muted ring-1 ring-border"
              }`}
            >
              {therapist.showOnGallery ? "Visible on gallery" : "Hidden from gallery"}
            </span>
            <span className="rounded-full bg-surface px-2.5 py-1 text-muted ring-1 ring-border">
              {therapist.acceptingBookings ? "Accepting bookings" : "Not accepting"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {languages ? <span>{languages}</span> : null}
            {experience ? <span>{experience}</span> : null}
            {age != null ? <span>{age}</span> : null}
            {height ? <span>{height}</span> : null}
            {weight ? <span>{weight}</span> : null}
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Location</h2>
          <dl className="mt-3 grid gap-3 text-base text-foreground sm:grid-cols-2">
            {therapist.location?.city ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">City</dt>
                <dd className="mt-1">{therapist.location.city}</dd>
              </div>
            ) : null}
            {therapist.location?.region ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">Province / state</dt>
                <dd className="mt-1">{therapist.location.region}</dd>
              </div>
            ) : null}
            {therapist.location?.country ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">Country</dt>
                <dd className="mt-1">{therapist.location.country}</dd>
              </div>
            ) : null}
            {therapist.nationality && therapist.showNationality ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">Nationality</dt>
                <dd className="mt-1">{therapist.nationality}</dd>
              </div>
            ) : null}
          </dl>
          {therapist.location?.publicAreaSummary ? (
            <p className="mt-3 text-sm text-muted">
              <span className="block text-xs uppercase tracking-[0.12em]">Neighbourhood</span>
              <span className="mt-1 block text-foreground">{therapist.location.publicAreaSummary}</span>
            </p>
          ) : null}
          {therapist.serviceAreaIds.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {therapist.serviceAreaIds.map((id) => (
                <li key={id} className="rounded-sm px-3 py-1.5 text-sm text-foreground ring-1 ring-border">
                  {areaNames[id] || id}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {therapist.bio ? (
          <section className="mt-10">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">About</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{therapist.bio}</p>
          </section>
        ) : null}

        {therapist.training ? (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Training</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{therapist.training}</p>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Services</h2>
          {therapist.serviceIds.length ? (
            <ul className="mt-4 divide-y divide-border">
              {therapist.serviceIds.map((id) => {
                const q = therapist.serviceQualifications.find((row) => row.serviceId === id);
                return (
                  <li key={id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="font-medium text-foreground">{serviceNames[id] || id}</span>
                    <span className="text-xs text-muted">
                      {[
                        q?.claimed ? "Claimed" : null,
                        q?.tested ? "Tested" : null,
                        q?.approved ? "Approved" : "Pending",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No services linked yet.</p>
          )}
        </section>

        {therapist.phone || therapist.internalNotes ? (
          <section className="mt-10 rounded-sm border border-border bg-surface/60 p-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Internal only</h2>
            {therapist.phone ? (
              <p className="mt-3 text-sm text-foreground">
                <span className="text-muted">Phone · </span>
                {therapist.phone}
              </p>
            ) : null}
            {therapist.internalNotes ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{therapist.internalNotes}</p>
            ) : null}
          </section>
        ) : null}
      </article>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur-md xs:px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 xs:gap-2.5 sm:gap-3">
          <Link
            href="/admin/therapists"
            title="Back to list"
            aria-label="Back to therapists list"
            className={`${iconBtn} border-border text-muted hover:text-foreground`}
          >
            <IconClose className={iconClass} />
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleGallery()}
            title={therapist.showOnGallery ? "Hide from gallery" : "Show on gallery"}
            aria-label={therapist.showOnGallery ? "Hide from gallery" : "Show on gallery"}
            className={`${iconBtn} border-border text-muted hover:text-foreground`}
          >
            {toggling ? (
              <span className="text-xs">…</span>
            ) : therapist.showOnGallery ? (
              <IconEye className={iconClass} />
            ) : (
              <IconEyeOff className={iconClass} />
            )}
          </button>
          <Link
            href={`/admin/therapists/${therapist.id}`}
            title="Edit"
            aria-label={`Edit ${therapist.displayName}`}
            className={`${iconBtn} border-transparent bg-accent text-accent-foreground`}
          >
            <IconPen className={iconClass} />
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void removeTherapist()}
            title="Delete permanently"
            aria-label={`Delete ${therapist.displayName}`}
            className={`${iconBtn} border-red-300 text-red-700`}
          >
            {deleting ? <span className="text-xs">…</span> : <IconTrash className={iconClass} />}
          </button>
        </div>
      </div>
    </div>
  );
}
