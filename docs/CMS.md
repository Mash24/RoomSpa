# CMS: Services + Media Library

## Run in Supabase (required for admin CRUD)
1. `supabase/migrations/20260808_cms_services_media.sql`
2. `supabase/migrations/20260808_cms_seed_prices.sql`

## Admin
- `/admin/services` — list / add / edit / hide services with **60 / 90 / 120** prices
- `/admin/media` — upload or paste URL, attach to services, publish

## Public
- Pricing + service pages show three duration columns
- Booking form lets guests pick duration; Checkout charges that tier
- Service pages load published media linked in the Media Library (“See how it works”)

## Notes
- Until SQL is run, the site still works from the TypeScript catalog with derived tiers
- After SQL, DB `service_prices` wins at booking time when present
- Soft-delete services (archive/hide) — do not hard-delete rows with booking history
