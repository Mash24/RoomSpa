-- Booking PIN + payment method fixes
-- Run in Supabase SQL Editor
-- If this failed with "This time slot is already booked", run
-- 20260805_fix_booking_trigger.sql first, then re-run this file.

alter table public.bookings
  drop constraint if exists bookings_payment_method_check;

alter table public.bookings
  add column if not exists access_pin text;

update public.bookings
set payment_method = 'cash'
where payment_method = 'not_selected';

alter table public.bookings
  alter column payment_method set default 'cash';

alter table public.bookings
  add constraint bookings_payment_method_check
  check (payment_method in ('cash', 'card_later', 'card_now', 'card'));

-- Drop old email-only lookup (insecure)
drop function if exists public.get_unpaid_bookings_for_email(text);

create or replace function public.get_bookings_for_email_and_pin(p_email text, p_pin text)
returns table (
  id uuid,
  reference_code text,
  service_name text,
  service_slug text,
  stripe_price_id text,
  scheduled_date date,
  scheduled_time time,
  amount_thb integer,
  status public.booking_status,
  payment_status text,
  payment_method text
)
language sql
security definer
set search_path = public
as $$
  select
    b.id,
    b.reference_code,
    s.name as service_name,
    s.slug as service_slug,
    s.stripe_price_id,
    b.scheduled_date,
    b.scheduled_time,
    b.amount_thb,
    b.status,
    coalesce(b.payment_status, 'unpaid') as payment_status,
    b.payment_method
  from public.bookings b
  join public.services s on s.id = b.service_id
  where lower(b.customer_email) = lower(trim(p_email))
    and b.access_pin = trim(p_pin)
    and b.status in ('pending', 'confirmed')
  order by b.scheduled_date desc, b.scheduled_time desc;
$$;

create or replace function public.mark_booking_paid(
  p_booking_id uuid,
  p_stripe_session_id text,
  p_stripe_payment_intent_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
  set
    payment_status = 'paid',
    payment_method = 'card',
    stripe_checkout_session_id = p_stripe_session_id,
    stripe_payment_intent_id = p_stripe_payment_intent_id,
    paid_at = now(),
    updated_at = now()
  where id = p_booking_id
    and coalesce(payment_status, 'unpaid') = 'unpaid';

  return found;
end;
$$;

revoke all on function public.get_bookings_for_email_and_pin(text, text) from public;
grant execute on function public.get_bookings_for_email_and_pin(text, text) to anon, authenticated;

revoke all on function public.mark_booking_paid(uuid, text, text) from public;
grant execute on function public.mark_booking_paid(uuid, text, text) to anon, authenticated;
