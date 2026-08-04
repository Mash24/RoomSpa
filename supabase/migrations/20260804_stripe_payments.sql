-- Optional payment columns for Stripe Checkout
-- Run in Supabase SQL Editor

alter table public.bookings
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded', 'failed')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

create index if not exists bookings_payment_status_idx
  on public.bookings (payment_status);

create index if not exists bookings_stripe_session_idx
  on public.bookings (stripe_checkout_session_id);
