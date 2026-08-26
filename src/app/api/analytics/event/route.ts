import { NextResponse } from "next/server";
import { readRequestGeo } from "@/lib/analytics/geo";
import { createAdminishAnonClient } from "@/lib/supabase/anon";

function clean(value: unknown, max = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventName = clean(body.eventName, 80);
    if (!eventName) {
      return NextResponse.json({ error: "eventName required" }, { status: 400 });
    }

    const geo = readRequestGeo(request);
    const supabase = createAdminishAnonClient();
    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventName,
      source: clean(body.source, 80),
      medium: clean(body.medium, 80),
      campaign: clean(body.campaign, 120),
      referrer: clean(body.referrer, 300),
      landing_path: clean(body.landingPath, 240),
      page_path: clean(body.pagePath, 240),
      cta: clean(body.cta, 80),
      city_hint: clean(body.cityHint, 80),
      service_slug: clean(body.serviceSlug, 80),
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
      user_agent: clean(request.headers.get("user-agent"), 240),
      meta: typeof body.meta === "object" && body.meta ? body.meta : {},
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
}
