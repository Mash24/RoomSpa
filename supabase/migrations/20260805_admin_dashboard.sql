-- Admin dashboard: role checks, RLS, profile bootstrap
-- Run in Supabase SQL Editor after booking migrations

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Auto-create profile when a Supabase Auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Admin booking access
drop policy if exists "Admins read all bookings" on public.bookings;
create policy "Admins read all bookings"
on public.bookings for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins update bookings" on public.bookings;
create policy "Admins update bookings"
on public.bookings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admins can read profiles (for future customer management)
drop policy if exists "Admins read profiles" on public.profiles;
create policy "Admins read profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

-- Dashboard stats (bookings this week, revenue, counts)
create or replace function public.get_admin_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  week_start date := date_trunc('week', current_date)::date;
  week_end date := week_start + interval '6 days';
  result json;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select json_build_object(
    'bookingsThisWeek', (
      select count(*)::int
      from public.bookings b
      where b.scheduled_date between week_start and week_end
        and b.status not in ('cancelled', 'no_show')
    ),
    'revenueThisWeekThb', (
      select coalesce(sum(b.amount_thb), 0)::int
      from public.bookings b
      where b.scheduled_date between week_start and week_end
        and b.payment_status = 'paid'
    ),
    'pendingCount', (
      select count(*)::int
      from public.bookings b
      where b.status = 'pending'
    ),
    'todayCount', (
      select count(*)::int
      from public.bookings b
      where b.scheduled_date = current_date
        and b.status not in ('cancelled', 'no_show')
    ),
    'upcomingCount', (
      select count(*)::int
      from public.bookings b
      where b.scheduled_date >= current_date
        and b.status in ('pending', 'confirmed')
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_admin_dashboard_stats() from public;
grant execute on function public.get_admin_dashboard_stats() to authenticated;
