# CMS: Services + Media Library

## Run in Supabase (required for admin CRUD)
1. `supabase/migrations/20260808_cms_services_media.sql`
2. `supabase/migrations/20260808_cms_seed_prices.sql`

## Admin
- `/admin/services` — list / add / edit / hide services with **60 / 90 / 120** prices
- `/admin/media` — upload files **directly to Supabase Storage**, or paste a public URL (MP4, YouTube, Vimeo, X). Attach only relevant services.

## Public
- Home, Services, Pricing, Book, and city pages load **active** services + prices from Supabase
- Hidden services (`is_active = false`) stay off the public site
- `/gallery` lists published media, labeled by the services chosen in admin
- Matching service pages show linked published media under “Videos & photos”
- Booking Checkout charges the selected duration tier from `service_prices`
- Static TypeScript catalog is only a fallback if the DB is empty

## Media upload notes
- Do **not** send large MP4s through the Next.js API (Vercel ~4.5 MB body limit → `Request Entity Too Large`)
- Admin panel uploads with the browser Supabase client into bucket `media-library`
- External links are first-class: paste into Media URL and Save

## Notes
- Soft-delete / hide services — do not hard-delete rows with booking history
- Run the CMS SQL migrations before relying on admin edits live
