-- Support tickets from the public chat concierge (agent handoff).

do $$ begin
  create type public.support_ticket_status as enum (
    'open',
    'in_progress',
    'resolved',
    'spam'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  status public.support_ticket_status not null default 'open',
  guest_name text not null,
  guest_email text,
  guest_phone text,
  subject text not null default '',
  message text not null,
  page_path text,
  transcript jsonb not null default '[]'::jsonb,
  ip_hash text,
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_name_length check (char_length(guest_name) between 2 and 80),
  constraint support_tickets_message_length check (char_length(message) between 10 and 4000),
  constraint support_tickets_subject_length check (char_length(subject) <= 160)
);

create index if not exists support_tickets_status_created_idx
  on public.support_tickets (status, created_at desc);

drop trigger if exists support_tickets_set_updated_at on public.support_tickets;
create trigger support_tickets_set_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

alter table public.support_tickets enable row level security;

drop policy if exists "Anyone can open a support ticket" on public.support_tickets;
create policy "Anyone can open a support ticket"
on public.support_tickets for insert
to anon, authenticated
with check (status = 'open');

drop policy if exists "Admins read support tickets" on public.support_tickets;
create policy "Admins read support tickets"
on public.support_tickets for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins update support tickets" on public.support_tickets;
create policy "Admins update support tickets"
on public.support_tickets for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
