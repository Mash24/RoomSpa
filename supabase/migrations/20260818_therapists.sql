-- Therapists: profiles, photos, service & coverage joins, geo for near-me
-- Run in Supabase SQL Editor after prior migrations

create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  gender text not null default 'unspecified'
    check (gender in ('female', 'male', 'nonbinary', 'unspecified')),
  age integer check (age is null or (age >= 18 and age <= 99)),
  height text not null default '',
  weight text not null default '',
  ethnicity text not null default '',
  bio text not null default '',
  city text not null default '',
  country text not null default '',
  area_label text not null default '',
  latitude double precision,
  longitude double precision,
  service_radius_km numeric not null default 12 check (service_radius_km > 0),
  is_active boolean not null default true,
  is_bookable boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.therapist_photos (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  photo_url text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists therapist_photos_therapist_id_idx on public.therapist_photos (therapist_id);

create table if not exists public.therapist_services (
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (therapist_id, service_id)
);

create table if not exists public.therapist_coverage (
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  coverage_area_id uuid not null references public.coverage_areas (id) on delete cascade,
  primary key (therapist_id, coverage_area_id)
);

alter table public.bookings
  add column if not exists therapist_id uuid references public.therapists (id),
  add column if not exists therapist_preference text not null default 'any';

alter table public.coverage_areas
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

update public.coverage_areas set latitude = 18.7883, longitude = 98.9853
  where slug = 'chiang-mai-old-city' and latitude is null;
update public.coverage_areas set latitude = 18.7990, longitude = 98.9680
  where slug = 'chiang-mai-nimman' and latitude is null;
update public.coverage_areas set latitude = 18.7669, longitude = 98.9628
  where slug = 'chiang-mai-airport' and latitude is null;

create trigger therapists_set_updated_at
  before update on public.therapists
  for each row execute function public.set_updated_at();

alter table public.therapists enable row level security;
alter table public.therapist_photos enable row level security;
alter table public.therapist_services enable row level security;
alter table public.therapist_coverage enable row level security;

create policy "Public read active bookable therapists"
  on public.therapists for select
  using (is_active = true and is_bookable = true);

create policy "Admin manage therapists"
  on public.therapists for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public read therapist photos"
  on public.therapist_photos for select
  using (
    exists (
      select 1 from public.therapists t
      where t.id = therapist_id and t.is_active and t.is_bookable
    )
  );

create policy "Admin manage therapist photos"
  on public.therapist_photos for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public read therapist services"
  on public.therapist_services for select
  using (true);

create policy "Admin manage therapist services"
  on public.therapist_services for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public read therapist coverage"
  on public.therapist_coverage for select
  using (true);

create policy "Admin manage therapist coverage"
  on public.therapist_coverage for all
  using (public.is_admin())
  with check (public.is_admin());

-- Haversine distance in km (earth radius 6371)
create or replace function public.haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
) returns double precision
language sql immutable parallel safe
as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;
