-- Align Yoni pricing with the Nuru rate card across the Supabase CMS.

update public.services
set price_thb = 3999,
    duration_label = '60 / 90 / 120 min',
    updated_at = now()
where slug = 'yoni';

insert into public.service_prices (service_id, duration_minutes, price_thb, is_active)
select s.id, tier.duration_minutes, tier.price_thb, true
from public.services s
cross join (
  values
    (60, 3999),
    (90, 4999),
    (120, 5600)
) as tier(duration_minutes, price_thb)
where s.slug = 'yoni'
on conflict (service_id, duration_minutes) do update
set price_thb = excluded.price_thb,
    is_active = excluded.is_active;
