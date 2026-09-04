-- Restore SECURITY DEFINER so gallery queries work under anon RLS.
-- Gallery visibility uses show_on_gallery; accepting_bookings is enforced in app for booking CTAs.

create or replace function public.find_eligible_therapists(
  p_service_slug text default null,
  p_coverage_slug text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_search_radius_km double precision default 25,
  p_city text default null
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
  where coalesce(t.show_on_gallery, false) = true
    and t.status not in ('suspended', 'inactive')
    and coalesce(t.is_active, true) = true
    and (
      p_city is null
      or lower(trim(tl.city)) = lower(trim(p_city))
    )
    and (
      p_service_slug is null
      or exists (
        select 1
        from public.therapist_services ts
        inner join public.services s on s.id = ts.service_id
        where ts.therapist_id = t.id
          and coalesce(ts.active, true) = true
          and coalesce(ts.approved, false) = true
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
        <= coalesce(tl.service_radius_km, p_search_radius_km, 25)
    )
  order by t.id, distance_km nulls last;
$$;

grant execute on function public.find_eligible_therapists(text, text, double precision, double precision, double precision, text)
  to anon, authenticated, service_role;
