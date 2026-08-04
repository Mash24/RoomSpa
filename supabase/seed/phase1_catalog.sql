-- Seed catalog for RoomSpa Phase 1
-- Run after 20260804_phase1_booking.sql

insert into public.services (
  slug, name, summary, duration_minutes, price_thb, stripe_product_id, stripe_price_id, is_active, sort_order
) values
(
  'swedish',
  'Swedish Massage',
  'Classic full-body therapy to relax the body, ease muscle tension, and boost circulation.',
  60,
  800,
  'prod_V0lNbo1klB5AQn',
  'price_1U0jqz2E50DqFYh5G4dF1w1M',
  true,
  1
),
(
  'couples',
  'Couples Massage',
  'Shared spa experience for two people with simultaneous treatments in the same private room.',
  60,
  2500,
  'prod_V0lPwaRImIqAPQ',
  'price_1U0jsJ2E50DqFYh5EItwggZ4',
  true,
  2
)
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  duration_minutes = excluded.duration_minutes,
  price_thb = excluded.price_thb,
  stripe_product_id = excluded.stripe_product_id,
  stripe_price_id = excluded.stripe_price_id,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.coverage_areas (slug, name, city, is_active, travel_fee_thb, notes)
values
(
  'chiang-mai-old-city',
  'Old City / Center',
  'Chiang Mai',
  true,
  0,
  'Core coverage — no travel fee for standard bookings.'
),
(
  'chiang-mai-nimman',
  'Nimman / University area',
  'Chiang Mai',
  true,
  0,
  'Popular with hotels and condos.'
),
(
  'chiang-mai-airport',
  'Airport / Hang Dong corridor',
  'Chiang Mai',
  true,
  100,
  'Light travel fee may apply depending on distance.'
)
on conflict (slug) do update set
  name = excluded.name,
  city = excluded.city,
  is_active = excluded.is_active,
  travel_fee_thb = excluded.travel_fee_thb,
  notes = excluded.notes;
