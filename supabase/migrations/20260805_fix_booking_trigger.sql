-- Fix: double-booking guard should not block payment/PIN updates
-- Run in Supabase SQL Editor BEFORE or WITH booking_pin migration

create or replace function public.prevent_double_booking()
returns trigger
language plpgsql
as $$
begin
  -- Payment, PIN, and other non-scheduling updates must not re-check the slot.
  if tg_op = 'UPDATE' then
    if new.scheduled_date is not distinct from old.scheduled_date
       and new.scheduled_time is not distinct from old.scheduled_time
       and new.status is not distinct from old.status then
      return new;
    end if;
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.scheduled_date = new.scheduled_date
      and b.scheduled_time = new.scheduled_time
      and b.status in ('pending', 'confirmed')
      and b.id is distinct from new.id
  ) then
    raise exception 'This time slot is already booked';
  end if;

  return new;
end;
$$;
