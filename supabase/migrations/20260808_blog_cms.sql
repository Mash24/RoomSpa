-- Blog CMS: educational articles with categories (not FAQ Q&A)
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

-- Remove older Q&A-style seed slugs if they were inserted previously
delete from public.blog_posts
where slug in (
  'massage-therapist-to-hotel-chiang-mai',
  'is-hotel-massage-more-expensive-chiang-mai',
  'massage-after-midnight-chiang-mai',
  'hotel-policy-outside-massage-therapist-chiang-mai'
);

insert into public.blog_posts (
  slug, title, description, category, body, status, published_at,
  primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order, updated_at
)
values
(
  'in-room-massage-chiang-mai-guide',
  'In-room massage in Chiang Mai: a practical guide',
  'How mobile massage works in Chiang Mai hotels, condos, and Airbnbs — what to prepare, how arrival usually goes, and why travelers choose outcall care.',
  'booking-hotels',
  $body$In-room massage — sometimes called outcall or mobile massage — brings a professional therapist to wherever you are staying. In Chiang Mai that usually means a hotel room in the Old City, a Nimman condo, a villa, or a short-term Airbnb.

The appeal is simple. After a long flight or a day of temples and traffic, you do not need another tuk-tuk ride to a spa lobby. The therapist arrives with oils, towels, and sheets as needed, sets up in your space, and works around your schedule.

A workable room only needs a clear bed or floor area and a reasonably quiet atmosphere. For oil or gel-based sessions, waterproof covers are part of the kit. Guests do not need spa furniture or special equipment.

Many properties ask visitors to check in at reception. Therapists present as professional wellness visitors, keep language discreet with staff, and never share private session details at the desk.

RoomSpa is built around this model: choose a service and time online, share your hotel or residence details, confirm, and receive a booking reference plus PIN by email so you can manage the visit later.$body$,
  'published', '2026-08-08',
  'Book in-room massage', '/book', 'Chiang Mai coverage', '/city/chiang-mai', 10, now()
),
(
  'understanding-hotel-massage-pricing-chiang-mai',
  'Understanding hotel massage pricing in Chiang Mai',
  'What goes into in-room massage rates compared with walk-in spas — travel, setup, transparency, and how RoomSpa publishes THB prices.',
  'booking-hotels',
  $body$Travelers often compare an in-room session with a walk-in spa menu and wonder why the numbers look different. Outcall pricing reflects more than the minutes of bodywork: travel across town, carrying equipment, setting up in a guest room, and working within hotel quiet hours.

A hotel spa can look cheaper on paper until you add transit time, waitlists, and tip expectations. Mobile rates package convenience — the therapist comes to you, so recovery starts where you already are.

RoomSpa publishes clear THB prices on the site. Core coverage in Old City and Nimman typically has no travel fee. The Airport / Hang Dong corridor may include a light travel fee depending on distance, shown when you book.

Payment options are straightforward: card at checkout, card later from My booking, or cash on arrival. Standard sessions do not hide surprise add-ons; extras only appear when you choose them.

Use the Pricing page to compare durations, then match the treatment to the pressure and recovery you want rather than shopping only by the lowest line item.$body$,
  'published', '2026-08-08',
  'See pricing', '/pricing', 'Book a session', '/book', 20, now()
),
(
  'how-outcall-massage-works-chiang-mai',
  'How outcall massage works from booking to arrival',
  'A step-by-step look at mobile massage in Chiang Mai: choosing a treatment, sharing your stay details, confirmation, and what happens on the day.',
  'booking-hotels',
  $body$Outcall massage means the spa comes to you. In Chiang Mai the flow is familiar once you have done it once: pick a treatment, share where you are staying, lock a time, and welcome a therapist who arrives ready to work.

With RoomSpa the steps are: choose a service, select a date and slot, enter hotel, condo, or home details with contact info, pick cash, card later, or card now, then receive email confirmation with a reference and PIN.

Before the visit we confirm availability. On the day, arrival sits inside the agreed window. Setup is discreet. A short check-in covers pressure preferences and any health notes you shared when booking.

Afterward you can manage the booking with email and PIN, settle any remaining balance by card, and — once the visit is marked complete — leave a moderated review.

Same-day slots appear when capacity allows. Early evening hours fill first, so booking ahead still helps during peak travel weeks.$body$,
  'published', '2026-08-08',
  'Start booking', '/book', 'Read FAQ', '/faq', 30, now()
),
(
  'evening-and-late-outcall-massage-chiang-mai',
  'Evening and late outcall massage in Chiang Mai',
  'How late-evening mobile massage fits traveler schedules — landing flights, dinner plans, quiet hotel hours, and planning a smooth arrival window.',
  'booking-hotels',
  $body$Many guests want bodywork after dinner, nightlife, or a delayed flight. Chiang Mai’s mobile massage culture often stretches into late evening when therapists are on shift — always subject to real capacity that day.

Online slots show what is bookable in the moment. When you need a window after the last listed time, WhatsApp with your hotel and preferred range is the practical path; last-minute requests work best with at least an hour or two of notice when possible.

Hotels may enforce quiet hours. Low volume, a do-not-disturb sign, and a clear floor or bed space keep the visit comfortable for you and your neighbors.

Flight delays are common. Updating your ETA early — with your booking reference if you already have one — helps the therapist adjust without wasting travel time.

For the smoothest night arrival, reserve a confirmed evening slot earlier in the day, or message before you leave the airport so timing stays realistic.$body$,
  'published', '2026-08-08',
  'Check available times', '/book', 'Contact / WhatsApp', '/contact', 40, now()
),
(
  'hotel-policies-and-visiting-therapists',
  'Hotel policies and visiting massage therapists',
  'How property rules shape in-room massage in Chiang Mai — visitor registration, discretion at reception, and planning around restricted hotels.',
  'booking-hotels',
  $body$Not every property treats outside wellness visitors the same way. Many Chiang Mai hotels and boutiques allow professional therapists when guests book in advance. Some luxury brands or hostels restrict outside guests for security.

A useful front-desk question is whether an outside massage therapist is allowed for an in-room appointment, and whether visitor registration or a deposit applies. Those details belong in your booking notes.

RoomSpa therapists arrive as calm wellness visitors. They keep language professional with staff and never discuss intimate session details at reception.

When a hotel says no, alternatives include staying somewhere that allows visitors, choosing a nearby private space, or adjusting timing after a quick WhatsApp check on coverage options for your dates.

Confirming policy before you pay protects everyone. It is better to adjust early than to send a therapist who cannot enter the building.$body$,
  'published', '2026-08-08',
  'Book with hotel notes', '/book', 'WhatsApp us first', '/contact', 50, now()
),
(
  'best-areas-chiang-mai-hotel-massage',
  'Best areas in Chiang Mai for hotel massage',
  'Old City, Nimman, and the Airport / Hang Dong corridor — how demand, travel time, and RoomSpa coverage map across Chiang Mai neighborhoods.',
  'areas',
  $body$The best place for hotel massage is wherever you already sleep — that is the point of outcall. Still, demand clusters in a few Chiang Mai neighborhoods where travelers and therapists meet most easily.

Old City and the center: guesthouses and heritage hotels inside and around the moat. Ideal after temple days and night markets, and covered as a RoomSpa core zone.

Nimman and the university area: boutiques, condos, and digital-nomad stays near Nimmanhaemin and Maya. Short therapist travel times and strong evening demand for couples and recovery sessions.

Airport and Hang Dong corridor: convenient after landing or for residences south of the center. A light travel fee may apply depending on distance and is shown at booking.

Bangkok and Phuket are on the roadmap; Chiang Mai is live today. Start with the Chiang Mai city page for neighborhoods, then book with your hotel name so routing stays accurate.$body$,
  'published', '2026-08-08',
  'Explore Chiang Mai', '/city/chiang-mai', 'Book now', '/book', 60, now()
),
(
  'hotel-massage-chiang-mai-how-it-works',
  'Hotel massage without leaving your room',
  'What a Chiang Mai in-room session looks like from preparation to payment — space, discretion, and how RoomSpa bookings stay simple.',
  'booking-hotels',
  $body$Hotel massage in Chiang Mai does not have to mean finding a spa across town. Mobile therapists travel to Old City guesthouses, Nimman boutiques, and airport-corridor hotels with what they need for a full session.

Online booking captures the service, time, and stay details. Confirmation arrives with a reference and PIN so you can manage or pay later without chasing messages.

Prepare a clear bed or floor space and a quiet room. Oils, towels, and sheets come with the visit. Waterproof covers are used for oil or Nuru work. Guests do not need spa equipment.

Payment can be cash on arrival, card later from My booking, or card at checkout. Discretion is standard: professional language with hotel staff and private booking details.

When you are ready, open the booking form, choose your treatment, and match coverage to the area of your hotel.$body$,
  'published', '2026-08-07',
  'Book a session', '/book', 'Browse services', '/services', 70, now()
),
(
  'best-couples-massage-chiang-mai-in-room',
  'Couples massage in your Chiang Mai hotel room',
  'Side-by-side and dual-therapist couples sessions at the hotel or condo — space tips, formats, and how private evenings usually unfold.',
  'treatments',
  $body$Couples massage in Chiang Mai does not require a shared spa lobby. In-room sessions keep the evening private — timed around dinner plans, flights, or a quiet night in.

Classic couples work focuses on relaxation side by side. Four-hands sessions use two therapists on one guest for deeper unwind. Consent-led couples sensual formats exist for partners who want a more intimate, professional session with boundaries set before touch begins.

Space matters. A king bed or clear floor area works best. Mentioning room type in notes helps the team bring the right setup.

Couples and Couples Sensual sit on the Services menu. WhatsApp helps when you want a second opinion on duration or format before you lock a time.$body$,
  'published', '2026-08-07',
  'Book couples massage', '/book?service=couples', 'View couples services', '/services', 80, now()
),
(
  'thai-massage-vs-oil-massage',
  'Thai massage vs oil massage: choosing your treatment',
  'A clear comparison of Thai stretch-focused work and oil-based relaxation — plus when deep tissue or Swedish is the better fit.',
  'treatments',
  $body$Thai massage is typically performed clothed, on a mat, with rhythmic compressions and assisted stretches. It suits guests who want mobility, travel stiffness relief, or less oil on the skin.

Oil massage — Swedish, aromatherapy, hot oil, Balinese — uses longer gliding strokes with lotion or oil. Choose it for classic spa relaxation, softer pressure, or scent-led unwind.

Deep tissue and sports sit closer to therapeutic goals: useful after hiking Doi Suthep, long walks, or desk-heavy nomad weeks when a specific area feels locked.

If you are unsure, Swedish is a strong general recovery start; Thai is the stretch-focused path. Note pressure preferences when you book so the session matches what your body needs that day.$body$,
  'published', '2026-08-07',
  'Compare on Services', '/services', 'Book now', '/book', 90, now()
),
(
  'deep-tissue-massage-after-hiking-chiang-mai',
  'Deep tissue after hiking in Chiang Mai',
  'Recovering from Doi Suthep, Doi Inthanon, or temple climbs with in-room deep tissue and sports massage — what to tell your therapist and how to plan the evening after.',
  'treatments',
  $body$Chiang Mai hikes and temple climbs leave calves, hips, and shoulders tight. An in-room deep tissue or sports session lets you recover without another cross-town ride after you already walked for hours.

Share which trails or activities you did and where soreness sits. Therapists adjust pressure and avoid inflamed areas so the work stays productive rather than aggressive.

Hydrate after the session and keep the evening light. Foot reflexology pairs well when feet took the worst of the climb.

Deep Tissue and Sports sit on the therapeutic menu and are available across Old City, Nimman, and Airport / Hang Dong coverage.$body$,
  'published', '2026-08-07',
  'Book deep tissue', '/book?service=deep-tissue', 'Therapeutic menu', '/services', 100, now()
),
(
  'nuru-massage-chiang-mai-what-to-expect',
  'Nuru bodywork in Chiang Mai: a professional overview',
  'What consent-led Nuru sessions involve — boundaries, hygiene, discretion at hotels, and how RoomSpa frames sensual bodywork as professional care.',
  'sensual-consent',
  $body$Nuru is a gel-based body-to-body massage offered as consent-led professional bodywork — not an escort service. Sessions begin with clear boundaries, and guests can pause or stop at any time.

Waterproof sheets and towels come with the visit. A nearby shower helps. Discretion is standard for hotel arrivals, including calm language with front-desk staff.

Guests new to sensual or tantric work usually read the service description first, then book Nuru or related sessions from the sensual menu. Pre-booking questions are welcome on WhatsApp.$body$,
  'published', '2026-08-07',
  'View Nuru', '/services/nuru', 'Read FAQ', '/faq', 110, now()
),
(
  'how-often-should-you-get-a-massage',
  'Massage rhythm for travelers and digital nomads',
  'Practical guidance on how often to book massage during a Thailand trip — flights, hiking weeks, desk work, and listening to your body.',
  'wellness-travel',
  $body$There is no single correct schedule. Many travelers feel best with a session after a long flight, then again mid-trip if they are hiking hard or sitting for work.

Digital nomads in Chiang Mai often book weekly Swedish or Thai to manage desk tension. Athletes lean toward sports or deep tissue after demanding training days.

Soreness that eases with gentle movement differs from sharp pain. Mention injuries when you book so the therapist can adapt or decline work that would be unsafe.

Repeat visits stay simple: keep your email and PIN from My booking, or rebook from the site in a few taps when your calendar opens up.$body$,
  'published', '2026-08-07',
  'Book a session', '/book', 'Manage booking', '/my-booking', 120, now()
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  body = excluded.body,
  status = excluded.status,
  published_at = excluded.published_at,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_href = excluded.primary_cta_href,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_href = excluded.secondary_cta_href,
  sort_order = excluded.sort_order,
  updated_at = now();
