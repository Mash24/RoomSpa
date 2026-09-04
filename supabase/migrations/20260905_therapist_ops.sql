-- Therapist ops system: lifecycle, languages/experience, service qualification, photo approval

-- ─── Lifecycle status ───

alter table public.therapists drop constraint if exists therapists_status_check;

alter table public.therapists
  add constraint therapists_status_check
  check (status in (
    'applicant',
    'interviewed',
    'skills_verified',
    'trial',
    'draft',
    'active',
    'fully_booked',
    'temporarily_unavailable',
    'on_leave',
    'suspended',
    'inactive'
  ));

-- ─── Profile / ops columns ───

alter table public.therapists
  add column if not exists languages text[] not null default '{}',
  add column if not exists years_experience integer
    check (years_experience is null or (years_experience >= 0 and years_experience <= 60)),
  add column if not exists training text not null default '',
  add column if not exists accepting_bookings boolean not null default true,
  add column if not exists internal_notes text not null default '',
  add column if not exists phone text,
  add column if not exists skill_score smallint check (skill_score is null or (skill_score between 1 and 10)),
  add column if not exists professionalism_score smallint check (professionalism_score is null or (professionalism_score between 1 and 10)),
  add column if not exists communication_score smallint check (communication_score is null or (communication_score between 1 and 10)),
  add column if not exists reliability_score smallint check (reliability_score is null or (reliability_score between 1 and 10)),
  add column if not exists punctuality_score smallint check (punctuality_score is null or (punctuality_score between 1 and 10)),
  add column if not exists feedback_score smallint check (feedback_score is null or (feedback_score between 1 and 10));

-- ─── Service qualification ───

alter table public.therapist_services
  add column if not exists claimed boolean not null default true,
  add column if not exists tested boolean not null default false,
  add column if not exists approved boolean not null default false;

-- Existing linked services were already marketed — treat as fully qualified.
update public.therapist_services
set claimed = true, tested = true, approved = true
where coalesce(active, true) = true;

alter table public.therapist_services drop constraint if exists therapist_services_qualification_check;
alter table public.therapist_services
  add constraint therapist_services_qualification_check
  check (
    (not tested or claimed)
    and (not approved or tested)
  );

-- ─── Photo approval ───

alter table public.therapist_media
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected'));

update public.therapist_media
set approval_status = 'approved'
where approval_status = 'pending';

-- ─── Public eligibility helper (status + accepting) ───
-- Full photo/service checks stay in application layer; RPC still filters lifecycle.

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
  where t.status in ('active', 'fully_booked')
    and coalesce(t.accepting_bookings, true) = true
    and t.is_active = true
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
      p_lat is null or p_lng is null
      or p_city is not null
      or public.haversine_km(p_lat, p_lng, tl.latitude, tl.longitude)
         <= least(p_search_radius_km, tl.service_radius_km::double precision)
    )
    and exists (
      select 1 from public.therapist_media tm
      where tm.therapist_id = t.id
        and tm.approval_status = 'approved'
        and tm.is_primary = true
    )
    and exists (
      select 1 from public.therapist_services ts2
      where ts2.therapist_id = t.id
        and coalesce(ts2.active, true) = true
        and coalesce(ts2.approved, false) = true
    )
  order by t.id, distance_km nulls last;
$$;
