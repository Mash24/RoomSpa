export type TherapistBookContext = {
  service?: string;
  place?: string;
  lat?: number;
  lng?: number;
  coverage?: string;
};

export function therapistBookHref(
  therapistId: string,
  extra?: TherapistBookContext & { serviceFallback?: string },
): string {
  const params = new URLSearchParams();
  params.set("therapist", therapistId);
  const service = extra?.service || extra?.serviceFallback;
  if (service) params.set("service", service);
  if (extra?.place) params.set("place", extra.place);
  if (extra?.lat != null && Number.isFinite(extra.lat)) params.set("lat", String(extra.lat));
  if (extra?.lng != null && Number.isFinite(extra.lng)) params.set("lng", String(extra.lng));
  if (extra?.coverage) params.set("coverage", extra.coverage);
  return `/book?${params.toString()}`;
}

export function anyoneBookHref(extra?: TherapistBookContext): string {
  const params = new URLSearchParams();
  if (extra?.service) params.set("service", extra.service);
  if (extra?.place) params.set("place", extra.place);
  if (extra?.lat != null && Number.isFinite(extra.lat)) params.set("lat", String(extra.lat));
  if (extra?.lng != null && Number.isFinite(extra.lng)) params.set("lng", String(extra.lng));
  if (extra?.coverage) params.set("coverage", extra.coverage);
  const qs = params.toString();
  return qs ? `/book?${qs}` : "/book";
}
