-- Expanded therapist lifecycle statuses (marketplace visibility vs bookability)

alter table public.therapists drop constraint if exists therapists_status_check;

alter table public.therapists
  add constraint therapists_status_check
  check (status in (
    'draft',
    'active',
    'temporarily_unavailable',
    'on_leave',
    'suspended',
    'inactive'
  ));

-- Only active therapists appear in public discovery / eligibility RPC
create or replace function public.find_eligible_therapists(
  p_service_slug text default null,
  p_coverage_slug text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_search_radius_km double precision default 25
)
returns table (therapist_id uuid, distance_km double precision)
language sql stable as $$
  select distinct on (t.id)
    t.id as therapist_id,
    case when p_lat is not null and p_lng is not null then
      public.haversine_km(p_lat, p_lng, tl.latitude, tl.longitude)
      else null::double precision end as distance_km
  from public.therapists t
  inner join public.therapist_locations tl on tl.therapist_id = t.id and tl.active
  where t.status = 'active' and t.is_active and t.is_bookable
    and (p_service_slug is null or exists (
      select 1 from public.therapist_services ts join public.services s on s.id = ts.service_id
      where ts.therapist_id = t.id and coalesce(ts.active, true) and s.slug = p_service_slug and s.is_active))
    and (p_coverage_slug is null or exists (
      select 1 from public.therapist_service_areas tsa join public.coverage_areas ca on ca.id = tsa.coverage_area_id
      where tsa.therapist_id = t.id and coalesce(tsa.active, true) and ca.slug = p_coverage_slug and ca.is_active))
    and (p_lat is null or p_lng is null or public.haversine_km(p_lat,p_lng,tl.latitude,tl.longitude)
      <= least(p_search_radius_km, tl.service_radius_km::double precision))
  order by t.id, distance_km nulls last;
$$;
