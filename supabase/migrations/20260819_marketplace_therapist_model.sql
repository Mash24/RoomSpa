-- Marketplace therapist model: separate profile, media, services, locations, service areas, availability
-- Evolves 20260818_therapists.sql — run after prior migrations

-- ─── Profile: nationality vs ethnicity, DOB not age, optional physical fields ───

alter table public.therapists
  add column if not exists nationality text,
  add column if not exists date_of_birth date,
  add column if not exists height_cm integer check (height_cm is null or (height_cm >= 100 and height_cm <= 250)),
  add column if not exists weight_kg integer check (weight_kg is null or (weight_kg >= 30 and weight_kg <= 200)),
  add column if not exists status text not null default 'active'
    check (status in ('draft', 'active', 'inactive', 'suspended')),
  add column if not exists verified boolean not null default false,
  add column if not exists show_age boolean not null default true,
  add column if not exists show_height boolean not null default false,
  add column if not exists show_weight boolean not null default false,
  add column if not exists show_ethnicity boolean not null default false,
  add column if not exists show_nationality boolean not null default false;

-- Migrate legacy age → approximate date_of_birth (Jan 1 of birth year)
update public.therapists
set date_of_birth = make_date(extract(year from current_date)::int - age, 1, 1)
where age is not null and date_of_birth is null;

-- Migrate status from is_active / is_bookable
update public.therapists
set status = case
  when is_active = true and is_bookable = true then 'active'
  when is_active = false then 'inactive'
  else 'draft'
end
where status = 'active' and (is_active = false or is_bookable = false);

-- Parse legacy height "165 cm" → height_cm where possible
update public.therapists
set height_cm = nullif(regexp_replace(height, '[^0-9]', '', 'g'), '')::integer
where height_cm is null and height ~ '[0-9]';

update public.therapists
set weight_kg = nullif(regexp_replace(weight, '[^0-9]', '', 'g'), '')::integer
where weight_kg is null and weight ~ '[0-9]';

-- ─── Internal base location (never expose exact address to customers) ───

create table if not exists public.therapist_locations (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null unique references public.therapists (id) on delete cascade,
  city text not null default '',
  country text not null default '',
  region text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  service_radius_km numeric not null default 12 check (service_radius_km > 0),
  public_area_summary text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists therapist_locations_therapist_id_idx on public.therapist_locations (therapist_id);

-- Migrate embedded therapist geo → therapist_locations
insert into public.therapist_locations (
  therapist_id, city, country, region, latitude, longitude, service_radius_km, public_area_summary
)
select
  id,
  coalesce(nullif(city, ''), 'Chiang Mai'),
  coalesce(nullif(country, ''), 'Thailand'),
  '',
  coalesce(latitude, 18.7883),
  coalesce(longitude, 98.9853),
  coalesce(service_radius_km, 12),
  coalesce(nullif(area_label, ''), '')
from public.therapists t
where not exists (
  select 1 from public.therapist_locations tl where tl.therapist_id = t.id
)
on conflict (therapist_id) do nothing;

create trigger therapist_locations_set_updated_at
  before update on public.therapist_locations
  for each row execute function public.set_updated_at();

-- ─── Service areas (coverage_areas) — customer-facing geography ───

alter table public.coverage_areas
  add column if not exists country text not null default 'Thailand',
  add column if not exists region text not null default '',
  add column if not exists public_label text not null default '';

update public.coverage_areas
set public_label = name
where public_label = '';

-- ─── therapist_service_areas (was therapist_coverage) ───

alter table public.therapist_coverage
  add column if not exists active boolean not null default true,
  add column if not exists radius_km numeric check (radius_km is null or radius_km > 0),
  add column if not exists created_at timestamptz not null default now();

alter table public.therapist_coverage rename to therapist_service_areas;

-- ─── therapist_media (was therapist_photos) ───

alter table public.therapist_photos
  add column if not exists media_type text not null default 'photo'
    check (media_type in ('photo', 'video')),
  add column if not exists thumbnail_url text,
  add column if not exists alt_text text;

alter table public.therapist_photos rename column photo_url to url;

alter table public.therapist_photos rename to therapist_media;

alter index if exists therapist_photos_therapist_id_idx rename to therapist_media_therapist_id_idx;

-- ─── therapist_services: active flag ───

alter table public.therapist_services
  add column if not exists active boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

-- ─── Availability (schema for booking engine — Phase 10) ───

create table if not exists public.therapist_availability (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists therapist_availability_therapist_id_idx
  on public.therapist_availability (therapist_id);

create table if not exists public.therapist_unavailability (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists therapist_unavailability_therapist_id_idx
  on public.therapist_unavailability (therapist_id);

-- ─── RLS for new tables ───

alter table public.therapist_locations enable row level security;
alter table public.therapist_availability enable row level security;
alter table public.therapist_unavailability enable row level security;

drop policy if exists "Public read therapist photos" on public.therapist_media;
drop policy if exists "Admin manage therapist photos" on public.therapist_media;
drop policy if exists "Public read therapist coverage" on public.therapist_service_areas;
drop policy if exists "Admin manage therapist coverage" on public.therapist_service_areas;

create policy "Public read active therapist media"
  on public.therapist_media for select
  using (
    exists (
      select 1 from public.therapists t
      where t.id = therapist_id and t.status = 'active' and t.is_active and t.is_bookable
    )
  );

create policy "Admin manage therapist media"
  on public.therapist_media for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public read therapist service areas"
  on public.therapist_service_areas for select
  using (active = true);

create policy "Admin manage therapist service areas"
  on public.therapist_service_areas for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin manage therapist locations"
  on public.therapist_locations for all
  using (public.is_admin())
  with check (public.is_admin());

-- No public read on therapist_locations — coordinates stay internal

create policy "Public read therapist availability"
  on public.therapist_availability for select
  using (
    active = true
    and exists (
      select 1 from public.therapists t
      where t.id = therapist_id and t.status = 'active'
    )
  );

create policy "Admin manage therapist availability"
  on public.therapist_availability for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin manage therapist unavailability"
  on public.therapist_unavailability for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Server-side eligibility (service + service area + near-me) ───

create or replace function public.find_eligible_therapists(
  p_service_slug text default null,
  p_coverage_slug text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_search_radius_km double precision default 25
)
returns table (
  therapist_id uuid,
  distance_km double precision
)
language sql
stable
as $$
  select distinct on (t.id)
    t.id as therapist_id,
    case
      when p_lat is not null and p_lng is not null then
        public.haversine_km(p_lat, p_lng, tl.latitude, tl.longitude)
      else null::double precision
    end as distance_km
  from public.therapists t
  inner join public.therapist_locations tl
    on tl.therapist_id = t.id and tl.active = true
  where coalesce(t.status, 'active') = 'active'
    and t.is_active = true
    and t.is_bookable = true
    and (
      p_service_slug is null
      or exists (
        select 1
        from public.therapist_services ts
        inner join public.services s on s.id = ts.service_id
        where ts.therapist_id = t.id
          and ts.active = true
          and s.slug = p_service_slug
          and s.is_active = true
      )
    )
    and (
      p_coverage_slug is null
      or exists (
        select 1
        from public.therapist_service_areas tsa
        inner join public.coverage_areas ca on ca.id = tsa.coverage_area_id
        where tsa.therapist_id = t.id
          and tsa.active = true
          and ca.slug = p_coverage_slug
          and ca.is_active = true
      )
    )
    and (
      p_lat is null or p_lng is null
      or public.haversine_km(p_lat, p_lng, tl.latitude, tl.longitude)
         <= least(p_search_radius_km, tl.service_radius_km::double precision)
    )
  order by t.id, distance_km nulls last;
$$;
