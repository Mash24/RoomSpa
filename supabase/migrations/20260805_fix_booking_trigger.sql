-- DEPRECATED: Concurrent bookings are now allowed.
-- Prefer 20260805_allow_concurrent_bookings.sql (drops this trigger).
-- Kept only for historical reference.

-- Previously softened the double-booking guard so payment/PIN updates
-- did not re-check the slot. That guard is removed entirely now.
