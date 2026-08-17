-- Phase 10D: Therapist slot-resolution engine (schedule data layer)
-- Slot computation runs in application code; this function supplies canonical schedule inputs.

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

alter table public.therapist_availability enable row level security;
alter table public.therapist_unavailability enable row level security;

drop policy if exists "Public read therapist availability" on public.therapist_availability;
create policy "Public read therapist availability"
  on public.therapist_availability for select
  using (
    active = true
    and exists (
      select 1 from public.therapists t
      where t.id = therapist_id and t.status = 'active'
    )
  );

drop policy if exists "Admin manage therapist availability" on public.therapist_availability;
create policy "Admin manage therapist availability"
  on public.therapist_availability for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin manage therapist unavailability" on public.therapist_unavailability;
create policy "Admin manage therapist unavailability"
  on public.therapist_unavailability for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.fetch_therapist_schedule(
  p_therapist_ids uuid[],
  p_date date
)
returns table (
  therapist_id uuid,
  kind text,
  start_min smallint,
  end_min smallint
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select
      (p_date::text || ' 00:00:00')::timestamp at time zone 'Asia/Bangkok' as day_start,
      ((p_date + 1)::text || ' 00:00:00')::timestamp at time zone 'Asia/Bangkok' as day_end,
      extract(dow from p_date)::smallint as dow
  )
  select
    ta.therapist_id,
    'work'::text as kind,
    (extract(hour from ta.start_time) * 60 + extract(minute from ta.start_time))::smallint as start_min,
    (extract(hour from ta.end_time) * 60 + extract(minute from ta.end_time))::smallint as end_min
  from public.therapist_availability ta
  cross join bounds b
  where ta.therapist_id = any (p_therapist_ids)
    and ta.active = true
    and ta.day_of_week = b.dow

  union all

  select
    b.therapist_id,
    'booking'::text as kind,
    (extract(hour from b.scheduled_time) * 60 + extract(minute from b.scheduled_time))::smallint as start_min,
    (
      extract(hour from b.scheduled_time) * 60
      + extract(minute from b.scheduled_time)
      + coalesce(b.duration_minutes, 60)
    )::smallint as end_min
  from public.bookings b
  where b.therapist_id = any (p_therapist_ids)
    and b.therapist_id is not null
    and b.scheduled_date = p_date
    and b.status in ('pending', 'confirmed')

  union all

  select
    tu.therapist_id,
    'unavailability'::text as kind,
    greatest(
      0,
      (extract(epoch from (greatest(tu.start_at, b.day_start) - b.day_start)) / 60)::integer
    )::smallint as start_min,
    least(
      1440,
      (extract(epoch from (least(tu.end_at, b.day_end) - b.day_start)) / 60)::integer
    )::smallint as end_min
  from public.therapist_unavailability tu
  cross join bounds b
  where tu.therapist_id = any (p_therapist_ids)
    and tu.start_at < b.day_end
    and tu.end_at > b.day_start
    and greatest(
      0,
      (extract(epoch from (greatest(tu.start_at, b.day_start) - b.day_start)) / 60)::integer
    )
    < least(
      1440,
      (extract(epoch from (least(tu.end_at, b.day_end) - b.day_start)) / 60)::integer
    );
$$;

grant execute on function public.fetch_therapist_schedule(uuid[], date)
  to anon, authenticated;

create index if not exists bookings_therapist_date_idx
  on public.bookings (therapist_id, scheduled_date)
  where therapist_id is not null;

drop policy if exists "Public read therapist unavailability" on public.therapist_unavailability;
create policy "Public read therapist unavailability"
  on public.therapist_unavailability for select
  using (
    exists (
      select 1 from public.therapists t
      where t.id = therapist_id and t.status = 'active' and t.is_active = true
    )
  );
