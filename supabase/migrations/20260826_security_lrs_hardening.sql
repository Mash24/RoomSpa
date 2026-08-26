-- Low-risk security hardening (RoomSpa production advisors)
-- 1) RLS on therapist_locations (coords stay admin-only)
-- 2) Fixed search_path on helper/trigger functions
-- 3) Revoke anon execute on admin/trigger SECURITY DEFINER RPCs

alter table public.therapist_locations enable row level security;

drop policy if exists "Admins manage therapist locations" on public.therapist_locations;
create policy "Admins manage therapist locations"
  on public.therapist_locations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_booking_reference()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.reference_code is null or new.reference_code = '' then
    new.reference_code := 'RS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;

create or replace function public.haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
returns double precision
language sql
immutable
parallel safe
set search_path = public
as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- Trigger-only: must not be callable via PostgREST
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

-- Admin dashboard: authenticated only (function still checks is_admin())
revoke all on function public.get_admin_dashboard_stats() from public;
revoke all on function public.get_admin_dashboard_stats() from anon;
grant execute on function public.get_admin_dashboard_stats() to authenticated, service_role;
