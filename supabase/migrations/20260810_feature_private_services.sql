-- Feature private / sensual services for homepage + booking prominence.
-- Wellness services stay bookable; they are no longer the default featured set.

update public.services
set featured = false
where slug in ('swedish', 'couples');

update public.services
set featured = true
where slug in (
  'nuru',
  'tantric',
  'body-to-body',
  'yoni',
  'lingam',
  'couples-sensual'
);

-- Prefer private experiences earlier in catalog sort (admin can still override).
update public.services
set sort_order = case slug
  when 'tantric' then 10
  when 'nuru' then 20
  when 'body-to-body' then 30
  when 'yoni' then 40
  when 'lingam' then 50
  when 'couples-sensual' then 60
  when 'couples' then 70
  when 'four-hands' then 80
  when 'swedish' then 100
  when 'thai' then 110
  when 'deep-tissue' then 120
  else coalesce(sort_order, 200)
end
where slug in (
  'tantric',
  'nuru',
  'body-to-body',
  'yoni',
  'lingam',
  'couples-sensual',
  'couples',
  'four-hands',
  'swedish',
  'thai',
  'deep-tissue'
);
