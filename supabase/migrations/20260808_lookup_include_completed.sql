-- Include completed bookings in guest lookup so My booking can prompt reviews
-- after the session (pending/confirmed still used for pay & manage).

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
    and b.status in ('pending', 'confirmed', 'completed')
  order by b.scheduled_date desc, b.scheduled_time desc;
$$;

revoke all on function public.get_bookings_for_email_and_pin(text, text) from public;
grant execute on function public.get_bookings_for_email_and_pin(text, text) to anon, authenticated;
