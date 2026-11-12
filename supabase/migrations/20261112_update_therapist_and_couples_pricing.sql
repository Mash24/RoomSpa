-- Align public pricing with the current rate card.
-- Apply in Supabase SQL Editor or through the project's migration workflow.

update public.services
set price_thb = case slug
  when 'nuru' then 3200
  when 'body-to-body' then 3200
  when 'yoni' then 3200
  when 'lingam' then 3200
  when 'couples' then 7500
  else price_thb
end,
updated_at = now()
where slug in ('nuru', 'body-to-body', 'yoni', 'lingam', 'couples');

insert into public.service_prices (service_id, duration_minutes, price_thb, is_active)
select s.id, tier.duration_minutes, tier.price_thb, true
from public.services s
cross join (
  values
    ('couples', 60, 7500),
    ('couples', 90, 8000),
    ('couples', 120, 9000)
) as tier(slug, duration_minutes, price_thb)
where s.slug = tier.slug
on conflict (service_id, duration_minutes) do update
set price_thb = excluded.price_thb,
    is_active = excluded.is_active;

update public.service_prices sp
set price_thb = 3200
from public.services s
where sp.service_id = s.id
  and sp.duration_minutes = 60
  and s.category = 'sensual'
  and sp.price_thb < 3200;
