# CMS: Services + Media Library

## Run in Supabase (required for admin CRUD)
1. `supabase/migrations/20260808_cms_services_media.sql`
2. `supabase/migrations/20260808_cms_seed_prices.sql`

## Admin
- `/admin/services` — list / add / edit / hide services with **60 / 90 / 120** prices
- `/admin/media` — upload or paste URL, attach to services, publish

## Public
- Home, Services, Pricing, Book, and city pages load **active** services + prices from Supabase
- Hidden services (`is_active = false`) stay off the public site
- Booking Checkout charges the selected duration tier from `service_prices`
- Static TypeScript catalog is only a fallback if the DB is empty

## Notes
- Soft-delete / hide services — do not hard-delete rows with booking history
- Run the CMS SQL migrations before relying on admin edits live
