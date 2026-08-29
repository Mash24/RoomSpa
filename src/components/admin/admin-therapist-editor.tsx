"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { readApiJson } from "@/lib/admin/api";
import type { AdminTherapistRow, TherapistGender, TherapistStatus } from "@/lib/therapists/types";
import { THERAPIST_STATUS_OPTIONS } from "@/lib/therapists/status";

type ServiceOption = { id: string; slug: string; name: string };
type CoverageOption = { id: string; slug: string; name: string };

type Props = { therapistId?: string };

export function AdminTherapistEditor({ therapistId }: Props) {
  const router = useRouter();
  const isNew = !therapistId;
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [coverageAreas, setCoverageAreas] = useState<CoverageOption[]>([]);

  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [gender, setGender] = useState<TherapistGender>("female");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Chiang Mai");
  const [country, setCountry] = useState("Thailand");
  const [region, setRegion] = useState("");
  const [areaLabel, setAreaLabel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState("12");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [coverageAreaIds, setCoverageAreaIds] = useState<string[]>([]);
  const [status, setStatus] = useState<TherapistStatus>("active");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/therapists");
      const data = await res.json();
      if (!res.ok) return;
      setServices(data.services || []);
      setCoverageAreas(data.coverageAreas || []);
      if (!therapistId) {
        setLoading(false);
        return;
      }
      const t = (data.therapists as AdminTherapistRow[]).find((row) => row.id === therapistId);
      if (!t) {
        setError("Therapist not found.");
        setLoading(false);
        return;
      }
      setDisplayName(t.displayName);
      setSlug(t.slug);
      setGender(t.gender);
      setDateOfBirth(t.dateOfBirth ?? "");
      setHeightCm(t.heightCm != null ? String(t.heightCm) : "");
      setWeightKg(t.weightKg != null ? String(t.weightKg) : "");
      setNationality(t.nationality ?? "");
      setEthnicity(t.ethnicity ?? "");
      setBio(t.bio);
      if (t.location) {
        setCity(t.location.city);
        setCountry(t.location.country);
        setRegion(t.location.region ?? "");
        setAreaLabel(t.location.publicAreaSummary);
        setLatitude(String(t.location.latitude));
        setLongitude(String(t.location.longitude));
        setServiceRadiusKm(String(t.location.serviceRadiusKm));
      }
      setPhotoUrls(t.media.map((p) => p.url));
      setServiceIds(t.serviceIds);
      setCoverageAreaIds(t.serviceAreaIds);
      setStatus(t.status);
      setFeatured(t.featured);
      setLoading(false);
    })();
  }, [therapistId]);

  function onNameChange(value: string) {
    setDisplayName(value);
    if (isNew) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  async function onUpload(file: File) {
    if (!slug.trim()) {
      setError("Set a slug before uploading photos.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("index", String(photoUrls.length));
      const res = await fetch("/api/admin/therapists/photo", { method: "POST", body: form });
      const data = await readApiJson<{ error?: string; url?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      if (!data.url) throw new Error("Upload completed without a photo URL. Please retry.");
      setPhotoUrls((prev) => [...prev, data.url as string]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      displayName,
      slug,
      gender,
      dateOfBirth: dateOfBirth || null,
      heightCm: heightCm || null,
      weightKg: weightKg || null,
      nationality: nationality || null,
      ethnicity,
      bio,
      location: {
        city,
        country,
        region,
        publicAreaSummary: areaLabel,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        serviceRadiusKm: Number(serviceRadiusKm || 12),
      },
      photoUrls,
      serviceIds,
      serviceAreaIds: coverageAreaIds,
      status,
      featured,
    };
    try {
      const res = await fetch(
        isNew ? "/api/admin/therapists" : `/api/admin/therapists/${therapistId}`,
        { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      router.push("/admin/therapists");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <form onSubmit={onSave} className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-4 md:space-y-8 md:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/therapists" className="text-sm text-accent">← Therapists</Link>
          <h1 className="mt-2 break-words font-display text-2xl tracking-tight text-foreground xs:text-3xl">
            {isNew ? "Add therapist" : "Edit therapist"}
          </h1>
        </div>
        <button type="submit" disabled={saving} className="hidden min-h-11 shrink-0 rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60 md:inline-flex md:items-center">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Profile</h2>
        <label className="block text-sm">
          <span className="text-muted">Display name</span>
          <input required value={displayName} onChange={(e) => onNameChange(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Slug</span>
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Gender</span>
            <select value={gender} onChange={(e) => setGender(e.target.value as TherapistGender)} className="mt-1 w-full border border-border bg-background px-3 py-2.5">
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
              <option value="unspecified">Unspecified</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Date of birth (optional)</span>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Height (cm, optional)</span>
            <input type="number" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="165" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Weight (kg, optional)</span>
            <input type="number" min={30} max={200} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="52" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Nationality (optional)</span>
            <input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Kenyan" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-muted">Ethnicity (optional)</span>
            <input value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} placeholder="e.g. African" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-muted">Bio</span>
          <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
        </label>
      </section>

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Service area</h2>
        <p className="text-xs text-muted">
          Country, province, city, and neighbourhood are shown on the public profile. Coordinates stay admin-only
          and are used for booking travel radius — they are never shown to guests.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Country</span>
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Thailand" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Province / state / county</span>
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Chiang Mai" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Chiang Mai" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Neighbourhood / area (shown to clients)</span>
            <input value={areaLabel} onChange={(e) => setAreaLabel(e.target.value)} placeholder="e.g. Nimman — near Maya" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Latitude (admin only)</span>
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="18.7990" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Longitude (admin only)</span>
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="98.9680" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Travel radius for bookings (km)</span>
            <input type="number" min={1} max={80} value={serviceRadiusKm} onChange={(e) => setServiceRadiusKm(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
        </div>
      </section>

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Photos</h2>
        <div className="flex flex-wrap gap-3">
          {photoUrls.map((url, i) => (
            <div key={url} className="relative h-24 w-20 overflow-hidden rounded-sm border border-border">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <button type="button" onClick={() => setPhotoUrls((p) => p.filter((_, j) => j !== i))} className="absolute right-0 top-0 bg-background/90 px-1 text-xs">×</button>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onUpload(f); }} />
        <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="rounded-sm border border-border px-4 py-2 text-sm hover:border-accent disabled:opacity-50">
          {uploading ? "Uploading…" : "Add photo"}
        </button>
      </section>

      <section className="admin-card space-y-3 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Services offered</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={(e) => setServiceIds((ids) => e.target.checked ? [...ids, s.id] : ids.filter((id) => id !== s.id))} />
              {s.name}
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-3 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Service areas</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {coverageAreas.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={coverageAreaIds.includes(c.id)} onChange={(e) => setCoverageAreaIds((ids) => e.target.checked ? [...ids, c.id] : ids.filter((id) => id !== c.id))} />
              {c.name}
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-3 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Visibility</h2>
        <label className="block text-sm">
          <span className="text-muted">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TherapistStatus)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          >
            {THERAPIST_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">
            {THERAPIST_STATUS_OPTIONS.find((o) => o.value === status)?.hint}
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured
        </label>
      </section>

      <div className="admin-mobile-actions">
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-12 w-full items-center justify-center rounded-sm bg-accent text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save therapist"}
        </button>
      </div>
    </form>
  );
}
