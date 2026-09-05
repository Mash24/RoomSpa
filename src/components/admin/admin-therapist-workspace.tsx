"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readApiJson } from "@/lib/admin/api";
import { getCatalogProduct, isSignatureExperience } from "@/content/services";
import type {
  AdminTherapistRow,
  MediaApprovalStatus,
  ServiceQualification,
  TherapistGender,
} from "@/lib/therapists/types";

type ServiceOption = { id: string; slug: string; name: string };
type CoverageOption = { id: string; slug: string; name: string };

type PhotoDraft = {
  url: string;
  approvalStatus: MediaApprovalStatus;
  isPrimary: boolean;
};

type TabId = "overview" | "profile" | "services" | "photos" | "location" | "quality";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "services", label: "Services" },
  { id: "photos", label: "Photos" },
  { id: "location", label: "Location" },
  { id: "quality", label: "Quality" },
];

const SCORE_FIELDS = [
  { key: "skillScore", label: "Skill" },
  { key: "professionalismScore", label: "Professionalism" },
  { key: "communicationScore", label: "Communication" },
  { key: "reliabilityScore", label: "Reliability" },
  { key: "punctualityScore", label: "Punctuality" },
  { key: "feedbackScore", label: "Customer feedback" },
] as const;

type Props = { therapistId: string };

export function AdminTherapistWorkspace({ therapistId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [coverageAreas, setCoverageAreas] = useState<CoverageOption[]>([]);
  const [verified, setVerified] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [gender, setGender] = useState<TherapistGender>("female");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [training, setTraining] = useState("");
  const [phone, setPhone] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [city, setCity] = useState("Chiang Mai");
  const [country, setCountry] = useState("Thailand");
  const [region, setRegion] = useState("");
  const [areaLabel, setAreaLabel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState("12");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<Record<string, ServiceQualification>>({});
  const [coverageAreaIds, setCoverageAreaIds] = useState<string[]>([]);
  const [showOnGallery, setShowOnGallery] = useState(true);
  const [acceptingBookings, setAcceptingBookings] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [scores, setScores] = useState<Record<(typeof SCORE_FIELDS)[number]["key"], string>>({
    skillScore: "",
    professionalismScore: "",
    communicationScore: "",
    reliabilityScore: "",
    punctualityScore: "",
    feedbackScore: "",
  });
  const [addServiceId, setAddServiceId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/therapists");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load.");
      setServices(data.services || []);
      setCoverageAreas(data.coverageAreas || []);
      const t = (data.therapists as AdminTherapistRow[]).find((row) => row.id === therapistId);
      if (!t) throw new Error("Therapist not found.");

      setDisplayName(t.displayName);
      setSlug(t.slug);
      setGender(t.gender);
      setDateOfBirth(t.dateOfBirth ?? "");
      setHeightCm(t.heightCm != null ? String(t.heightCm) : "");
      setWeightKg(t.weightKg != null ? String(t.weightKg) : "");
      setNationality(t.nationality ?? "");
      setBio(t.bio);
      setLanguages((t.languages || []).join(", "));
      setYearsExperience(t.yearsExperience != null ? String(t.yearsExperience) : "");
      setTraining(t.training || "");
      setPhone(t.phone ?? "");
      setInternalNotes(t.internalNotes || "");
      if (t.location) {
        setCity(t.location.city);
        setCountry(t.location.country);
        setRegion(t.location.region ?? "");
        setAreaLabel(t.location.publicAreaSummary);
        setLatitude(String(t.location.latitude));
        setLongitude(String(t.location.longitude));
        setServiceRadiusKm(String(t.location.serviceRadiusKm));
      }
      const loadedPhotos = t.media.map((p) => ({
        url: p.url,
        approvalStatus: p.approvalStatus || "pending",
        isPrimary: Boolean(p.isPrimary),
      }));
      if (loadedPhotos.length > 0 && !loadedPhotos.some((p) => p.isPrimary)) {
        loadedPhotos[0] = { ...loadedPhotos[0], isPrimary: true };
      }
      setPhotos(loadedPhotos);
      setServiceIds(t.serviceIds);
      const quals: Record<string, ServiceQualification> = {};
      for (const q of t.serviceQualifications || []) quals[q.serviceId] = q;
      for (const id of t.serviceIds) {
        if (!quals[id]) {
          quals[id] = { serviceId: id, claimed: true, tested: false, approved: false, active: true };
        }
      }
      setQualifications(quals);
      setCoverageAreaIds(t.serviceAreaIds);
      setShowOnGallery(t.showOnGallery === true);
      setAcceptingBookings(t.acceptingBookings !== false);
      setFeatured(t.featured);
      setVerified(t.verified);
      setScores({
        skillScore: t.skillScore != null ? String(t.skillScore) : "",
        professionalismScore: t.professionalismScore != null ? String(t.professionalismScore) : "",
        communicationScore: t.communicationScore != null ? String(t.communicationScore) : "",
        reliabilityScore: t.reliabilityScore != null ? String(t.reliabilityScore) : "",
        punctualityScore: t.punctualityScore != null ? String(t.punctualityScore) : "",
        feedbackScore: t.feedbackScore != null ? String(t.feedbackScore) : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load.");
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function isSignatureService(slug: string) {
    const product = getCatalogProduct(slug);
    return product ? isSignatureExperience(product) : false;
  }

  const readiness = useMemo(() => {
    const items = [
      { id: "name", label: "Display name", done: Boolean(displayName.trim()) },
      { id: "city", label: "City", done: Boolean(city.trim()) },
      { id: "languages", label: "Languages", done: Boolean(languages.trim()) },
      { id: "bio", label: "Bio", done: Boolean(bio.trim()) },
      { id: "experience", label: "Experience", done: Boolean(yearsExperience.trim()) },
      { id: "training", label: "Training", done: Boolean(training.trim()) },
      {
        id: "photo",
        label: "Main photo",
        done: photos.some((p) => p.isPrimary && p.approvalStatus === "approved"),
      },
      {
        id: "service",
        label: "At least one approved service",
        done: Object.values(qualifications).some((q) => q.approved),
      },
    ];
    const doneCount = items.filter((i) => i.done).length;
    return {
      items,
      percent: Math.round((doneCount / items.length) * 100),
    };
  }, [
    displayName,
    city,
    languages,
    bio,
    yearsExperience,
    training,
    photos,
    qualifications,
  ]);

  async function patch(payload: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setNotice("Saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTherapist() {
    const name = displayName || "this therapist";
    const confirmed = window.confirm(
      `Permanently delete ${name} from the database?\n\nThis cannot be undone. Past bookings stay, but their therapist link is cleared.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete therapist.");
      router.push("/admin/therapists");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete therapist.");
      setDeleting(false);
    }
  }

  async function saveProfile() {
    await patch({
      displayName,
      slug,
      gender,
      dateOfBirth: dateOfBirth || null,
      heightCm: heightCm || null,
      weightKg: weightKg || null,
      nationality: nationality || null,
      bio,
      languages,
      yearsExperience: yearsExperience || null,
      training,
      phone: phone || null,
    });
  }

  async function saveVisibility() {
    await patch({
      showOnGallery,
      acceptingBookings,
      featured,
      status: "active",
    });
  }

  async function saveServices() {
    await patch({
      serviceIds,
      serviceQualifications: serviceIds.map(
        (id) =>
          qualifications[id] || {
            serviceId: id,
            claimed: true,
            tested: false,
            approved: false,
            active: true,
          },
      ),
    });
  }

  async function savePhotos() {
    const mediaApprovals: Record<string, string> = {};
    for (const photo of photos) mediaApprovals[photo.url] = photo.approvalStatus;
    await patch({
      photoUrls: photos.map((p) => p.url),
      primaryPhotoUrl: photos.find((p) => p.isPrimary)?.url || photos[0]?.url || null,
      mediaApprovals,
    });
  }

  async function saveLocation() {
    await patch({
      location: {
        city,
        country,
        region,
        publicAreaSummary: areaLabel,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        serviceRadiusKm: Number(serviceRadiusKm || 12),
      },
      serviceAreaIds: coverageAreaIds,
    });
  }

  async function saveQuality() {
    await patch({
      internalNotes,
      ...Object.fromEntries(
        SCORE_FIELDS.map(({ key }) => [key, scores[key] ? Number(scores[key]) : null]),
      ),
    });
  }

  async function onUpload(file: File) {
    if (!slug.trim()) {
      setError("Set a slug on the Profile tab before uploading.");
      return;
    }
    setUploading(true);
    setError(null);
    setUploadNote(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("index", String(photos.length));
      const res = await fetch("/api/admin/therapists/photo", { method: "POST", body: form });
      const data = await readApiJson<{ error?: string; url?: string; fallbackOriginal?: boolean }>(res);
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      if (!data.url) throw new Error("Upload completed without a photo URL.");
      setPhotos((prev) => [
        ...prev,
        { url: data.url as string, approvalStatus: "pending", isPrimary: prev.length === 0 },
      ]);
      setUploadNote("Uploaded — set as main and approve when ready, then Save photos.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function addService(id: string) {
    if (!id || serviceIds.includes(id)) return;
    setServiceIds((ids) => [...ids, id]);
    setQualifications((prev) => ({
      ...prev,
      [id]: { serviceId: id, claimed: true, tested: false, approved: false, active: true },
    }));
    setAddServiceId("");
  }

  function removeService(id: string) {
    setServiceIds((ids) => ids.filter((x) => x !== id));
    setQualifications((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function patchQualification(serviceId: string, patchQ: Partial<ServiceQualification>) {
    setQualifications((prev) => {
      const current = prev[serviceId] || {
        serviceId,
        claimed: true,
        tested: false,
        approved: false,
        active: true,
      };
      let next = { ...current, ...patchQ, serviceId };
      if (patchQ.approved && !next.tested) next = { ...next, tested: true, claimed: true };
      if (patchQ.tested && !next.claimed) next = { ...next, claimed: true };
      if (patchQ.claimed === false) next = { ...next, claimed: false, tested: false, approved: false };
      if (patchQ.tested === false) next = { ...next, tested: false, approved: false };
      return { ...prev, [serviceId]: next };
    });
  }

  const availableToAdd = services.filter((s) => !serviceIds.includes(s.id));

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <div>
        <Link href="/admin/therapists" className="text-sm text-accent">
          ← Therapists
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl tracking-tight text-foreground xs:text-3xl">
              {displayName || "Therapist"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {[city, showOnGallery ? "Visible on gallery" : "Hidden from gallery"].filter(Boolean).join(" · ")}
              {verified ? " · Verified" : ""}
            </p>
          </div>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {notice ? <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div> : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setNotice(null);
              setTab(t.id);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-accent text-accent-foreground"
                : "bg-surface text-muted ring-1 ring-border hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-4">
          <section className="admin-card space-y-4 p-4 xs:p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Customer-facing</h2>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={showOnGallery}
                onChange={(e) => setShowOnGallery(e.target.checked)}
              />
              <span>
                <span className="font-medium text-foreground">Show on therapist gallery</span>
                <span className="mt-0.5 block text-xs text-muted">
                  When off, they disappear from /therapists and public search.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={acceptingBookings}
                onChange={(e) => setAcceptingBookings(e.target.checked)}
              />
              <span>
                <span className="font-medium text-foreground">Accepting bookings</span>
                <span className="mt-0.5 block text-xs text-muted">
                  Controls the Request CTA. Profile can stay visible while this is off.
                </span>
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured
            </label>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveVisibility()}
              className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </section>

          <section className="admin-card space-y-3 p-4 xs:p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Profile readiness</h2>
              <span className="text-sm font-medium text-foreground">{readiness.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-accent transition-all" style={{ width: `${readiness.percent}%` }} />
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {readiness.items.map((item) => (
                <li key={item.id} className={item.done ? "text-foreground" : "text-muted"}>
                  {item.done ? "✓" : "○"} {item.label}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted">
              Verified badge is automatic when the therapist is public-ready (approved photo + approved services).
            </p>
          </section>

          <section className="admin-card space-y-3 border border-red-200/80 p-4 xs:p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-red-700">Remove therapist</h2>
            <p className="text-sm text-muted">
              Permanently deletes this therapist and their photos, services, and location from the database.
              Past bookings are kept with the therapist link cleared.
            </p>
            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => void removeTherapist()}
              className="rounded-sm border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
          </section>
        </div>
      ) : null}

      {tab === "profile" ? (
        <section className="admin-card space-y-4 p-4 xs:p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Public profile</h2>
          <label className="block text-sm">
            <span className="text-muted">Display name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Slug</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
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
              <span className="text-muted">Country</span>
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Thailand" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Languages</span>
              <input value={languages} onChange={(e) => setLanguages(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Years experience</span>
              <input type="number" min={0} max={60} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-muted">Bio</span>
            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Training</span>
            <textarea rows={2} value={training} onChange={(e) => setTraining(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>

          <button
            type="button"
            className="text-sm text-accent hover:underline"
            onClick={() => setShowOptionalProfile((v) => !v)}
          >
            {showOptionalProfile ? "Hide optional fields" : "Optional fields"}
          </button>
          {showOptionalProfile ? (
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-muted">Date of birth</span>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
              <label className="block text-sm">
                <span className="text-muted">Height (cm)</span>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
              <label className="block text-sm">
                <span className="text-muted">Weight (kg)</span>
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
            </div>
          ) : null}

          <button
            type="button"
            disabled={saving}
            onClick={() => void saveProfile()}
            className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </section>
      ) : null}

      {tab === "services" ? (
        <section className="admin-card space-y-4 p-4 xs:p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Services</h2>
          <p className="text-xs text-muted">Add only what they offer. Move claimed → tested → approved when ready.</p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={addServiceId}
              onChange={(e) => setAddServiceId(e.target.value)}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Add a service…</option>
              <optgroup label="Wellness">
                {availableToAdd
                  .filter((s) => !isSignatureService(s.slug))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Signature">
                {availableToAdd
                  .filter((s) => isSignatureService(s.slug))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
            </select>
            <button
              type="button"
              disabled={!addServiceId}
              onClick={() => addService(addServiceId)}
              className="shrink-0 rounded-sm border border-border px-4 py-2.5 text-sm hover:border-accent disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {serviceIds.length === 0 ? (
            <p className="text-sm text-muted">No services yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Service</th>
                    <th className="px-2 py-2 font-medium">Claimed</th>
                    <th className="px-2 py-2 font-medium">Tested</th>
                    <th className="px-2 py-2 font-medium">Approved</th>
                    <th className="py-2 pl-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {serviceIds.map((id) => {
                    const svc = services.find((s) => s.id === id);
                    const q = qualifications[id];
                    if (!q) return null;
                    return (
                      <tr key={id} className="border-b border-border last:border-b-0">
                        <td className="py-2.5 pr-3 font-medium text-foreground">{svc?.name || id}</td>
                        <td className="px-2 py-2.5">
                          <input type="checkbox" checked={q.claimed} onChange={(e) => patchQualification(id, { claimed: e.target.checked })} />
                        </td>
                        <td className="px-2 py-2.5">
                          <input type="checkbox" checked={q.tested} onChange={(e) => patchQualification(id, { tested: e.target.checked })} />
                        </td>
                        <td className="px-2 py-2.5">
                          <input type="checkbox" checked={q.approved} onChange={(e) => patchQualification(id, { approved: e.target.checked })} />
                        </td>
                        <td className="py-2.5 pl-2">
                          <button type="button" onClick={() => removeService(id)} className="text-xs text-muted hover:text-red-700">
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => void saveServices()}
            className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save services"}
          </button>
        </section>
      ) : null}

      {tab === "photos" ? (
        <section className="admin-card space-y-4 p-4 xs:p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Photos</h2>
          <p className="text-xs text-muted">Main photo is the gallery thumbnail. Approve before they go public.</p>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div key={photo.url} className="w-28 space-y-1">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-sm border ${
                    photo.isPrimary ? "border-accent ring-2 ring-accent/40" : "border-border"
                  }`}
                >
                  <Image src={photo.url} alt="" fill sizes="112px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((prev) => {
                        const next = prev.filter((_, j) => j !== i);
                        if (photo.isPrimary && next.length > 0 && !next.some((p) => p.isPrimary)) {
                          next[0] = { ...next[0], isPrimary: true };
                        }
                        return next;
                      })
                    }
                    className="absolute right-0 top-0 bg-background/90 px-1 text-xs"
                  >
                    ×
                  </button>
                  {photo.isPrimary ? (
                    <span className="absolute bottom-0 left-0 bg-accent px-1.5 py-0.5 text-[0.65rem] font-medium text-accent-foreground">
                      Main
                    </span>
                  ) : null}
                </div>
                <select
                  value={photo.approvalStatus}
                  onChange={(e) =>
                    setPhotos((prev) =>
                      prev.map((p, j) =>
                        j === i ? { ...p, approvalStatus: e.target.value as MediaApprovalStatus } : p,
                      ),
                    )
                  }
                  className="w-full border border-border bg-background px-1 py-1 text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  disabled={photo.isPrimary}
                  onClick={() => setPhotos((prev) => prev.map((p, j) => ({ ...p, isPrimary: j === i })))}
                  className="w-full rounded-sm border border-border px-1 py-1 text-[0.65rem] hover:border-accent disabled:opacity-50"
                >
                  {photo.isPrimary ? "Main thumbnail" : "Set as main"}
                </button>
              </div>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void onUpload(f);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-sm border border-border px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "+ Add photos"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void savePhotos()}
              className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save photos"}
            </button>
          </div>
          {uploadNote ? <p className="text-xs text-accent">{uploadNote}</p> : null}
        </section>
      ) : null}

      {tab === "location" ? (
        <section className="admin-card space-y-4 p-4 xs:p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted">Primary city</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Travel radius (km)</span>
              <input type="number" min={1} max={80} value={serviceRadiusKm} onChange={(e) => setServiceRadiusKm(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-muted">Neighbourhood note (public)</span>
              <input value={areaLabel} onChange={(e) => setAreaLabel(e.target.value)} placeholder="e.g. Usually around Nimman" className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
            </label>
          </div>

          <div>
            <p className="text-sm text-muted">Coverage areas</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {coverageAreas.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={coverageAreaIds.includes(c.id)}
                    onChange={(e) =>
                      setCoverageAreaIds((ids) =>
                        e.target.checked ? [...ids, c.id] : ids.filter((id) => id !== c.id),
                      )
                    }
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <button type="button" className="text-sm text-accent hover:underline" onClick={() => setShowAdvancedLocation((v) => !v)}>
            {showAdvancedLocation ? "Hide advanced" : "Advanced (coordinates)"}
          </button>
          {showAdvancedLocation ? (
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-muted">Country</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
              <label className="block text-sm">
                <span className="text-muted">Province / region</span>
                <input value={region} onChange={(e) => setRegion(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
              <label className="block text-sm">
                <span className="text-muted">Latitude</span>
                <input value={latitude} onChange={(e) => setLatitude(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
              <label className="block text-sm">
                <span className="text-muted">Longitude</span>
                <input value={longitude} onChange={(e) => setLongitude(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
              </label>
            </div>
          ) : null}

          <button
            type="button"
            disabled={saving}
            onClick={() => void saveLocation()}
            className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save location"}
          </button>
        </section>
      ) : null}

      {tab === "quality" ? (
        <section className="admin-card space-y-4 p-4 xs:p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Quality</h2>
          <p className="text-xs text-muted">Fill these after you’ve actually worked with them — not at onboarding.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SCORE_FIELDS.map(({ key, label }) => (
              <label key={key} className="block text-sm">
                <span className="text-muted">{label}</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="— /10"
                  value={scores[key]}
                  onChange={(e) => setScores((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2.5"
                />
              </label>
            ))}
          </div>
          <label className="block text-sm">
            <span className="text-muted">Internal notes</span>
            <textarea rows={4} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2.5" />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveQuality()}
            className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save quality"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
