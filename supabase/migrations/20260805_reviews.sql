-- Guest reviews with moderation
-- Run in Supabase SQL Editor

create type public.review_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_email text,
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  body text not null,
  service_slug text,
  booking_reference text,
  status public.review_status not null default 'pending',
  rejection_reason text not null default '',
  ip_hash text,
  moderated_at timestamptz,
  moderated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_body_length check (char_length(body) between 20 and 1000),
  constraint reviews_name_length check (char_length(author_name) between 2 and 80),
  constraint reviews_title_length check (char_length(title) <= 120)
);

create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);

create index if not exists reviews_rating_idx
  on public.reviews (rating);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

-- Visitors only see approved reviews
drop policy if exists "Public read approved reviews" on public.reviews;
create policy "Public read approved reviews"
on public.reviews for select
to anon, authenticated
using (status = 'approved');

-- Submissions go through the API (service role optional); allow anon insert of pending only
drop policy if exists "Anyone can submit pending reviews" on public.reviews;
create policy "Anyone can submit pending reviews"
on public.reviews for insert
to anon, authenticated
with check (status = 'pending');

-- Admins manage all reviews
drop policy if exists "Admins read all reviews" on public.reviews;
create policy "Admins read all reviews"
on public.reviews for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins update reviews" on public.reviews;
create policy "Admins update reviews"
on public.reviews for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete reviews" on public.reviews;
create policy "Admins delete reviews"
on public.reviews for delete
to authenticated
using (public.is_admin());
