-- Gallery visibility vs accepting bookings (customer-facing controls)

alter table public.therapists
  add column if not exists show_on_gallery boolean not null default false;

update public.therapists
set show_on_gallery = true
where status in ('active', 'fully_booked');

update public.therapists
set status = 'active',
    accepting_bookings = false
where status = 'fully_booked';
