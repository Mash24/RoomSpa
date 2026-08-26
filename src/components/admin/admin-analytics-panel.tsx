"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Bucket = { label: string; count: number };
type DailyPoint = { date: string; pageViews: number; whatsappClicks: number };
type WhatsAppRow = {
  id: string;
  source: string;
  medium: string;
  campaign: string;
  landing_path: string;
  page_path: string;
  cta: string;
  city_hint: string;
  geo_city: string;
  geo_region: string;
  geo_country: string;
  created_at: string;
};

type AnalyticsPayload = {
  days: number;
  totals: { pageViews: number; whatsappClicks: number };
  sources: Bucket[];
  ctas: Bucket[];
  landings: Bucket[];
  cities: Bucket[];
  countries: Bucket[];
  recentWhatsapp: WhatsAppRow[];
  daily: DailyPoint[];
};

const RANGE_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
] as const;

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function formatDay(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyLabel(label: string) {
  if (!label || label === "(unknown)") return "Unknown";
  if (label === "/") return "Home";
  return label.replace(/^\//, "").replace(/-/g, " ") || label;
}

function Sparkline({
  values,
  accentClass,
}: {
  values: number[];
  accentClass: string;
}) {
  const max = Math.max(...values, 1);
  const w = 160;
  const h = 44;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full max-w-[10rem]" aria-hidden>
      <polygon points={area} className={`${accentClass} opacity-20`} />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        className={accentClass}
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone,
  spark,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "views" | "wa" | "rate";
  spark?: number[];
}) {
  const tones = {
    views: {
      shell: "from-[#2f5d50]/12 via-surface-elevated to-surface-elevated",
      chip: "bg-[#2f5d50]/12 text-[#2f5d50] dark:bg-[#7eb8a4]/15 dark:text-[#7eb8a4]",
      spark: "text-[#2f5d50] dark:text-[#7eb8a4]",
    },
    wa: {
      shell: "from-[#128C7E]/14 via-surface-elevated to-surface-elevated",
      chip: "bg-[#25D366]/15 text-[#0b6b3a] dark:bg-[#25D366]/20 dark:text-[#7dffa8]",
      spark: "text-[#128C7E] dark:text-[#25D366]",
    },
    rate: {
      shell: "from-amber-500/10 via-surface-elevated to-surface-elevated",
      chip: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
      spark: "text-amber-700 dark:text-amber-300",
    },
  }[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tones.shell} p-5 shadow-[0_1px_0_rgba(15,23,20,0.04)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${tones.chip}`}>
            {label}
          </span>
          <p className="mt-3 font-display text-4xl tracking-tight text-foreground tabular-nums sm:text-[2.75rem]">
            {value}
          </p>
          <p className="mt-1.5 text-sm text-muted">{hint}</p>
        </div>
        {spark ? (
          <div className="hidden pt-1 min-[400px]:block">
            <Sparkline values={spark} accentClass={tones.spark} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RankList({
  title,
  subtitle,
  rows,
  empty,
  barClass,
}: {
  title: string;
  subtitle: string;
  rows: Bucket[];
  empty: string;
  barClass: string;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_1px_0_rgba(15,23,20,0.04)]">
      <div className="mb-4">
        <h2 className="font-display text-xl tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-surface/60 px-4 py-10 text-center text-sm text-muted">
          {empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li key={`${title}-${row.label}`}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{index + 1}</span>
                  <span className="truncate text-sm font-medium text-foreground" title={row.label}>
                    {prettyLabel(row.label)}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {row.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full ${barClass}`}
                  style={{ width: `${Math.max(8, (row.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function visitorPlace(row: WhatsAppRow) {
  if (row.geo_city && row.geo_country) return `${row.geo_city}, ${row.geo_country}`;
  if (row.geo_city) return row.geo_city;
  if (row.geo_region && row.geo_country) return `${row.geo_region}, ${row.geo_country}`;
  if (row.geo_country) return row.geo_country;
  return "";
}

function ActivityRow({ row }: { row: WhatsAppRow }) {
  const place = visitorPlace(row);

  return (
    <li className="grid gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-5">
      <time className="text-xs tabular-nums text-muted sm:text-sm">{formatWhen(row.created_at)}</time>
      <div className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-medium text-[#0b6b3a] dark:text-[#7dffa8]">
            {row.cta || "whatsapp"}
          </span>
          <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
            {row.source || "direct"}
            {row.medium ? ` · ${row.medium}` : ""}
          </span>
          {place ? (
            <span className="inline-flex rounded-full bg-[#2f5d50]/10 px-2.5 py-0.5 text-xs font-medium text-[#2f5d50] dark:bg-[#7eb8a4]/15 dark:text-[#7eb8a4]">
              {place}
            </span>
          ) : null}
          {row.city_hint ? (
            <span className="inline-flex rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">
              asked: {row.city_hint}
            </span>
          ) : null}
        </div>
        <p className="mt-2 truncate text-sm text-muted">
          {row.page_path || row.landing_path || "—"}
          {row.landing_path && row.page_path && row.landing_path !== row.page_path
            ? ` · landed ${row.landing_path}`
            : ""}
        </p>
      </div>
      <span className="hidden text-xs font-medium uppercase tracking-[0.12em] text-[#128C7E] sm:inline">
        WA
      </span>
    </li>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-surface-elevated" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-surface-elevated" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-surface-elevated" />
    </div>
  );
}

export function AdminAnalyticsPanel() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load analytics.");
      setData(json as AnalyticsPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const conversion = useMemo(() => {
    if (!data) return 0;
    return pct(data.totals.whatsappClicks, data.totals.pageViews);
  }, [data]);

  const viewSpark = data?.daily.map((d) => d.pageViews) ?? [];
  const waSpark = data?.daily.map((d) => d.whatsappClicks) ?? [];
  const rateSpark =
    data?.daily.map((d) => (d.pageViews ? (d.whatsappClicks / d.pageViews) * 100 : 0)) ?? [];

  const peakDay = useMemo(() => {
    if (!data?.daily.length) return null;
    return data.daily.reduce((best, cur) =>
      cur.whatsappClicks + cur.pageViews > best.whatsappClicks + best.pageViews ? cur : best,
    );
  }, [data]);

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-[#1a221c] px-5 py-6 text-white shadow-[0_12px_40px_rgba(26,34,28,0.18)] xs:px-6 md:px-8 md:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 12% 20%, rgba(126,184,164,0.35), transparent 42%), radial-gradient(ellipse at 88% 80%, rgba(37,211,102,0.18), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white/55">
              Analytics
            </p>
            <h1 className="mt-2 font-display text-[1.85rem] leading-tight tracking-tight xs:text-4xl md:text-5xl">
              Traffic & WhatsApp
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
              Live site attribution only — counted from when tracking launched. Older chats and
              untracked taps won&apos;t show here.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div
              className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0"
            >
              <div
                className="inline-flex rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-sm"
                role="group"
                aria-label="Date range"
              >
                {RANGE_OPTIONS.map((option) => {
                  const active = days === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDays(option.value)}
                      className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium transition ${
                        active
                          ? "bg-white text-[#1a221c] shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/85 transition hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !data ? <Skeleton /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Page views"
              value={String(data.totals.pageViews)}
              hint={`Across last ${data.days} days`}
              tone="views"
              spark={viewSpark}
            />
            <MetricCard
              label="WhatsApp taps"
              value={String(data.totals.whatsappClicks)}
              hint={
                peakDay
                  ? `Peak day ${formatDay(peakDay.date)} · ${peakDay.whatsappClicks} taps`
                  : "Tracked site buttons only"
              }
              tone="wa"
              spark={waSpark}
            />
            <MetricCard
              label="Click rate"
              value={`${conversion}%`}
              hint="WhatsApp taps ÷ page views"
              tone="rate"
              spark={rateSpark}
            />
          </div>

          <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_1px_0_rgba(15,23,20,0.04)] md:p-6">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-xl tracking-tight text-foreground md:text-2xl">
                  Daily rhythm
                </h2>
                <p className="mt-1 text-sm text-muted">Views and WhatsApp taps by day</p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2f5d50] dark:bg-[#7eb8a4]" />
                  Views
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#25D366]" />
                  WhatsApp
                </span>
              </div>
            </div>

            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div
                className="flex min-w-full items-end gap-1.5 sm:gap-2"
                style={{ minHeight: "9.5rem" }}
              >
                {data.daily.map((day) => {
                  const max = Math.max(
                    ...data.daily.map((d) => Math.max(d.pageViews, d.whatsappClicks)),
                    1,
                  );
                  const viewH = Math.max(4, (day.pageViews / max) * 112);
                  const waH = Math.max(4, (day.whatsappClicks / max) * 112);
                  return (
                    <div
                      key={day.date}
                      className="group flex min-w-[1.65rem] flex-1 flex-col items-center gap-2 sm:min-w-[2rem]"
                      title={`${formatDay(day.date)}: ${day.pageViews} views, ${day.whatsappClicks} WA`}
                    >
                      <div className="flex h-28 w-full items-end justify-center gap-0.5 sm:gap-1">
                        <div
                          className="w-[42%] rounded-t-md bg-[#2f5d50]/85 transition group-hover:bg-[#2f5d50] dark:bg-[#7eb8a4]/80 dark:group-hover:bg-[#7eb8a4]"
                          style={{ height: `${viewH}px` }}
                        />
                        <div
                          className="w-[42%] rounded-t-md bg-[#25D366]/80 transition group-hover:bg-[#25D366]"
                          style={{ height: `${waH}px` }}
                        />
                      </div>
                      <span className="text-[0.6rem] tabular-nums text-muted sm:text-[0.65rem]">
                        {formatDay(day.date).split(" ")[1] || formatDay(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <RankList
              title="IP city guess"
              subtitle="Unreliable on mobile — Thai carriers often show Bangkok even from Chiang Mai"
              rows={data.cities ?? []}
              empty="No city guess yet — appears after production traffic."
              barClass="bg-[#2f5d50] dark:bg-[#7eb8a4]"
            />
            <RankList
              title="Countries"
              subtitle="Usually accurate — use this over city"
              rows={data.countries ?? []}
              empty="No country data yet."
              barClass="bg-sky-600/80 dark:bg-sky-400/70"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <RankList
              title="Sources"
              subtitle="Where WhatsApp visitors came from"
              rows={data.sources}
              empty="No source data in this window yet."
              barClass="bg-[#2f5d50] dark:bg-[#7eb8a4]"
            />
            <RankList
              title="CTAs"
              subtitle="Which buttons opened WhatsApp"
              rows={data.ctas}
              empty="No WhatsApp taps logged yet."
              barClass="bg-[#25D366]"
            />
            <RankList
              title="Landings"
              subtitle="First pages that led to taps"
              rows={data.landings}
              empty="No landing paths yet."
              barClass="bg-amber-500/80"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[0_1px_0_rgba(15,23,20,0.04)]">
            <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-xl tracking-tight text-foreground md:text-2xl">
                  Recent WhatsApp taps
                </h2>
                <p className="mt-1 text-sm text-muted">Newest first · last {data.days} days</p>
              </div>
              <p className="text-xs tabular-nums text-muted">
                {data.recentWhatsapp.length} shown
              </p>
            </div>

            {data.recentWhatsapp.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="font-display text-2xl text-foreground">Waiting for the first tap</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  Once someone opens WhatsApp from a tracked button on the live site, it will land
                  here with source, CTA, and page.
                </p>
              </div>
            ) : (
              <ul className="max-h-[32rem] overflow-y-auto">
                {data.recentWhatsapp.map((row) => (
                  <ActivityRow key={row.id} row={row} />
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
