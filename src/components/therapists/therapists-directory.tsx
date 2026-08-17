"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TherapistCard } from "@/components/therapists/therapist-card";
import { TherapistFiltersBar } from "@/components/therapists/therapist-filters-bar";
import type { PublicTherapist, TherapistGender } from "@/lib/therapists/types";
import type { ResolvedCoverage } from "@/lib/therapists/eligibility";

type PlaceSearchMode = "gps" | "geocode" | null;

const TherapistMap = dynamic(
  () => import("@/components/therapists/therapist-map").then((m) => m.TherapistMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-sm border border-border bg-surface-elevated text-sm text-muted md:h-[360px]">
        Loading map…
      </div>
    ),
  },
);

type Props = {
  initialTherapists: PublicTherapist[];
  serviceOptions: { slug: string; name: string }[];
};

export function TherapistsDirectory({ initialTherapists, serviceOptions }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [therapists, setTherapists] = useState(initialTherapists);
  const [loading, setLoading] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<PlaceSearchMode>(null);
  const [resolvedCoverage, setResolvedCoverage] = useState<ResolvedCoverage | null>(null);
  const [searchCity, setSearchCity] = useState<string | undefined>();
  const [searchDebounced, setSearchDebounced] = useState(searchParams.get("q") || "");

  const serviceFilter = searchParams.get("service") || "";
  const coverageFilter = searchParams.get("coverage") || "";
  const genderFilter = (searchParams.get("gender") || "any") as TherapistGender | "any";
  const searchFilter = searchParams.get("q") || "";

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchFilter), 300);
    return () => clearTimeout(t);
  }, [searchFilter]);

  const fetchTherapists = useCallback(
    async (opts: {
      service?: string;
      coverage?: string;
      gender?: string;
      search?: string;
      lat?: number;
      lng?: number;
      city?: string;
    }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts.service) params.set("service", opts.service);
        if (opts.coverage) params.set("coverage", opts.coverage);
        if (opts.gender && opts.gender !== "any") params.set("gender", opts.gender);
        if (opts.search) params.set("q", opts.search);
        if (opts.lat != null && opts.lng != null) {
          params.set("lat", String(opts.lat));
          params.set("lng", String(opts.lng));
        }
        if (opts.city) params.set("city", opts.city);
        if (opts.city || (opts.lat != null && opts.lng != null)) params.set("cityWide", "1");
        const res = await fetch(`/api/therapists?${params.toString()}`);
        const data = await res.json();
        setTherapists(data.therapists || []);
        setResolvedCoverage(data.eligibility?.resolvedCoverage ?? null);
      } finally {
        setLoading(false);
        setLocating(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTherapists({
      service: serviceFilter || undefined,
      coverage: coverageFilter || undefined,
      gender: genderFilter,
      search: searchDebounced || undefined,
      lat: coords?.lat,
      lng: coords?.lng,
      city: searchCity,
    });
  }, [serviceFilter, coverageFilter, genderFilter, searchDebounced, coords, searchCity, fetchTherapists]);

  const bookContext = useMemo(
    () => ({
      service: serviceFilter || undefined,
      place: placeLabel || undefined,
      lat: coords?.lat,
      lng: coords?.lng,
      coverage: resolvedCoverage?.slug,
    }),
    [serviceFilter, placeLabel, coords, resolvedCoverage],
  );

  function pushParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(patch)) {
      if (val) params.set(key, val);
      else params.delete(key);
    }
    router.push(`/therapists${params.toString() ? `?${params}` : ""}`);
  }

  const subtitle = useMemo(() => {
    if (placeLabel || searchCity) {
      return `Therapists in ${searchCity || "this city"} — everyone based here, nearest first`;
    }
    if (nearMeActive) {
      return "Everyone in your city, nearest first";
    }
    if (serviceFilter) {
      const name = serviceOptions.find((s) => s.slug === serviceFilter)?.name;
      if (name) return `Therapists offering ${name}`;
    }
    return "Browse by service, area, or how close they are to where you are staying";
  }, [nearMeActive, placeLabel, searchCity, serviceFilter, serviceOptions]);

  return (
    <>
      <TherapistFiltersBar
        service={serviceFilter}
        coverage={coverageFilter}
        gender={genderFilter}
        search={searchFilter}
        serviceOptions={serviceOptions}
        nearMeActive={nearMeActive}
        locating={locating}
        placeLabel={placeLabel}
        onServiceChange={(slug) => pushParams({ service: slug })}
        onCoverageChange={(slug) => pushParams({ coverage: slug })}
        onGenderChange={(gender) => pushParams({ gender: gender === "any" ? "" : gender })}
        onSearchChange={(q) => pushParams({ q })}
        onNearMe={(lat, lng, city) => {
          setLocating(true);
          setNearMeActive(true);
          setPlaceLabel(null);
          setLocationMode("gps");
          setResolvedCoverage(null);
          setSearchCity(city);
          setCoords({ lat, lng });
        }}
        onNearMeStart={() => setLocating(true)}
        onClearNearMe={() => {
          setNearMeActive(false);
          setLocationMode(null);
          setResolvedCoverage(null);
          setSearchCity(undefined);
          setCoords(null);
        }}
        onPlaceResolved={(lat, lng, label, coverage, city) => {
          setPlaceLabel(label);
          setNearMeActive(false);
          setLocationMode("geocode");
          setResolvedCoverage(coverage ?? null);
          setSearchCity(city);
          setCoords({ lat, lng });
        }}
        onClearPlace={() => {
          setPlaceLabel(null);
          setLocationMode(null);
          setResolvedCoverage(null);
          setSearchCity(undefined);
          setCoords(null);
        }}
        resolvedCoverage={resolvedCoverage}
      />

      <p className="mt-6 text-sm text-muted">{subtitle}</p>

      {!loading && therapists.length > 0 ? (
        <div className="mt-8">
          <TherapistMap therapists={therapists} userLat={coords?.lat} userLng={coords?.lng} />
        </div>
      ) : null}

      {loading ? (
        <p className="mt-10 text-sm text-muted">Loading therapists…</p>
      ) : therapists.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          No therapists match these filters. Try another service, area, or location — or message us on WhatsApp.
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {therapists.map((therapist) => (
            <li key={therapist.id} className="h-full">
              <TherapistCard
                therapist={therapist}
                bookService={serviceFilter || therapist.serviceSlugs[0]}
                bookContext={bookContext}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
