-- Phase 10C: Location eligibility layer
-- SECURITY DEFINER functions read internal coords server-side; only distance + public summaries exposed.

-- ─── Resolve nearest coverage zone from client coordinates ───

create or replace function public.resolve_coverage_area(
  p_lat double precision,
  p_lng double precision,
  p_max_km double precision default 20
)
returns table (
  coverage_slug text,
  coverage_name text,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ca.slug,
    coalesce(nullif(trim(ca.public_label), ''), ca.name),
    public.haversine_km(p_lat, p_lng, ca.latitude, ca.longitude) as distance_km
  from public.coverage_areas ca
  where ca.is_active = true
    and ca.latitude is not null
    and ca.longitude is not null
    and public.haversine_km(p_lat, p_lng, ca.latitude, ca.longitude) <= p_max_km
  order by distance_km asc
  limit 1;
$$;

-- ─── Public location summaries (no coordinates) ───

create or replace function public.get_therapist_public_locations(p_therapist_ids uuid[])
returns table (
  therapist_id uuid,
  city text,
  country text,
  public_area_summary text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    tl.therapist_id,
    tl.city,
    tl.country,
    tl.public_area_summary
  from public.therapist_locations tl
  where tl.therapist_id = any (p_therapist_ids)
    and tl.active = true;
$$;

-- ─── Eligible therapists: service + coverage + distance (haversine) ───
-- Eligibility ≠ visibility ≠ bookability (availability added in Phase 10D).

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
security definer
set search_path = public
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
  where t.status = 'active'
    and t.is_active = true
    and t.is_bookable = true
    and (
      p_service_slug is null
      or exists (
        select 1
        from public.therapist_services ts
        inner join public.services s on s.id = ts.service_id
        where ts.therapist_id = t.id
          and coalesce(ts.active, true) = true
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
          and coalesce(tsa.active, true) = true
          and ca.slug = p_coverage_slug
          and ca.is_active = true
      )
    )
    and (
      p_lat is null
      or p_lng is null
      or public.haversine_km(p_lat, p_lng, tl.latitude, tl.longitude)
        <= least(p_search_radius_km, tl.service_radius_km::double precision)
    )
  order by t.id, distance_km nulls last;
$$;

grant execute on function public.resolve_coverage_area(double precision, double precision, double precision)
  to anon, authenticated;
grant execute on function public.get_therapist_public_locations(uuid[])
  to anon, authenticated;
grant execute on function public.find_eligible_therapists(text, text, double precision, double precision, double precision)
  to anon, authenticated;
