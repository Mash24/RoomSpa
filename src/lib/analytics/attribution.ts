export type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  referrer: string;
  landingPath: string;
  capturedAt: string;
};

const STORAGE_KEY = "roomspa_attribution_v1";

function clean(value: string | null | undefined, max = 180) {
  return (value || "").trim().slice(0, max);
}

function hostFromReferrer(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function inferSourceFromReferrer(referrer: string): { source: string; medium: string } {
  const host = hostFromReferrer(referrer).toLowerCase();
  if (!host) return { source: "direct", medium: "none" };
  if (host.includes("google.") || host === "google") return { source: "google", medium: "organic" };
  if (host.includes("bing.")) return { source: "bing", medium: "organic" };
  if (host.includes("facebook.") || host.includes("fb.") || host.includes("instagram.") || host.includes("l.instagram")) {
    return { source: host.includes("instagram") ? "instagram" : "facebook", medium: "social" };
  }
  if (host.includes("tiktok.") || host.includes("t.co") || host.includes("twitter.") || host.includes("x.com")) {
    return {
      source: host.includes("tiktok") ? "tiktok" : "x",
      medium: "social",
    };
  }
  if (host.includes("chatgpt.") || host.includes("openai.") || host.includes("perplexity.") || host.includes("gemini.")) {
    return { source: "ai", medium: "referral" };
  }
  return { source: host, medium: "referral" };
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/** Capture first-touch attribution once per browser session. */
export function captureAttributionFromLocation(href = window.location.href, referrer = document.referrer): Attribution {
  const existing = readAttribution();
  if (existing) return existing;

  const url = new URL(href);
  const utmSource = clean(url.searchParams.get("utm_source") || url.searchParams.get("source"));
  const utmMedium = clean(url.searchParams.get("utm_medium"));
  const utmCampaign = clean(url.searchParams.get("utm_campaign") || url.searchParams.get("campaign"));
  const inferred = inferSourceFromReferrer(referrer);

  const attribution: Attribution = {
    source: utmSource || inferred.source,
    medium: utmMedium || (utmSource ? "campaign" : inferred.medium),
    campaign: utmCampaign,
    referrer: clean(referrer, 300),
    landingPath: clean(url.pathname + url.search, 240),
    capturedAt: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // private mode / blocked storage
  }
  return attribution;
}

export type TrackPayload = {
  eventName: string;
  cta?: string;
  pagePath?: string;
  cityHint?: string;
  serviceSlug?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackClientEvent(payload: TrackPayload) {
  if (typeof window === "undefined") return;
  const attribution = captureAttributionFromLocation();
  const pagePath = payload.pagePath || `${window.location.pathname}${window.location.search}`;

  const body = {
    eventName: payload.eventName,
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    referrer: attribution.referrer,
    landingPath: attribution.landingPath,
    pagePath,
    cta: payload.cta || "",
    cityHint: payload.cityHint || "",
    serviceSlug: payload.serviceSlug || "",
    meta: payload.meta || {},
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", payload.eventName, {
      event_category: "engagement",
      source: body.source,
      medium: body.medium,
      campaign: body.campaign,
      cta: body.cta,
      page_path: body.pagePath,
      landing_path: body.landingPath,
      city_hint: body.cityHint,
      service_slug: body.serviceSlug,
    });
  }

  const json = JSON.stringify(body);
  // Prefer fetch+keepalive — more reliable than sendBeacon for Next API routes.
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {
    try {
      navigator.sendBeacon?.("/api/analytics/event", new Blob([json], { type: "application/json" }));
    } catch {
      // ignore
    }
  });
}
