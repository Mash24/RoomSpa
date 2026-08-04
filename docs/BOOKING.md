# Booking setup (Phase 1)

## 1. Run SQL in Supabase
1. Open Supabase → **SQL Editor**
2. Paste and run `supabase/migrations/20260804_phase1_booking.sql`
3. Paste and run `supabase/seed/phase1_catalog.sql`

## 2. Confirm env vars
Vercel and local `.env.local` need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 3. Test
1. Open `/book`
2. Submit a booking
3. Confirm the WhatsApp message opens with the booking reference
4. Check Supabase → **Table Editor** → `bookings`

## Notes
- Payments stay off for now (confirm via WhatsApp)
- Double-booking of the same date/time is blocked at the database level
- Stripe Checkout can be added next using the stored `stripe_price_id` values
