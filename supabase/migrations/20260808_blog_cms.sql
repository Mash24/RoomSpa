-- Blog CMS: educational posts with categories
-- Run in Supabase SQL Editor after prior migrations

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null
    check (category in (
      'booking-hotels',
      'treatments',
      'wellness-travel',
      'areas',
      'sensual-consent'
    )),
  body text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'hidden')),
  published_at date not null default (current_date),
  primary_cta_label text,
  primary_cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_category_idx
  on public.blog_posts (category);

alter table public.blog_posts enable row level security;

drop policy if exists "Public read published blog posts" on public.blog_posts;
create policy "Public read published blog posts"
on public.blog_posts for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts"
on public.blog_posts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed educational guides (skip if slug already exists)
insert into public.blog_posts (
  slug, title, description, category, body, status, published_at,
  primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order
)
values
(
  'massage-therapist-to-hotel-chiang-mai',
  'Can a massage therapist come to my hotel in Chiang Mai?',
  'Yes — outcall / in-room massage brings a therapist to your Chiang Mai hotel, condo, or Airbnb. How it works, what to tell the front desk, and how to book RoomSpa.',
  'booking-hotels',
  $body$Yes. In Chiang Mai you can book an outcall (also called in-room or mobile) massage: a professional therapist travels to your hotel room, condo, villa, or Airbnb with oils, towels, and sheets as needed.

RoomSpa is built for this model. You choose a service, pick a time, enter your hotel or residence details, and we confirm. You get a booking reference and a 4-digit PIN by email so you can manage or pay later.

Before arrival, clear a bed or floor space and keep the room reasonably quiet. For oil or gel sessions we bring waterproof covers. You do not need spa equipment.

Some hotels ask outside visitors to check in at reception. Tell us the hotel name in your booking; therapists use professional language with staff and keep your session details private.

If your property blocks outside therapists, message us on WhatsApp before you book — we can advise or suggest timing that works with your stay.$body$,
  'published', '2026-08-08',
  'Book in-room massage', '/book', 'Chiang Mai coverage', '/city/chiang-mai', 10
),
(
  'is-hotel-massage-more-expensive-chiang-mai',
  'Is hotel massage more expensive in Chiang Mai?',
  'How in-room hotel massage pricing compares to spa walk-ins in Chiang Mai — what you pay for, travel fees, and transparent RoomSpa rates in THB.',
  'booking-hotels',
  $body$In-room massage in Chiang Mai is often similar to a mid-range spa visit, sometimes a little higher — and for good reason. You are paying for a therapist who travels to you, brings equipment, and works around your schedule so you skip tuk-tuks and waiting rooms.

Hotel spa menus can look cheaper on paper until you add travel time, waitlists, and tip expectations. Outcall rates usually include the convenience of setup in your room.

RoomSpa publishes clear prices on the site. Core coverage in Old City and Nimman typically has no travel fee; the Airport / Hang Dong corridor may add a small travel fee depending on distance.

You can pay cash on arrival, card later from My booking, or card now at checkout. No surprise add-ons for standard sessions — extras are only what you choose.

Compare the full menu on Pricing, then book the service that matches your pressure and duration needs.$body$,
  'published', '2026-08-08',
  'See pricing', '/pricing', 'Book a session', '/book', 20
),
(
  'how-outcall-massage-works-chiang-mai',
  'How does outcall massage work in Chiang Mai?',
  'Step-by-step: booking outcall / mobile massage in Chiang Mai — choosing a service, sharing your hotel details, arrival, payment, and PIN access.',
  'booking-hotels',
  $body$Outcall massage means the spa comes to you. In Chiang Mai the usual flow is: pick a treatment, share where you are staying, confirm a time, and welcome a therapist who arrives ready to work.

With RoomSpa: (1) choose a service online, (2) select date and time slot, (3) enter hotel/condo/home details and contact info, (4) choose cash, card later, or card now, (5) receive email confirmation with reference + PIN.

Before the session we confirm availability. On the day, the therapist arrives within the agreed window, sets up discreetly, and begins after a short check-in on pressure and any health notes you shared.

Afterward you can manage the booking with email + PIN, pay any remaining balance by card, and — once the visit is marked complete — leave a moderated review.

Same-day slots are often available when capacity allows. Evening times (roughly 5–9 pm) fill first, so book ahead when you can.$body$,
  'published', '2026-08-08',
  'Start booking', '/book', 'Read FAQ', '/faq', 30
),
(
  'massage-after-midnight-chiang-mai',
  'Can I book a massage after midnight in Chiang Mai?',
  'Late-night and after-midnight massage options in Chiang Mai — what RoomSpa covers, how same-day late slots work, and when to WhatsApp for last-minute requests.',
  'booking-hotels',
  $body$Many travelers land late or want a session after dinner and nightlife. Some Chiang Mai outcall providers advertise until 1:00 am; availability always depends on therapists on shift.

RoomSpa aims for flexible hours, including late evening when capacity allows. Online slots show what is bookable right now. If you need a time after the last listed slot — including after midnight — WhatsApp us with your hotel and preferred window.

Late requests work best with 1–2 hours notice when possible. Flight delays happen: message your reference or new request as soon as you know your ETA.

Hotels may have quiet-hour rules. Keep volume low and use the do-not-disturb sign when appropriate so staff and neighbors stay comfortable.

For the smoothest late arrival, book a confirmed evening slot earlier in the day, or message WhatsApp before you leave the airport.$body$,
  'published', '2026-08-08',
  'Check available times', '/book', 'Contact / WhatsApp', '/contact', 40
),
(
  'hotel-policy-outside-massage-therapist-chiang-mai',
  'Does my Chiang Mai hotel allow outside massage therapists?',
  'How hotel policies affect outcall massage in Chiang Mai — what to ask the front desk, how RoomSpa handles discreet arrival, and what to do if outside therapists are restricted.',
  'booking-hotels',
  $body$Policies vary. Many Chiang Mai hotels and boutique properties allow professional outcall therapists, especially when guests book in advance. Some luxury brands or hostels restrict outside visitors for security.

Ask the front desk: “Do you allow an outside massage therapist for an in-room appointment?” If they say yes, note any visitor registration or deposit rules and put them in your booking notes.

RoomSpa therapists arrive as professional wellness visitors — calm, discreet, and clear with staff. We never share intimate session details at the desk.

If the hotel says no, options include: book a condo/Airbnb stay that allows visitors, choose a nearby private spa room, or ask us on WhatsApp whether another coverage option fits your dates.

When in doubt, check policy before you pay. We would rather help you adjust than send a therapist who cannot enter.$body$,
  'published', '2026-08-08',
  'Book with hotel notes', '/book', 'WhatsApp us first', '/contact', 50
),
(
  'best-areas-chiang-mai-hotel-massage',
  'Best areas in Chiang Mai for hotel massage',
  'Old City, Nimman, and Airport / Hang Dong — where in-room hotel massage works best in Chiang Mai and how RoomSpa coverage maps to each area.',
  'areas',
  $body$The best area for hotel massage is wherever you are already staying — that is the point of outcall. Still, demand clusters in a few Chiang Mai neighborhoods.

Old City / Center: guesthouses and heritage hotels inside and around the moat. Ideal after temple days and night markets. RoomSpa covers this as a core zone.

Nimman / University area: boutiques, condos, and digital-nomad stays near Nimmanhaemin and Maya. Fast to reach for therapists; popular for evening couples and recovery sessions.

Airport / Hang Dong corridor: convenient after landing or for residences south of the center. A light travel fee may apply depending on distance — shown when you book.

Bangkok and Phuket are coming soon; Chiang Mai is available today. Open the Chiang Mai page for neighborhoods, then book with your hotel name.$body$,
  'published', '2026-08-08',
  'Explore Chiang Mai', '/city/chiang-mai', 'Book now', '/book', 60
),
(
  'hotel-massage-chiang-mai-how-it-works',
  'Hotel massage in Chiang Mai: how in-room booking works',
  'How RoomSpa brings a therapist to your Chiang Mai hotel room — what to prepare, pricing basics, and how to book with a PIN.',
  'booking-hotels',
  $body$Looking for a massage without leaving your hotel in Chiang Mai? In-room (mobile) massage means a professional therapist travels to you — Old City guesthouses, Nimman boutiques, and airport-corridor hotels included.

You choose a service online, pick a time, and share your hotel name or room details. We confirm availability and you receive a booking reference plus a 4-digit PIN by email.

Prepare a clear bed or floor space and a quiet room. We bring oils, towels, and sheets as needed. For oil or Nuru sessions we use waterproof covers. You do not need spa equipment.

Pay cash on arrival, card later from My booking, or card now at checkout. Discretion is standard: therapists use professional language with hotel staff and never share your booking details.

Ready to book? Open the booking form, choose your service, and select Chiang Mai coverage that matches your hotel area.$body$,
  'published', '2026-08-07',
  'Book a session', '/book', 'Browse services', '/services', 70
),
(
  'best-couples-massage-chiang-mai-in-room',
  'Best couples massage in Chiang Mai — in your room',
  'Side-by-side or dual-therapist couples massage at your Chiang Mai hotel or condo. How RoomSpa sessions work and what to expect.',
  'treatments',
  $body$Couples massage in Chiang Mai does not have to mean a crowded spa lobby. RoomSpa offers couples and four-hands sessions in your hotel, condo, or home — private, timed around your evening plans.

Classic couples massage focuses on relaxation side by side. Four-hands sessions use two therapists on one guest when you want deeper unwind. We also offer a consent-led couples sensual format when both partners want a more intimate, professional session — boundaries are set before touch begins.

Space tip: a king bed or clear floor area works best. Tell us the room type in notes so we bring the right setup.

Book Couples or Couples Sensual from Services, or message WhatsApp if you want help choosing a duration.$body$,
  'published', '2026-08-07',
  'Book couples massage', '/book?service=couples', 'View couples services', '/services', 80
),
(
  'thai-massage-vs-oil-massage',
  'Thai massage vs oil massage: which should you book?',
  'A clear comparison of Thai (dry, stretch-focused) and oil-based massage — and when to choose deep tissue or Swedish instead.',
  'treatments',
  $body$Thai massage is typically performed clothed, on a mat, with rhythmic compressions and assisted stretches. It is excellent for mobility, travel stiffness, and guests who prefer less oil.

Oil massage (Swedish, aromatherapy, hot oil, Balinese) uses lotion or oil with longer gliding strokes. Choose these when you want classic spa relaxation, softer pressure, or scent-led unwind.

Deep tissue and sports sit between therapeutic goals and pressure — better when you have a specific tight area after hiking Doi Suthep or sitting through long flights.

Not sure? Start with Swedish for general recovery or Thai if you want stretch-focused work. You can note pressure preferences when you book.$body$,
  'published', '2026-08-07',
  'Compare on Services', '/services', 'Book now', '/book', 90
),
(
  'deep-tissue-massage-after-hiking-chiang-mai',
  'Deep tissue massage after hiking in Chiang Mai',
  'Recover from Doi Suthep, Doi Inthanon, or city walking tours with in-room deep tissue or sports massage in Chiang Mai.',
  'treatments',
  $body$Chiang Mai hikes and temple climbs leave calves, hips, and shoulders tight. An in-room deep tissue or sports session lets you recover without another tuk-tuk ride across town.

Tell your therapist which trails or activities you did and where you feel sore. We adjust pressure and avoid inflamed areas.

Hydrate after the session and keep the evening light. Pair with foot reflexology if your feet took the worst of the climb.

Book Deep Tissue or Sports from the therapeutic menu — available in Old City, Nimman, and Airport / Hang Dong coverage.$body$,
  'published', '2026-08-07',
  'Book deep tissue', '/book?service=deep-tissue', 'Therapeutic menu', '/services', 100
),
(
  'nuru-massage-chiang-mai-what-to-expect',
  'Nuru massage in Chiang Mai: what to expect',
  'A clear, professional overview of consent-led Nuru bodywork with RoomSpa — boundaries, hygiene, and how to book discreetly.',
  'sensual-consent',
  $body$Nuru is a gel-based body-to-body massage offered as consent-led professional bodywork — not an escort service. RoomSpa sessions begin with clear boundaries; you can pause or stop anytime.

We bring waterproof sheets and towels. A shower nearby is helpful. Privacy and discretion are standard for hotel arrivals.

If you are new to sensual or tantric work, read the service description and FAQ first, then book Nuru or related sessions from the sensual menu. Questions before booking are welcome on WhatsApp.$body$,
  'published', '2026-08-07',
  'View Nuru', '/services/nuru', 'Read FAQ', '/faq', 110
),
(
  'how-often-should-you-get-a-massage',
  'How often should you get a massage when traveling?',
  'Practical guidance on massage frequency for tourists and digital nomads in Thailand — recovery, budget, and booking tips.',
  'wellness-travel',
  $body$There is no single rule. Many travelers feel best with a session after a long flight, then again mid-trip if they are hiking or sitting for work.

Digital nomads in Chiang Mai often book weekly Swedish or Thai to manage desk tension. Athletes lean toward sports or deep tissue after hard training days.

Listen to your body: soreness that improves with movement is different from sharp pain — mention injuries when you book so we can adapt or decline unsafe work.

RoomSpa makes repeat visits easy: save your email + PIN from My booking, or rebook from the site in a few taps.$body$,
  'published', '2026-08-07',
  'Book a session', '/book', 'Manage booking', '/my-booking', 120
)
on conflict (slug) do nothing;
