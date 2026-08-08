"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminMediaRow } from "@/lib/admin/cms-types";

type ServiceOption = { id: string; slug: string; name?: string };

export function AdminMediaPanel() {
  const [media, setMedia] = useState<AdminMediaRow[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"video" | "image">("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "hidden">("published");
  const [featured, setFeatured] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load media.");
      setMedia(data.media || []);
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setMediaUrl(data.url);
      if (file.type.startsWith("image/")) setKind("image");
      if (file.type.startsWith("video/")) setKind("video");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          kind,
          mediaUrl,
          thumbnailUrl: thumbnailUrl || null,
          status,
          featured,
          showOnHomepage,
          serviceIds: selectedServices,
          locationSlugs: ["chiang-mai"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save media.");
      setTitle("");
      setDescription("");
      setMediaUrl("");
      setThumbnailUrl("");
      setSelectedServices([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save media.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this media item?")) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed.");
      return;
    }
    await load();
  }

  function toggleService(id: string) {
    setSelectedServices((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
          Media library
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Upload or link videos and photos, then attach them to services (Nuru, Yoni, Thai…). Published
          items can appear on matching service pages.
        </p>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <form onSubmit={onCreate} className="space-y-4 border border-border bg-surface-elevated p-5 md:p-6">
        <h2 className="font-display text-2xl text-foreground">Add media</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="text-muted">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What to expect from a Nuru session"
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-muted">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Professional, non-graphic education about preparation, privacy, and boundaries."
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Type</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "video" | "image")}
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            >
              <option value="video">Video</option>
              <option value="image">Photo</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>

        <div className="rounded-sm border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted">Upload to Supabase Storage, or paste a URL below</p>
          <input
            type="file"
            accept="video/*,image/*"
            className="mt-3 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
            }}
          />
          {uploading ? <p className="mt-2 text-xs text-muted">Uploading…</p> : null}
        </div>

        <label className="block text-sm">
          <span className="text-muted">Media URL</span>
          <input
            required
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="/media/services/… or https://…"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Thumbnail URL (optional)</span>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <fieldset>
          <legend className="text-sm text-muted">Related services</legend>
          <div className="mt-2 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                />
                <span className="truncate">{service.name || service.slug}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnHomepage}
              onChange={(e) => setShowOnHomepage(e.target.checked)}
            />
            Show on homepage
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || !mediaUrl}
          className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save media"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-2xl text-foreground">Library</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border bg-surface-elevated">
            {media.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {item.title}{" "}
                    <span className="text-xs uppercase tracking-wide text-muted">
                      {item.kind} · {item.status}
                    </span>
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">{item.mediaUrl}</p>
                  <p className="mt-1 text-xs text-muted">
                    Services: {item.serviceSlugs.length ? item.serviceSlugs.join(", ") : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onDelete(item.id)}
                  className="text-sm text-muted underline-offset-2 hover:text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
            {media.length === 0 ? (
              <li className="px-4 py-8 text-sm text-muted">No media yet. Add your first video above.</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
