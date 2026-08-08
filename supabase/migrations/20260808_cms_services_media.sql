-- Phase 1 CMS: enriched services, duration-tier prices, media library
-- Run in Supabase SQL Editor after prior migrations

-- ---------------------------------------------------------------------------
-- Services: editorial fields for admin CRUD
-- ---------------------------------------------------------------------------
alter table public.services
  add column if not exists details text not null default '',
  add column if not exists category text not null default 'classic',
  add column if not exists featured boolean not null default false,
  add column if not exists bookable boolean not null default true,
  add column if not exists duration_label text not null default '',
  add column if not exists image_url text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'services_category_check'
  ) then
    alter table public.services
      add constraint services_category_check
      check (category in ('classic', 'therapeutic', 'shared', 'sensual'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Duration tiers: 60 / 90 / 120 minutes
-- ---------------------------------------------------------------------------
create table if not exists public.service_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  duration_minutes integer not null check (duration_minutes in (60, 90, 120)),
  price_thb integer not null check (price_thb >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, duration_minutes)
);

create index if not exists service_prices_service_id_idx on public.service_prices (service_id);

-- ---------------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  title text not null,
  description text not null default '',
  media_url text not null,
  thumbnail_url text,
  status text not null default 'published'
    check (status in ('draft', 'published', 'hidden')),
  featured boolean not null default false,
  show_on_homepage boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_services (
  media_id uuid not null references public.media_assets (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (media_id, service_id)
);

create table if not exists public.media_locations (
  media_id uuid not null references public.media_assets (id) on delete cascade,
  location_slug text not null,
  primary key (media_id, location_slug)
);

-- Bookings: remember which duration was purchased
alter table public.bookings
  add column if not exists duration_minutes integer;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.service_prices enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_services enable row level security;
alter table public.media_locations enable row level security;

drop policy if exists "Public read active services" on public.services;
create policy "Public read active services"
on public.services for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services"
on public.services for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read active service prices" on public.service_prices;
create policy "Public read active service prices"
on public.service_prices for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.services s
    where s.id = service_id and s.is_active = true
  )
);

drop policy if exists "Admins manage service prices" on public.service_prices;
create policy "Admins manage service prices"
on public.service_prices for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read published media" on public.media_assets;
create policy "Public read published media"
on public.media_assets for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Admins manage media" on public.media_assets;
create policy "Admins manage media"
on public.media_assets for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read media_services" on public.media_services;
create policy "Public read media_services"
on public.media_services for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage media_services" on public.media_services;
create policy "Admins manage media_services"
on public.media_services for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read media_locations" on public.media_locations;
create policy "Public read media_locations"
on public.media_locations for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage media_locations" on public.media_locations;
create policy "Admins manage media_locations"
on public.media_locations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Storage bucket for uploads (admin write, public read)
insert into storage.buckets (id, name, public)
values ('media-library', 'media-library', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read media-library" on storage.objects;
create policy "Public read media-library"
on storage.objects for select
to public
using (bucket_id = 'media-library');

drop policy if exists "Admins upload media-library" on storage.objects;
create policy "Admins upload media-library"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media-library' and public.is_admin());

drop policy if exists "Admins update media-library" on storage.objects;
create policy "Admins update media-library"
on storage.objects for update
to authenticated
using (bucket_id = 'media-library' and public.is_admin())
with check (bucket_id = 'media-library' and public.is_admin());

drop policy if exists "Admins delete media-library" on storage.objects;
create policy "Admins delete media-library"
on storage.objects for delete
to authenticated
using (bucket_id = 'media-library' and public.is_admin());
