-- Optional payment method + secure email lookup for pay-later
-- Run in Supabase SQL Editor

alter table public.bookings
  add column if not exists payment_method text not null default 'not_selected'
    check (payment_method in ('not_selected', 'cash', 'card'));

create or replace function public.get_unpaid_bookings_for_email(p_email text)
returns table (
  id uuid,
  reference_code text,
  service_name text,
  service_slug text,
  stripe_price_id text,
  scheduled_date date,
  scheduled_time time,
  amount_thb integer
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
    b.amount_thb
  from public.bookings b
  join public.services s on s.id = b.service_id
  where lower(b.customer_email) = lower(trim(p_email))
    and coalesce(b.payment_status, 'unpaid') = 'unpaid'
    and b.status in ('pending', 'confirmed')
  order by b.scheduled_date desc, b.scheduled_time desc;
$$;

revoke all on function public.get_unpaid_bookings_for_email(text) from public;
grant execute on function public.get_unpaid_bookings_for_email(text) to anon, authenticated;
