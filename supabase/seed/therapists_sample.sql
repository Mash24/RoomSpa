-- Sample therapists for Chiang Mai (run after 20260819_marketplace_therapist_model.sql)

insert into public.therapists (
  slug, display_name, gender, date_of_birth, height_cm, weight_kg, nationality, ethnicity, bio,
  status, verified, show_age, show_nationality, featured, sort_order,
  is_active, is_bookable
) values
  (
    'lina', 'Lina', 'female', '1998-03-15', 165, 52, 'Thai', 'Thai',
    'Calm, intuitive touch with ten years of in-room spa experience across Chiang Mai.',
    'active', true, true, true, true, 10, true, true
  ),
  (
    'maya', 'Maya', 'female', '2000-07-22', 160, 48, 'Thai', 'Thai-Lanna',
    'Warm, discreet, and professional. Trained in nuru gel technique and couples sessions.',
    'active', true, true, true, true, 20, true, true
  ),
  (
    'som', 'Som', 'male', '1994-11-08', 178, 72, 'Thai', 'Thai',
    'Strong therapeutic hands with a gentle finish.',
    'active', false, true, true, false, 30, true, true
  )
on conflict (slug) do update set
  display_name = excluded.display_name,
  bio = excluded.bio,
  updated_at = now();

-- Internal base locations (not shown to clients)
insert into public.therapist_locations (
  therapist_id, city, country, latitude, longitude, service_radius_km, public_area_summary
)
select t.id, 'Chiang Mai', 'Thailand', v.lat, v.lng, v.radius, v.summary
from public.therapists t
join (
  values
    ('lina', 18.7995, 98.9685, 10, 'Usually available around Nimman & Old City'),
    ('maya', 18.7905, 98.9910, 8, 'Usually available around Old City & Nimman'),
    ('som', 18.7685, 98.9635, 14, 'Usually available around Airport corridor & Hang Dong')
) as v(slug, lat, lng, radius, summary) on v.slug = t.slug
on conflict (therapist_id) do update set
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  service_radius_km = excluded.service_radius_km,
  public_area_summary = excluded.public_area_summary,
  updated_at = now();

delete from public.therapist_media
where therapist_id in (select id from public.therapists where slug in ('lina', 'maya', 'som'));

insert into public.therapist_media (therapist_id, url, media_type, sort_order, is_primary)
select t.id, p.url, 'photo', p.sort_order, p.is_primary
from public.therapists t
join (
  values
    ('lina', '/media/marketing/signature/yoni.jpg', 0, true),
    ('lina', '/media/marketing/signature/nuru.jpg', 1, false),
    ('maya', '/media/marketing/signature/tantric.jpg', 0, true),
    ('maya', '/media/marketing/signature/couples-sensual.jpg', 1, false),
    ('som', '/media/marketing/signature/lingam.jpg', 0, true)
) as p(slug, url, sort_order, is_primary) on p.slug = t.slug;

insert into public.therapist_services (therapist_id, service_id, active)
select t.id, s.id, true
from public.therapists t
cross join public.services s
where (t.slug = 'lina' and s.slug in ('nuru', 'yoni', 'tantric', 'body-to-body'))
   or (t.slug = 'maya' and s.slug in ('nuru', 'couples-sensual', 'tantric', 'body-to-body'))
   or (t.slug = 'som' and s.slug in ('lingam', 'deep-tissue', 'sports', 'oil'))
on conflict do nothing;

insert into public.therapist_service_areas (therapist_id, coverage_area_id, active)
select t.id, c.id, true
from public.therapists t
cross join public.coverage_areas c
where (t.slug = 'lina' and c.slug in ('chiang-mai-nimman', 'chiang-mai-old-city'))
   or (t.slug = 'maya' and c.slug in ('chiang-mai-old-city', 'chiang-mai-nimman'))
   or (t.slug = 'som' and c.slug in ('chiang-mai-airport', 'chiang-mai-nimman'))
on conflict do nothing;
