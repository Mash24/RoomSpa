-- Local mirror of production: ticket messaging + ratings + guest RPCs
-- (Already applied remotely via MCP as ticket_messaging_and_ratings / ticket_guest_rpcs)

alter table public.support_tickets
  add column if not exists guest_token uuid not null default gen_random_uuid(),
  add column if not exists ended_at timestamptz,
  add column if not exists ended_by text,
  add column if not exists rating integer,
  add column if not exists rating_comment text not null default '',
  add column if not exists rating_share_ok boolean not null default false,
  add column if not exists review_id uuid;

do $$ begin
  alter table public.support_tickets
    add constraint support_tickets_rating_range check (rating is null or rating between 1 and 5);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.support_tickets
    add constraint support_tickets_ended_by_check check (
      ended_by is null or ended_by in ('guest', 'admin', 'system')
    );
exception when duplicate_object then null;
end $$;

create unique index if not exists support_tickets_guest_token_uidx
  on public.support_tickets (guest_token);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender text not null check (sender in ('guest', 'admin', 'bot')),
  body text not null,
  created_at timestamptz not null default now(),
  constraint support_ticket_messages_body_length check (char_length(body) between 1 and 4000)
);

create index if not exists support_ticket_messages_ticket_created_idx
  on public.support_ticket_messages (ticket_id, created_at asc);

alter table public.support_ticket_messages enable row level security;

drop policy if exists "Admins read ticket messages" on public.support_ticket_messages;
create policy "Admins read ticket messages"
on public.support_ticket_messages for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins insert ticket messages" on public.support_ticket_messages;
create policy "Admins insert ticket messages"
on public.support_ticket_messages for insert
to authenticated
with check (public.is_admin());

create or replace function public.ticket_guest_fetch(p_code text, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.support_tickets%rowtype;
  msgs jsonb;
begin
  select * into t
  from public.support_tickets
  where reference_code = upper(trim(p_code))
    and guest_token = p_token;

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'sender', m.sender,
    'body', m.body,
    'createdAt', m.created_at
  ) order by m.created_at asc), '[]'::jsonb)
  into msgs
  from public.support_ticket_messages m
  where m.ticket_id = t.id;

  return jsonb_build_object(
    'id', t.id,
    'referenceCode', t.reference_code,
    'status', t.status,
    'guestName', t.guest_name,
    'subject', t.subject,
    'message', t.message,
    'endedAt', t.ended_at,
    'endedBy', t.ended_by,
    'rating', t.rating,
    'messages', msgs
  );
end;
$$;

create or replace function public.ticket_guest_post_message(p_code text, p_token uuid, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.support_tickets%rowtype;
  mid uuid;
begin
  if char_length(trim(p_body)) < 1 or char_length(p_body) > 4000 then
    raise exception 'invalid_body';
  end if;

  select * into t
  from public.support_tickets
  where reference_code = upper(trim(p_code))
    and guest_token = p_token
  for update;

  if not found then
    return null;
  end if;

  if t.ended_at is not null or t.status in ('resolved', 'spam') then
    raise exception 'ticket_ended';
  end if;

  insert into public.support_ticket_messages (ticket_id, sender, body)
  values (t.id, 'guest', trim(p_body))
  returning id into mid;

  return jsonb_build_object('id', mid, 'ok', true);
end;
$$;

create or replace function public.ticket_guest_end(
  p_code text,
  p_token uuid,
  p_rating integer default null,
  p_comment text default '',
  p_share boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.support_tickets%rowtype;
begin
  if p_rating is not null and (p_rating < 1 or p_rating > 5) then
    raise exception 'invalid_rating';
  end if;

  select * into t
  from public.support_tickets
  where reference_code = upper(trim(p_code))
    and guest_token = p_token
  for update;

  if not found then
    return null;
  end if;

  update public.support_tickets
  set
    status = 'resolved',
    ended_at = coalesce(ended_at, now()),
    ended_by = coalesce(ended_by, 'guest'),
    rating = coalesce(p_rating, rating),
    rating_comment = case
      when p_comment is null then rating_comment
      else left(trim(p_comment), 1000)
    end,
    rating_share_ok = coalesce(p_share, rating_share_ok),
    updated_at = now()
  where id = t.id
  returning * into t;

  return jsonb_build_object(
    'ok', true,
    'referenceCode', t.reference_code,
    'rating', t.rating,
    'ratingShareOk', t.rating_share_ok
  );
end;
$$;

grant execute on function public.ticket_guest_fetch(text, uuid) to anon, authenticated;
grant execute on function public.ticket_guest_post_message(text, uuid, text) to anon, authenticated;
grant execute on function public.ticket_guest_end(text, uuid, integer, text, boolean) to anon, authenticated;
