-- First-party marketing events for RoomSpa attribution
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  source text not null default '',
  medium text not null default '',
  campaign text not null default '',
  referrer text not null default '',
  landing_path text not null default '',
  page_path text not null default '',
  cta text not null default '',
  city_hint text not null default '',
  service_slug text not null default '',
  user_agent text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_source_idx
  on public.analytics_events (source, created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
create policy "Anyone can insert analytics events"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read analytics events" on public.analytics_events;
create policy "Admins read analytics events"
  on public.analytics_events
  for select
  using (public.is_admin());
