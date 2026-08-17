"use client";

import { Fragment, useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { PublicTherapist } from "@/lib/therapists/types";
import { formatApproxDistance, formatTherapistLocation } from "@/lib/therapists/public";

import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 0 0 2px rgba(37,99,235,0.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type Props = {
  therapists: PublicTherapist[];
  userLat?: number | null;
  userLng?: number | null;
  className?: string;
  heightClassName?: string;
};

function FitBounds({
  therapists,
  userLat,
  userLng,
}: {
  therapists: PublicTherapist[];
  userLat?: number | null;
  userLng?: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = therapists
      .filter((t) => t.mapLatitude != null && t.mapLongitude != null)
      .map((t) => [t.mapLatitude!, t.mapLongitude!]);

    if (userLat != null && userLng != null) {
      points.push([userLat, userLng]);
    }

    if (points.length === 0) {
      map.setView([18.7883, 98.9853], 12);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
  }, [therapists, userLat, userLng, map]);

  return null;
}

/** Map pins use service-area centroids — not therapist home coordinates. */
export function TherapistMap({
  therapists,
  userLat,
  userLng,
  className = "",
  heightClassName = "h-[320px] md:h-[420px]",
}: Props) {
  const mappable = useMemo(
    () => therapists.filter((t) => t.mapLatitude != null && t.mapLongitude != null),
    [therapists],
  );

  const center = useMemo((): L.LatLngExpression => {
    if (userLat != null && userLng != null) return [userLat, userLng];
    if (mappable[0]) return [mappable[0].mapLatitude!, mappable[0].mapLongitude!];
    return [18.7883, 98.9853];
  }, [mappable, userLat, userLng]);

  if (mappable.length === 0 && userLat == null) {
    return (
      <div
        className={`flex items-center justify-center rounded-sm border border-border bg-surface-elevated text-sm text-muted ${heightClassName} ${className}`}
      >
        No map locations for these therapists yet.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-sm border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className={`w-full ${heightClassName} z-0`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds therapists={mappable} userLat={userLat} userLng={userLng} />

        {userLat != null && userLng != null ? (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        ) : null}

        {mappable.map((therapist) => (
          <Marker
            key={therapist.id}
            position={[therapist.mapLatitude!, therapist.mapLongitude!]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="min-w-[160px] text-sm">
                <p className="font-medium text-foreground">{therapist.displayName}</p>
                <p className="mt-1 text-xs text-muted">{formatTherapistLocation(therapist)}</p>
                {therapist.serviceNames.length ? (
                  <p className="mt-1 text-xs text-accent">{therapist.serviceNames.slice(0, 3).join(" · ")}</p>
                ) : null}
                {formatApproxDistance(therapist.distanceKm) ? (
                  <p className="mt-1 text-xs text-muted">{formatApproxDistance(therapist.distanceKm)}</p>
                ) : null}
                <Link
                  href={`/therapists/${therapist.slug}`}
                  className="mt-2 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline"
                >
                  View profile →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
