"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { readApiJson } from "@/lib/admin/api";
import type { AdminMediaRow } from "@/lib/admin/cms-types";
import { createClient } from "@/utils/supabase/client";

type ServiceOption = { id: string; slug: string; name?: string };

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 95 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

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
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const selectedServiceLabels = useMemo(() => {
    return services
      .filter((service) => selectedServices.includes(service.id))
      .map((service) => service.name || service.slug);
  }, [services, selectedServices]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      const data = await readApiJson<{
        error?: string;
        media?: AdminMediaRow[];
        services?: ServiceOption[];
      }>(res);
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
    setUploadProgress(null);
    try {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) {
        throw new Error("Only video or image files are supported.");
      }
      if (isImage && file.size > MAX_IMAGE_BYTES) {
        throw new Error("Images must be 8 MB or smaller.");
      }
      if (isVideo && file.size > MAX_VIDEO_BYTES) {
        throw new Error(
          "Videos must be under ~95 MB for Storage upload. Compress the file, or paste an external link (YouTube, Vimeo, X) instead.",
        );
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Your admin session expired. Sign in again, then retry the upload.");
      }

      const primary =
        services.find((service) => selectedServices.includes(service.id))?.slug || "library";
      const safeName = sanitizeFileName(file.name) || `upload.${isVideo ? "mp4" : "jpg"}`;
      const path = `${primary}/${Date.now()}-${safeName}`;

      setUploadProgress(`Uploading ${file.name}…`);
      const { error: uploadError } = await supabase.storage.from("media-library").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (uploadError) {
        throw new Error(
          uploadError.message.includes("Bucket not found")
            ? "Storage bucket missing. Run supabase/migrations/20260808_cms_services_media.sql"
            : uploadError.message.includes("row-level security") ||
                uploadError.message.toLowerCase().includes("policy")
              ? "Upload blocked by storage policy. Confirm your profile role is admin and the CMS SQL migration was applied."
              : uploadError.message,
        );
      }

      const { data } = supabase.storage.from("media-library").getPublicUrl(path);
      setMediaUrl(data.publicUrl);
      if (isImage) setKind("image");
      if (isVideo) setKind("video");
      setUploadProgress("Upload complete — save the media record below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!mediaUrl.trim()) {
        throw new Error("Add a media URL (upload a file or paste a link).");
      }
      if (selectedServices.length === 0) {
        throw new Error("Select at least one related service so Gallery can label this item.");
      }

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          kind,
          mediaUrl: mediaUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || null,
          status,
          featured,
          showOnHomepage,
          serviceIds: selectedServices,
          locationSlugs: ["chiang-mai"],
        }),
      });
      const data = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Could not save media.");
      setTitle("");
      setDescription("");
      setMediaUrl("");
      setThumbnailUrl("");
      setSelectedServices([]);
      setUploadProgress(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save media.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this media item?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const data = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
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
          Upload files directly to Storage, or paste a public link (MP4, YouTube, Vimeo, or X). Attach
          only the services this clip belongs to — labels show on Gallery and service pages.
        </p>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
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
              placeholder="Tantric session overview"
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-muted">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short, professional note about what guests see."
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

        <div className="rounded-sm border border-dashed border-border px-4 py-6">
          <p className="text-sm font-medium text-foreground">Option A — upload a file</p>
          <p className="mt-1 text-sm text-muted">
            Uploads go straight to Supabase Storage (not through the Next.js server). Videos up to ~95
            MB.
          </p>
          <input
            type="file"
            accept="video/*,image/*"
            disabled={uploading}
            className="mt-3 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
          {uploading ? <p className="mt-2 text-xs text-muted">Uploading…</p> : null}
          {uploadProgress && !uploading ? (
            <p className="mt-2 text-xs text-accent">{uploadProgress}</p>
          ) : null}
        </div>

        <div className="rounded-sm border border-border px-4 py-5">
          <p className="text-sm font-medium text-foreground">Option B — paste a link</p>
          <p className="mt-1 text-sm text-muted">
            Paste an X/Twitter post, YouTube, Vimeo, or direct MP4 URL. X videos play on-site from the
            link (no phone download, no Storage).
          </p>
        </div>

        <label className="block text-sm">
          <span className="text-muted">Media URL</span>
          <input
            required
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://… or Storage URL after upload"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Thumbnail URL (optional)</span>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Useful for X / external links"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <fieldset>
          <legend className="text-sm text-muted">
            Related services <span className="text-foreground">(required — pick only relevant ones)</span>
          </legend>
          {selectedServiceLabels.length ? (
            <p className="mt-2 text-xs text-accent">
              Gallery label: {selectedServiceLabels.join(" · ")}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">Select the service(s) this media is about.</p>
          )}
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
          disabled={saving || uploading || !mediaUrl}
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
              <li
                key={item.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
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
