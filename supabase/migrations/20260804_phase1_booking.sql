-- RoomSpa Phase 1 booking schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- Roles for future auth mapping (guest bookings allowed without login)
create type public.user_role as enum ('guest', 'customer', 'therapist', 'admin');
create type public.location_type as enum ('hotel', 'condo', 'home');
create type public.booking_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null default '',
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  price_thb integer not null check (price_thb >= 0),
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coverage_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  is_active boolean not null default true,
  travel_fee_thb integer not null default 0 check (travel_fee_thb >= 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  preferred_language text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  service_id uuid not null references public.services (id),
  coverage_area_id uuid references public.coverage_areas (id),
  customer_id uuid references public.profiles (id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  location_type public.location_type not null,
  location_label text not null,
  location_details text not null default '',
  scheduled_date date not null,
  scheduled_time time not null,
  status public.booking_status not null default 'pending',
  amount_thb integer not null check (amount_thb >= 0),
  currency text not null default 'thb',
  notes text not null default '',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_scheduled_idx
  on public.bookings (scheduled_date, scheduled_time);

create index if not exists bookings_status_idx
  on public.bookings (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Concurrent same-time bookings are allowed (multi-therapist).
-- Capacity / therapist assignment can be added later.

create or replace function public.generate_booking_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference_code is null or new.reference_code = '' then
    new.reference_code := 'RS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_generate_reference on public.bookings;
create trigger bookings_generate_reference
before insert on public.bookings
for each row execute function public.generate_booking_reference();

alter table public.services enable row level security;
alter table public.coverage_areas enable row level security;
alter table public.bookings enable row level security;
alter table public.profiles enable row level security;

-- Public read for catalog
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
on public.services for select
using (is_active = true);

drop policy if exists "Public can read active coverage" on public.coverage_areas;
create policy "Public can read active coverage"
on public.coverage_areas for select
using (is_active = true);

-- Guest booking insert via anon key (validated in API too)
drop policy if exists "Anyone can create bookings" on public.bookings;
create policy "Anyone can create bookings"
on public.bookings for insert
to anon, authenticated
with check (true);

-- Customers can read their own bookings when logged in
drop policy if exists "Users read own bookings" on public.bookings;
create policy "Users read own bookings"
on public.bookings for select
to authenticated
using (customer_id = auth.uid() or customer_email = auth.jwt() ->> 'email');

-- Profiles: users manage self
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid());
