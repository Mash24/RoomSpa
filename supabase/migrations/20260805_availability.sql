-- Public availability without exposing guest details
-- Run in Supabase SQL Editor

create or replace function public.get_slot_booking_counts(p_date date)
returns table (
  scheduled_time time,
  booking_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.scheduled_time,
    count(*)::bigint as booking_count
  from public.bookings b
  where b.scheduled_date = p_date
    and b.status in ('pending', 'confirmed')
  group by b.scheduled_time
  order by b.scheduled_time;
$$;

revoke all on function public.get_slot_booking_counts(date) from public;
grant execute on function public.get_slot_booking_counts(date) to anon, authenticated;
