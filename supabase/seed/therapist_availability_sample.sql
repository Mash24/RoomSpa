-- Sample working hours for marketplace therapists (Phase 10D)
-- day_of_week: 0 = Sunday … 6 = Saturday (PostgreSQL dow)

delete from public.therapist_availability
where therapist_id in (select id from public.therapists where slug in ('lina', 'maya', 'som'));

insert into public.therapist_availability (therapist_id, day_of_week, start_time, end_time, active)
select t.id, d.dow, d.start_time::time, d.end_time::time, true
from public.therapists t
cross join (
  values
    ('lina', 0, '16:00', '23:00'),
    ('lina', 1, '16:00', '23:00'),
    ('lina', 2, '16:00', '23:00'),
    ('lina', 3, '16:00', '23:00'),
    ('lina', 4, '16:00', '23:00'),
    ('lina', 5, '16:00', '23:00'),
    ('lina', 6, '16:00', '23:00'),
    ('maya', 0, '18:00', '22:00'),
    ('maya', 1, '18:00', '22:00'),
    ('maya', 2, '18:00', '22:00'),
    ('maya', 3, '18:00', '22:00'),
    ('maya', 4, '18:00', '22:00'),
    ('maya', 5, '18:00', '22:00'),
    ('maya', 6, '18:00', '22:00'),
    ('som', 0, '10:00', '20:00'),
    ('som', 1, '10:00', '20:00'),
    ('som', 2, '10:00', '20:00'),
    ('som', 3, '10:00', '20:00'),
    ('som', 4, '10:00', '20:00'),
    ('som', 5, '10:00', '20:00'),
    ('som', 6, '10:00', '20:00')
) as d(slug, dow, start_time, end_time)
where t.slug = d.slug;

-- Example unavailability: Lina away tomorrow 19:00–20:00 Bangkok (adjust date when testing)
-- Uncomment and set date for manual QA:
-- insert into public.therapist_unavailability (therapist_id, start_at, end_at, reason)
-- select id,
--   (current_date + 1)::text || ' 19:00:00+07'::timestamptz,
--   (current_date + 1)::text || ' 20:00:00+07'::timestamptz,
--   'Personal appointment'
-- from public.therapists where slug = 'lina';
