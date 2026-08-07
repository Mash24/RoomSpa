-- Full mobile massage catalog seed
-- Run after 20260804_phase1_booking.sql (or re-run anytime to upsert)

insert into public.services (
  slug, name, summary, duration_minutes, price_thb, stripe_product_id, stripe_price_id, is_active, sort_order
) values
(
  'swedish',
  'Swedish Massage',
  'Classic full-body therapy with long, flowing strokes to ease tension and improve circulation.',
  60, 800, null, null, true, 1
),
(
  'aromatherapy',
  'Aromatherapy Massage',
  'Gentle massage with essential oils chosen for calm, clarity, or deep rest.',
  60, 1000, null, null, true, 2
),
(
  'hot-oil',
  'Hot Oil Massage',
  'Warm oil poured and massaged along the body for deep heat and glide.',
  75, 1200, null, null, true, 3
),
(
  'balinese',
  'Balinese Massage',
  'Rhythmic palm pressure, stretching, and acupressure for full-body release.',
  75, 1100, null, null, true, 4
),
(
  'oil',
  'Full Body Oil Massage',
  'Smooth oil-based full-body massage tailored to your preferred pressure.',
  60, 900, null, null, true, 5
),
(
  'deep-tissue',
  'Deep Tissue',
  'Firm, targeted pressure for knots, travel fatigue, and desk strain.',
  75, 1100, null, null, true, 6
),
(
  'thai',
  'Thai Massage',
  'Traditional Thai stretching, compression, and energy-line work — usually clothed.',
  75, 1000, null, null, true, 7
),
(
  'sports',
  'Sports Massage',
  'Pre- or post-activity work for athletes, hikers, and active travelers.',
  60, 1100, null, null, true, 8
),
(
  'foot-reflexology',
  'Foot Reflexology',
  'Focused foot and lower-leg work mapped to whole-body relaxation.',
  50, 700, null, null, true, 9
),
(
  'head-shoulder',
  'Head, Neck & Shoulder',
  'Upper-body relief for laptop strain, headaches, and stiff necks.',
  45, 600, null, null, true, 10
),
(
  'prenatal',
  'Prenatal Massage',
  'Side-lying, pregnancy-safe techniques for comfort and circulation.',
  60, 1100, null, null, true, 11
),
(
  'lymphatic',
  'Lymphatic Drainage',
  'Light, rhythmic strokes to support fluid movement and a lighter feel.',
  60, 1200, null, null, true, 12
),
(
  'couples',
  'Couples Massage',
  'Two therapists, side by side, in the same private room.',
  60, 2500, null, null, true, 13
),
(
  'four-hands',
  'Four-Hands Massage',
  'Two therapists work on one guest in synchronized rhythm.',
  60, 2200, null, null, true, 14
),
(
  'nuru',
  'Nuru Massage',
  'Full-body Nuru gel massage with smooth, continuous contact — private and consent-led.',
  75, 3500, null, null, true, 15
),
(
  'body-to-body',
  'Body-to-Body Massage',
  'Close-contact oil massage using the therapist body for broad, flowing pressure.',
  75, 3000, null, null, true, 16
),
(
  'yoni',
  'Yoni Massage',
  'Tantric, consent-based genital massage for women — presence, breath, and body trust.',
  75, 2800, null, null, true, 17
),
(
  'lingam',
  'Lingam Massage',
  'Tantric, consent-based genital massage for men — awareness, breath, and relaxation.',
  75, 2800, null, null, true, 18
),
(
  'tantric',
  'Tantric Massage',
  'Slow, full-body tantric touch combining breath, presence, and energy awareness.',
  90, 3200, null, null, true, 19
),
(
  'couples-sensual',
  'Couples Sensual / Tantric',
  'Guided dual session for partners who want shared intimacy and relaxation at home.',
  90, 4500, null, null, true, 20
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
