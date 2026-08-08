# Booking setup (Phase 1)

## 1. Run SQL in Supabase
1. Open Supabase → **SQL Editor**
2. Paste and run `supabase/migrations/20260804_phase1_booking.sql` (skip if schema already exists)
3. Paste and run `supabase/seed/phase1_catalog.sql`
4. Paste and run `supabase/migrations/20260805_availability.sql` (slot counts for the book form)

## 2. Confirm env vars
Vercel and local `.env.local` need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `BOOKING_SLOT_CAPACITY` (optional, default `3`)

## 3. Test
1. Open `/book` — time grid should load with “X left” / “Full”
2. Submit a booking
3. Confirm the WhatsApp message opens with the booking reference
4. Check Supabase → **Table Editor** → `bookings`
5. Re-open `/book` for the same date and confirm the booked slot’s remaining count dropped

## Notes
- Same date/time bookings are allowed up to `BOOKING_SLOT_CAPACITY` (default 3)
- The booking form loads live availability from `/api/availability`
- Full slots are blocked in the UI and again in `POST /api/bookings`
- Stripe Checkout charges the catalog `amountThb` via dynamic `price_data` (no Stripe Price IDs)
- Customers look up bookings with email + PIN at `/my-booking`
- After admin marks a booking **completed**, the guest email includes a **Leave a review** CTA
- Run `supabase/migrations/20260808_lookup_include_completed.sql` so completed bookings appear in My booking for reviews
