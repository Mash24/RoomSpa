# Admin dashboard setup

## 1. Run the migration

In Supabase → **SQL Editor**, run:

`supabase/migrations/20260805_admin_dashboard.sql`

This adds admin RLS policies, profile bootstrap on signup, and dashboard stats RPC.

## 2. Create your admin user

1. Supabase → **Authentication** → **Users** → **Add user**
2. Enter your email and a strong password
3. Copy the new user's **UUID**

## 3. Grant admin role

In SQL Editor (replace `YOUR-USER-UUID`):

```sql
insert into public.profiles (id, role, full_name)
values ('YOUR-USER-UUID', 'admin', 'Admin')
on conflict (id) do update set role = 'admin';
```

If the user was created before the profile trigger existed, this insert is required. If a profile already exists, the `on conflict` clause upgrades the role.

## 4. Sign in

1. Open `/admin/login` on your site (or `http://localhost:3000/admin/login` locally)
2. Sign in with the admin email and password
3. You should land on `/admin` with today's stats and the bookings list

## What you can do

- **Today** — appointments scheduled for today
- **Upcoming** — pending and confirmed future bookings
- **All** — last 100 bookings (any status)
- **Confirm / Cancel** — for pending bookings
- **Mark completed / Cancel / No show** — for confirmed bookings
- **Stats** — today's count, upcoming, bookings this week, paid revenue this week

## Security notes

- `/admin` routes require a signed-in user with `profiles.role = 'admin'`
- Non-admin users are signed out and redirected to login
- Admin pages are excluded from search indexing (`robots: noindex`)
- Customer booking PINs are not shown in the admin dashboard

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "This account does not have admin access" | Run the SQL in step 3 with the correct user UUID |
| Empty bookings list | Confirm the admin migration ran and you're signed in as admin |
| "Forbidden" on stats | Re-run `20260805_admin_dashboard.sql` |
