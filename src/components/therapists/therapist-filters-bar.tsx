"use client";

import { useCallback, useState } from "react";
import { coverageAreas } from "@/content/coverage";
import type { TherapistGender } from "@/lib/therapists/types";
import type { ResolvedCoverage } from "@/lib/therapists/eligibility";

type Props = {
  service: string;
  coverage: string;
  gender: string;
  search: string;
  onNearMe: (lat: number, lng: number) => void;
  onClearNearMe: () => void;
  nearMeActive: boolean;
  locating: boolean;
  onServiceChange: (slug: string) => void;
  onCoverageChange: (slug: string) => void;
  onGenderChange: (gender: TherapistGender | "any") => void;
  onSearchChange: (query: string) => void;
  onPlaceResolved: (
    lat: number,
    lng: number,
    label: string,
    coverage?: ResolvedCoverage | null,
  ) => void;
  onClearPlace: () => void;
  placeLabel: string | null;
  resolvedCoverage?: ResolvedCoverage | null;
  serviceOptions: { slug: string; name: string }[];
};

export function TherapistFiltersBar({
  service,
  coverage,
  gender,
  search,
  onNearMe,
  onClearNearMe,
  nearMeActive,
  locating,
  onServiceChange,
  onCoverageChange,
  onGenderChange,
  onSearchChange,
  onPlaceResolved,
  onClearPlace,
  placeLabel,
  resolvedCoverage,
  serviceOptions,
}: Props) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const requestNearMe = useCallback(() => {
    if (nearMeActive) {
      onClearNearMe();
      onClearPlace();
      setGeoError(null);
      return;
    }
    if (!navigator.geolocation) {
      setGeoError("Your browser does not support location sharing.");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => onNearMe(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError("Could not get your location. Pick an area or search your hotel below."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, [nearMeActive, onClearNearMe, onClearPlace, onNearMe]);

  async function lookupPlace(e: React.FormEvent) {
    e.preventDefault();
    const q = placeQuery.trim();
    if (!q) return;
    setPlaceLoading(true);
    setPlaceError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      onPlaceResolved(
        data.lat,
        data.lng,
        data.label as string,
        data.coverage ?? null,
      );
      onClearNearMe();
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setPlaceLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-sm border border-border bg-surface-elevated p-4">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
        <label className="block w-full text-sm md:min-w-[140px] md:flex-1">
          <span className="text-muted">Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Name or service…"
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>
        <label className="block w-full text-sm md:min-w-[140px] md:flex-1">
          <span className="text-muted">Service</span>
          <select
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          >
            <option value="">All services</option>
            {serviceOptions.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-full text-sm md:min-w-[120px] md:flex-1">
          <span className="text-muted">Area</span>
          <select
            value={coverage}
            onChange={(e) => onCoverageChange(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          >
            <option value="">All areas</option>
            {coverageAreas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-full text-sm md:min-w-[100px] md:flex-1">
          <span className="text-muted">Gender</span>
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value as TherapistGender | "any")}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          >
            <option value="any">Any</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end">
        <form onSubmit={lookupPlace} className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1 text-sm">
            <span className="text-muted">Where are you staying?</span>
            <input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder="Hotel, condo, or neighbourhood…"
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            disabled={placeLoading}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-medium hover:border-accent disabled:opacity-60"
          >
            {placeLoading ? "Searching…" : "Find nearby"}
          </button>
        </form>
        <button
          type="button"
          onClick={requestNearMe}
          disabled={locating}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {locating ? "Locating…" : nearMeActive ? "Clear GPS filter" : "📍 Use my location"}
        </button>
      </div>

      {geoError ? <p className="text-sm text-red-700 dark:text-red-300">{geoError}</p> : null}
      {placeError ? <p className="text-sm text-red-700 dark:text-red-300">{placeError}</p> : null}
      {placeLabel ? (
        <p className="text-xs text-accent">
          Showing therapists who can reach <strong>{placeLabel}</strong>
          {resolvedCoverage ? (
            <>
              {" "}
              (near <strong>{resolvedCoverage.name}</strong>)
            </>
          ) : null}
          {" · "}
          <button type="button" onClick={onClearPlace} className="underline underline-offset-2">
            Clear
          </button>
        </p>
      ) : null}
      {nearMeActive ? (
        <p className="text-xs text-accent">Sorted by distance from your current location.</p>
      ) : null}
    </div>
  );
}
