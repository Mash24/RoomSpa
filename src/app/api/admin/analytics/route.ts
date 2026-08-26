import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function geoPlaceLabel(row: {
  geo_city?: string | null;
  geo_region?: string | null;
  geo_country?: string | null;
}) {
  const city = (row.geo_city || "").trim();
  const region = (row.geo_region || "").trim();
  const country = (row.geo_country || "").trim();
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (region && country) return `${region}, ${country}`;
  if (country) return country;
  return "(unknown)";
}

export async function GET(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(1, Number(searchParams.get("days") || 14)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error: queryError } = await supabase
    .from("analytics_events")
    .select(
      "id, event_name, source, medium, campaign, referrer, landing_path, page_path, cta, city_hint, service_slug, geo_city, geo_region, geo_country, created_at",
    )
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  const events = data || [];
  const whatsapp = events.filter((e) => e.event_name === "whatsapp_click");
  const pageViews = events.filter((e) => e.event_name === "page_view");

  function countBy(rows: typeof events, key: keyof (typeof events)[number]) {
    const map = new Map<string, number>();
    for (const row of rows) {
      const value = String(row[key] || "(unknown)");
      map.set(value, (map.get(value) || 0) + 1);
    }
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }

  function countByLabel(rows: typeof events, labelFor: (row: (typeof events)[number]) => string) {
    const map = new Map<string, number>();
    for (const row of rows) {
      const value = labelFor(row);
      map.set(value, (map.get(value) || 0) + 1);
    }
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }

  const dailyMap = new Map<string, { pageViews: number; whatsappClicks: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().slice(0, 10), { pageViews: 0, whatsappClicks: 0 });
  }
  for (const event of events) {
    const key = dayKey(event.created_at);
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    if (event.event_name === "page_view") bucket.pageViews += 1;
    if (event.event_name === "whatsapp_click") bucket.whatsappClicks += 1;
  }

  const daily = [...dailyMap.entries()].map(([date, counts]) => ({ date, ...counts }));
  const geoBase = whatsapp.length ? whatsapp : pageViews;

  return NextResponse.json({
    days,
    totals: {
      pageViews: pageViews.length,
      whatsappClicks: whatsapp.length,
    },
    sources: countBy(whatsapp.length ? whatsapp : pageViews, "source"),
    ctas: countBy(whatsapp, "cta"),
    landings: countBy(whatsapp.length ? whatsapp : pageViews, "landing_path"),
    cities: countByLabel(geoBase, geoPlaceLabel),
    countries: countBy(geoBase, "geo_country"),
    recentWhatsapp: whatsapp.slice(0, 40),
    daily,
  });
}
