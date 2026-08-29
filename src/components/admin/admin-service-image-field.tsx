"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ExperienceTier } from "@/lib/catalog/experience-tier";
import { readApiJson } from "@/lib/admin/api";

type Props = {
  slug: string;
  experienceTier: ExperienceTier;
  imageUrl: string | null;
  imageAlt: string;
  onImageUrlChange: (url: string | null) => void;
  onImageHeroUrlChange: (url: string | null) => void;
  onImageAltChange: (alt: string) => void;
};

export function AdminServiceImageField({
  slug,
  experienceTier,
  imageUrl,
  imageAlt,
  onImageUrlChange,
  onImageHeroUrlChange,
  onImageAltChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  const isSignature = experienceTier === "signature";

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!slug.trim()) {
      setUploadError("Set a slug first — the image is stored under that service name.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadNote(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("tier", isSignature ? "signature" : "wellness");

      const res = await fetch("/api/admin/services/image", {
        method: "POST",
        body: form,
      });
      const data = await readApiJson<{ error?: string; url?: string; heroUrl?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      if (!data.url) throw new Error("Upload completed without an image URL. Please retry.");

      onImageUrlChange(data.url as string);
      onImageHeroUrlChange((data.heroUrl as string) || null);
      setUploadNote(
        isSignature
          ? "Smart-cropped to fit Signature cards (3:4) and detail hero (16:10)."
          : "Smart-cropped to fit wellness cards (4:3) and detail hero (16:10).",
      );
      if (!imageAlt.trim()) {
        onImageAltChange(`${slug.replace(/-/g, " ")} — RoomSpa in-room session`);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-4 border border-border bg-surface-elevated p-5">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Service image
        </h2>
        <p className="mt-1 text-xs text-muted">
          {isSignature
            ? "Signature services need a hero image. Upload any size or aspect — the system auto-crops to fit cards and detail pages."
            : "Optional hero image. Upload any size — auto-cropped to fit wellness cards (4:3) and detail pages (16:10)."}
        </p>
      </div>

      {imageUrl ? (
        <div
          className={`relative max-w-xs overflow-hidden rounded-sm border border-border bg-[#0c0a09] ${isSignature ? "aspect-[3/4]" : "aspect-[4/3]"}`}
        >
          <Image
            src={imageUrl}
            alt={imageAlt || "Service preview"}
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[3/4] max-w-xs items-center justify-center rounded-sm border border-dashed border-border bg-surface px-4 text-center text-xs text-muted">
          {isSignature ? "No image yet — upload one for this Signature experience" : "No image uploaded"}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading || !slug.trim()}
          onClick={() => inputRef.current?.click()}
          className="rounded-sm border border-border bg-background px-4 py-2 text-sm transition hover:border-accent disabled:opacity-50"
        >
          {uploading ? "Processing…" : imageUrl ? "Replace image" : "Upload image"}
        </button>
        {imageUrl ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              onImageUrlChange(null);
              onImageHeroUrlChange(null);
              setUploadNote(null);
            }}
            className="rounded-sm px-4 py-2 text-sm text-muted underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFileChange(e)}
      />

      {!slug.trim() ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Enter a slug above before uploading — images are linked to the service slug.
        </p>
      ) : null}

      {uploadError ? (
        <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
      ) : null}
      {uploadNote ? <p className="text-xs text-accent">{uploadNote}</p> : null}

      <label className="block text-sm">
        <span className="text-muted">Image alt text (accessibility)</span>
        <input
          value={imageAlt}
          onChange={(e) => onImageAltChange(e.target.value)}
          placeholder="Describe the image for screen readers"
          className="mt-1 w-full border border-border bg-background px-3 py-2.5"
        />
      </label>
    </section>
  );
}
