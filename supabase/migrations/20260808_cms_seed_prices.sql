-- Seed 60 / 90 / 120 prices from current services.price_thb (treated as 60-min base)
-- Run after 20260808_cms_services_media.sql

insert into public.service_prices (service_id, duration_minutes, price_thb, is_active)
select
  s.id,
  tier.duration_minutes,
  tier.price_thb,
  true
from public.services s
cross join lateral (
  values
    (60, s.price_thb),
    (90, greatest(s.price_thb + 200, (round((s.price_thb * 1.4) / 50.0) * 50)::int)),
    (120, greatest(s.price_thb + 400, (round((s.price_thb * 1.75) / 50.0) * 50)::int))
) as tier(duration_minutes, price_thb)
on conflict (service_id, duration_minutes) do update
set
  price_thb = excluded.price_thb,
  is_active = true,
  updated_at = now();

-- Backfill editorial columns from existing name/summary when empty
update public.services
set
  duration_label = case
    when coalesce(duration_label, '') = '' then duration_minutes || ' min'
    else duration_label
  end,
  bookable = coalesce(bookable, true),
  updated_at = now();
