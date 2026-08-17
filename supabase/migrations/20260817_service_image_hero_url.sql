-- Hero crop (16:10) for service detail pages; card crop stays in image_url
alter table public.services
  add column if not exists image_hero_url text;

comment on column public.services.image_hero_url is 'Admin-uploaded detail hero (16:10 smart crop). Falls back to image_url.';
