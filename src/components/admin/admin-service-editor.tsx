"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  serviceCategories,
  type ServiceCategoryId,
} from "@/content/services";
import {
  categoryToTier,
  experienceTierLabels,
  tierToCategory,
  type ExperienceTier,
  WELLNESS_CATEGORY_IDS,
} from "@/lib/catalog/experience-tier";
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";
import type { AdminServiceRow } from "@/lib/admin/cms-types";
import { AdminServiceImageField } from "@/components/admin/admin-service-image-field";

type Props = {
  serviceId?: string;
};

function priceOf(service: AdminServiceRow | null, minutes: 60 | 90 | 120, fallback = "") {
  if (!service) return fallback;
  return String(service.prices.find((p) => p.durationMinutes === minutes)?.priceThb ?? "");
}

export function AdminServiceEditor({ serviceId }: Props) {
  const router = useRouter();
  const isNew = !serviceId;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState<ServiceCategoryId>("classic");
  const [experienceTier, setExperienceTier] = useState<ExperienceTier>("wellness");
  const [wellnessSubCategory, setWellnessSubCategory] = useState<ServiceCategoryId>("classic");
  const [featured, setFeatured] = useState(false);
  const [bookable, setBookable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [price60, setPrice60] = useState("");
  const [price90, setPrice90] = useState("");
  const [price120, setPrice120] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageHeroUrl, setImageHeroUrl] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState("");

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/services");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load.");
        const service = (data.services as AdminServiceRow[]).find((s) => s.id === serviceId);
        if (!service) throw new Error("Service not found.");
        if (cancelled) return;
        setName(service.name);
        setSlug(service.slug);
        setSummary(service.summary);
        setDetails(service.details);
        setCategory(service.category);
        setExperienceTier(categoryToTier(service.category));
        if (WELLNESS_CATEGORY_IDS.includes(service.category)) {
          setWellnessSubCategory(service.category);
        }
        setFeatured(service.featured);
        setBookable(service.bookable);
        setIsActive(service.isActive);
        setPrice60(priceOf(service, 60));
        setPrice90(priceOf(service, 90));
        setPrice120(priceOf(service, 120));
        setSeoTitle(service.seoTitle || "");
        setSeoDescription(service.seoDescription || "");
        setImageUrl(service.imageUrl);
        setImageHeroUrl(service.imageHeroUrl);
        setImageAlt(service.imageAlt || "");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  function onNameChange(value: string) {
    setName(value);
    if (isNew) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const resolvedCategory = tierToCategory(experienceTier, wellnessSubCategory);
    if (experienceTier === "signature" && !imageUrl) {
      setError("Signature experiences need a hero image. Upload one before saving.");
      setSaving(false);
      return;
    }
    const payload = {
      name,
      slug,
      summary,
      details,
      category: resolvedCategory,
      featured,
      bookable,
      isActive,
      price60: Number(price60),
      price90: Number(price90),
      price120: Number(price120),
      imageUrl,
      imageHeroUrl,
      imageAlt,
      seoTitle,
      seoDescription,
    };

    try {
      const res = await fetch(isNew ? "/api/admin/services" : `/api/admin/services/${serviceId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <form onSubmit={onSave} className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-4 md:space-y-8 md:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/services" className="text-sm text-accent">
            ← Services
          </Link>
          <h1 className="mt-2 break-words font-display text-2xl tracking-tight text-foreground xs:text-3xl">
            {isNew ? "Add service" : "Edit service"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="hidden min-h-11 shrink-0 rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60 md:inline-flex md:items-center"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Basics</h2>
        <label className="block text-sm">
          <span className="text-muted">Name</span>
          <input
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Slug</span>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Short description</span>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Full description</span>
          <textarea
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <fieldset className="space-y-3">
          <legend className="text-sm text-muted">Service category</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="experienceTier"
              checked={experienceTier === "wellness"}
              onChange={() => {
                setExperienceTier("wellness");
                setCategory(tierToCategory("wellness", wellnessSubCategory));
              }}
            />
            {experienceTierLabels.wellness}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="experienceTier"
              checked={experienceTier === "signature"}
              onChange={() => {
                setExperienceTier("signature");
                setCategory("sensual");
              }}
            />
            {experienceTierLabels.signature}
          </label>
          {experienceTier === "wellness" ? (
            <label className="block text-sm">
              <span className="text-muted">Wellness type</span>
              <select
                value={wellnessSubCategory}
                onChange={(e) => {
                  const next = e.target.value as ServiceCategoryId;
                  setWellnessSubCategory(next);
                  setCategory(tierToCategory("wellness", next));
                }}
                className="mt-1 w-full border border-border bg-background px-3 py-2.5"
              >
                {serviceCategories
                  .filter((item) => WELLNESS_CATEGORY_IDS.includes(item.id))
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <p className="text-xs text-muted">
              Appears on Signature Experiences only — not in Wellness menus.
            </p>
          )}
        </fieldset>
      </section>

      <AdminServiceImageField
        slug={slug}
        experienceTier={experienceTier}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        onImageUrlChange={setImageUrl}
        onImageHeroUrlChange={setImageHeroUrl}
        onImageAltChange={setImageAlt}
      />

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Pricing by duration
        </h2>
        <div className="grid gap-4 min-[420px]:grid-cols-3">
          {(
            [
              [60, price60, setPrice60],
              [90, price90, setPrice90],
              [120, price120, setPrice120],
            ] as const
          ).map(([minutes, value, setter]) => (
            <label key={minutes} className="block text-sm">
              <span className="text-muted">{DURATION_TIER_LABELS[minutes]} (THB)</span>
              <input
                required
                type="number"
                min={0}
                step="any"
                inputMode="numeric"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="mt-1 w-full border border-border bg-background px-3 py-2.5"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-3 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Settings</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active on site
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={bookable} onChange={(e) => setBookable(e.target.checked)} />
          Available for online booking
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
      </section>

      <section className="admin-card space-y-4 p-4 xs:p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">SEO (optional)</h2>
        <label className="block text-sm">
          <span className="text-muted">SEO title</span>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={`${name || "Service"} in Chiang Mai | GetRoomSpa`}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Meta description</span>
          <textarea
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
      </section>

      <div className="admin-mobile-actions">
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-12 w-full items-center justify-center rounded-sm bg-accent text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save service"}
        </button>
      </div>
    </form>
  );
}
