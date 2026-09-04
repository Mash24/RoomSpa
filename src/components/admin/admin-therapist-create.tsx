"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { readApiJson } from "@/lib/admin/api";
import type { TherapistGender } from "@/lib/therapists/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminTherapistCreate() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("Chiang Mai");
  const [gender, setGender] = useState<TherapistGender>("female");
  const [phone, setPhone] = useState("");
  const [languages, setLanguages] = useState("English, Thai");
  const [country, setCountry] = useState("Thailand");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);

  async function onUpload(file: File) {
    const slug = slugify(displayName);
    if (!slug) {
      setError("Enter a display name before uploading photos.");
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
      if (!data.url) throw new Error("Upload completed without a photo URL.");
      setPhotoUrls((prev) => [...prev, data.url as string]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const name = displayName.trim();
    const cityValue = city.trim();
    const langs = languages.trim();
    const countryValue = country.trim();
    const slug = slugify(name);

    if (!name || !slug) {
      setError("Display name is required.");
      setSaving(false);
      return;
    }
    if (!cityValue) {
      setError("City is required.");
      setSaving(false);
      return;
    }
    if (!langs) {
      setError("Languages are required.");
      setSaving(false);
      return;
    }
    if (!countryValue) {
      setError("Country is required.");
      setSaving(false);
      return;
    }
    if (photoUrls.length === 0) {
      setError("Add at least one photo.");
      setSaving(false);
      return;
    }

    const primaryPhotoUrl = photoUrls[primaryIndex] || photoUrls[0];
    const mediaApprovals: Record<string, string> = {};
    for (const url of photoUrls) mediaApprovals[url] = "approved";

    try {
      const res = await fetch("/api/admin/therapists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name,
          slug,
          gender,
          phone: phone.trim() || null,
          languages: langs,
          nationality: countryValue,
          ethnicity: "",
          status: "active",
          showOnGallery: true,
          acceptingBookings: false,
          photoUrls,
          primaryPhotoUrl,
          mediaApprovals,
          location: {
            city: cityValue,
            country: countryValue,
            region: "",
            publicAreaSummary: "",
            latitude: null,
            longitude: null,
            serviceRadiusKm: 12,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create therapist.");
      router.push(`/admin/therapists/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create therapist.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onCreate} className="mx-auto w-full max-w-lg space-y-6 pb-8">
      <div>
        <Link href="/admin/therapists" className="text-sm text-accent">
          ← Therapists
        </Link>
        <h1 className="mt-2 font-display text-2xl tracking-tight text-foreground xs:text-3xl">
          Add therapist
        </h1>
        <p className="mt-2 text-sm text-muted">
          Name, photo, city, country, gender, and languages — then finish the rest in their workspace.
        </p>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <label className="block text-sm">
          <span className="text-muted">Display name</span>
          <input
            required
            autoFocus
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Lilly"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <div>
          <p className="text-sm text-muted">Photos</p>
          <p className="mt-0.5 text-xs text-muted">At least one required. First marked main is the thumbnail.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {photoUrls.map((url, i) => (
              <div key={url} className="w-24 space-y-1">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-sm border ${
                    i === primaryIndex ? "border-accent ring-2 ring-accent/40" : "border-border"
                  }`}
                >
                  <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrls((prev) => prev.filter((_, j) => j !== i));
                      setPrimaryIndex((prev) => {
                        if (i === prev) return 0;
                        if (i < prev) return prev - 1;
                        return prev;
                      });
                    }}
                    className="absolute right-0 top-0 bg-background/90 px-1 text-xs"
                  >
                    ×
                  </button>
                  {i === primaryIndex ? (
                    <span className="absolute bottom-0 left-0 bg-accent px-1 py-0.5 text-[0.6rem] font-medium text-accent-foreground">
                      Main
                    </span>
                  ) : null}
                </div>
                {i !== primaryIndex ? (
                  <button
                    type="button"
                    onClick={() => setPrimaryIndex(i)}
                    className="w-full text-[0.65rem] text-accent hover:underline"
                  >
                    Set main
                  </button>
                ) : null}
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
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-sm border border-border px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "+ Add photo"}
          </button>
        </div>

        <label className="block text-sm">
          <span className="text-muted">City</span>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Chiang Mai"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Country</span>
          <input
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Thailand"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Gender</span>
          <select
            required
            value={gender}
            onChange={(e) => setGender(e.target.value as TherapistGender)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
            <option value="unspecified">Unspecified</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-muted">Languages</span>
          <input
            required
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="Thai, English"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">WhatsApp / phone (optional)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+66…"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
      </section>

      <button
        type="submit"
        disabled={saving || uploading}
        className="flex min-h-12 w-full items-center justify-center rounded-sm bg-accent text-sm font-medium text-accent-foreground disabled:opacity-60"
      >
        {saving ? "Creating…" : "Create therapist →"}
      </button>
    </form>
  );
}
