-- Approximate visitor geography from platform IP headers (Vercel)
alter table public.analytics_events
  add column if not exists geo_city text not null default '',
  add column if not exists geo_region text not null default '',
  add column if not exists geo_country text not null default '';

create index if not exists analytics_events_geo_city_idx
  on public.analytics_events (geo_city, created_at desc)
  where geo_city <> '';
