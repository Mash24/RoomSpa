-- Allow concurrent bookings at the same date/time.
-- Multiple therapists can take appointments in parallel.
-- Run in Supabase SQL Editor

drop trigger if exists bookings_prevent_double_booking on public.bookings;
drop function if exists public.prevent_double_booking();
