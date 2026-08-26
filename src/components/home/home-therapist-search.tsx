"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TherapistFiltersBar } from "@/components/therapists/therapist-filters-bar";
import { TherapistCard } from "@/components/therapists/therapist-card";
import type { PublicTherapist } from "@/lib/therapists/types";
import type { ResolvedCoverage } from "@/lib/therapists/eligibility";

const TherapistMap = dynamic(
  () => import("@/components/therapists/therapist-map").then((m) => m.TherapistMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-sm border border-border bg-surface-elevated text-sm text-muted md:h-[340px]">
        Loading map…
      </div>
    ),
  },
);

type PlaceSearchMode = "gps" | "geocode" | null;

type Props = {
  initialTherapists: PublicTherapist[];
  serviceOptions: { slug: string; name: string }[];
};

export function HomeTherapistSearch({ initialTherapists, serviceOptions }: Props) {
  const [therapists, setTherapists] = useState(initialTherapists);
  const [loading, setLoading] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("");
  const [coverageFilter, setCoverageFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState<"any" | PublicTherapist["gender"]>("any");
  const [searchFilter, setSearchFilter] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [nearMeActive, setNearMeActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<PlaceSearchMode>(null);
  const [resolvedCoverage, setResolvedCoverage] = useState<ResolvedCoverage | null>(null);
  const [searchCity, setSearchCity] = useState<string | undefined>();

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

  const preview = useMemo(() => therapists.slice(0, 3), [therapists]);

  const directoryHref = useMemo(() => {
    const params = new URLSearchParams();
    if (serviceFilter) params.set("service", serviceFilter);
    if (coverageFilter) params.set("coverage", coverageFilter);
    if (genderFilter !== "any") params.set("gender", genderFilter);
    if (searchFilter) params.set("q", searchFilter);
    const qs = params.toString();
    return `/therapists${qs ? `?${qs}` : ""}`;
  }, [serviceFilter, coverageFilter, genderFilter, searchFilter]);

  return (
    <section className="border-t border-border bg-surface-elevated/40">
      <div className="mx-auto max-w-6xl px-4 py-14 xs:px-5 md:px-8 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Find your therapist</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground md:text-4xl">
          Therapists for Signature & beyond
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Filter by service and area, or share your location to see therapists based in that city —
          nearest first.
        </p>

        <div className="mt-8">
          <TherapistFiltersBar
            service={serviceFilter}
            coverage={coverageFilter}
            gender={genderFilter}
            search={searchFilter}
            serviceOptions={serviceOptions}
            nearMeActive={nearMeActive}
            locating={locating}
            placeLabel={placeLabel}
            resolvedCoverage={resolvedCoverage}
            onServiceChange={setServiceFilter}
            onCoverageChange={setCoverageFilter}
            onGenderChange={setGenderFilter}
            onSearchChange={setSearchFilter}
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
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <TherapistMap
            therapists={therapists}
            userLat={coords?.lat}
            userLng={coords?.lng}
            heightClassName="h-[280px] md:h-[360px]"
          />

          <div>
            {loading ? (
              <p className="text-sm text-muted">Searching therapists…</p>
            ) : preview.length === 0 ? (
              <p className="text-sm text-muted">
                No therapists in this city for these filters. Try another service or area.
              </p>
            ) : (
              <ul className="grid gap-4">
                {preview.map((therapist) => (
                  <li key={therapist.id}>
                    <TherapistCard
                      therapist={therapist}
                      compact
                      bookService={serviceFilter || therapist.serviceSlugs[0]}
                      bookContext={{
                        service: serviceFilter || undefined,
                        place: placeLabel || undefined,
                        lat: coords?.lat,
                        lng: coords?.lng,
                        coverage: resolvedCoverage?.slug,
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={directoryHref}
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              Browse all therapists →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
