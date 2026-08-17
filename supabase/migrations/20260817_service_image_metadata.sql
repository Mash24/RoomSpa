-- Service hero image metadata for admin CMS uploads
alter table public.services
  add column if not exists image_alt text,
  add column if not exists image_focus text default 'center center';

comment on column public.services.image_url is 'Admin-uploaded hero image (Supabase Storage). Overrides static service-media.ts when set.';
comment on column public.services.image_alt is 'Accessible alt text for the hero image.';
comment on column public.services.image_focus is 'CSS object-position when cover crop is used (legacy static images).';
