export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  tags: string[];
  /** Simple paragraphs for Phase 1 — CMS later */
  body: string[];
  /** Primary conversion link at the end of the article */
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

/**
 * Commercial-intent guides first (hotel / outcall questions), then supporting content.
 * Goal: answer the query, then route to book / city / WhatsApp — not keyword stuffing.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "massage-therapist-to-hotel-chiang-mai",
    title: "Can a massage therapist come to my hotel in Chiang Mai?",
    description:
      "Yes — outcall / in-room massage brings a therapist to your Chiang Mai hotel, condo, or Airbnb. How it works, what to tell the front desk, and how to book RoomSpa.",
    datePublished: "2026-08-08",
    tags: ["hotel massage", "outcall", "Chiang Mai"],
    body: [
      "Yes. In Chiang Mai you can book an outcall (also called in-room or mobile) massage: a professional therapist travels to your hotel room, condo, villa, or Airbnb with oils, towels, and sheets as needed.",
      "RoomSpa is built for this model. You choose a service, pick a time, enter your hotel or residence details, and we confirm. You get a booking reference and a 4-digit PIN by email so you can manage or pay later.",
      "Before arrival, clear a bed or floor space and keep the room reasonably quiet. For oil or gel sessions we bring waterproof covers. You do not need spa equipment.",
      "Some hotels ask outside visitors to check in at reception. Tell us the hotel name in your booking; therapists use professional language with staff and keep your session details private.",
      "If your property blocks outside therapists, message us on WhatsApp before you book — we can advise or suggest timing that works with your stay.",
    ],
    primaryCta: { label: "Book in-room massage", href: "/book" },
    secondaryCta: { label: "Chiang Mai coverage", href: "/city/chiang-mai" },
  },
  {
    slug: "is-hotel-massage-more-expensive-chiang-mai",
    title: "Is hotel massage more expensive in Chiang Mai?",
    description:
      "How in-room hotel massage pricing compares to spa walk-ins in Chiang Mai — what you pay for, travel fees, and transparent RoomSpa rates in THB.",
    datePublished: "2026-08-08",
    tags: ["pricing", "hotel massage", "Chiang Mai"],
    body: [
      "In-room massage in Chiang Mai is often similar to a mid-range spa visit, sometimes a little higher — and for good reason. You are paying for a therapist who travels to you, brings equipment, and works around your schedule so you skip tuk-tuks and waiting rooms.",
      "Hotel spa menus can look cheaper on paper until you add travel time, waitlists, and tip expectations. Outcall rates usually include the convenience of setup in your room.",
      "RoomSpa publishes clear THB prices on the site (with an approximate USD guide). Core coverage in Old City and Nimman typically has no travel fee; the Airport / Hang Dong corridor may add a small travel fee depending on distance.",
      "You can pay cash on arrival, card later from My booking, or card now at checkout. No surprise add-ons for standard sessions — extras are only what you choose.",
      "Compare the full menu on Pricing, then book the service that matches your pressure and duration needs.",
    ],
    primaryCta: { label: "See pricing", href: "/pricing" },
    secondaryCta: { label: "Book a session", href: "/book" },
  },
  {
    slug: "how-outcall-massage-works-chiang-mai",
    title: "How does outcall massage work in Chiang Mai?",
    description:
      "Step-by-step: booking outcall / mobile massage in Chiang Mai — choosing a service, sharing your hotel details, arrival, payment, and PIN access.",
    datePublished: "2026-08-08",
    tags: ["outcall", "how it works", "Chiang Mai"],
    body: [
      "Outcall massage means the spa comes to you. In Chiang Mai the usual flow is: pick a treatment, share where you are staying, confirm a time, and welcome a therapist who arrives ready to work.",
      "With RoomSpa: (1) choose a service online, (2) select date and time slot, (3) enter hotel/condo/home details and contact info, (4) choose cash, card later, or card now, (5) receive email confirmation with reference + PIN.",
      "Before the session we confirm availability. On the day, the therapist arrives within the agreed window, sets up discreetly, and begins after a short check-in on pressure and any health notes you shared.",
      "Afterward you can manage the booking with email + PIN, pay any remaining balance by card, and — once the visit is marked complete — leave a moderated review.",
      "Same-day slots are often available when capacity allows. Evening times (roughly 5–9 pm) fill first, so book ahead when you can.",
    ],
    primaryCta: { label: "Start booking", href: "/book" },
    secondaryCta: { label: "Read FAQ", href: "/faq" },
  },
  {
    slug: "massage-after-midnight-chiang-mai",
    title: "Can I book a massage after midnight in Chiang Mai?",
    description:
      "Late-night and after-midnight massage options in Chiang Mai — what RoomSpa covers, how same-day late slots work, and when to WhatsApp for last-minute requests.",
    datePublished: "2026-08-08",
    tags: ["late night", "booking", "Chiang Mai"],
    body: [
      "Many travelers land late or want a session after dinner and nightlife. Some Chiang Mai outcall providers advertise until 1:00 am; availability always depends on therapists on shift.",
      "RoomSpa aims for flexible hours, including late evening when capacity allows. Online slots show what is bookable right now. If you need a time after the last listed slot — including after midnight — WhatsApp us with your hotel and preferred window.",
      "Late requests work best with 1–2 hours notice when possible. Flight delays happen: message your reference or new request as soon as you know your ETA.",
      "Hotels may have quiet-hour rules. Keep volume low and use the do-not-disturb sign when appropriate so staff and neighbors stay comfortable.",
      "For the smoothest late arrival, book a confirmed evening slot earlier in the day, or message WhatsApp before you leave the airport.",
    ],
    primaryCta: { label: "Check available times", href: "/book" },
    secondaryCta: { label: "Contact / WhatsApp", href: "/contact" },
  },
  {
    slug: "hotel-policy-outside-massage-therapist-chiang-mai",
    title: "Does my Chiang Mai hotel allow outside massage therapists?",
    description:
      "How hotel policies affect outcall massage in Chiang Mai — what to ask the front desk, how RoomSpa handles discreet arrival, and what to do if outside therapists are restricted.",
    datePublished: "2026-08-08",
    tags: ["hotel policy", "outcall", "Chiang Mai"],
    body: [
      "Policies vary. Many Chiang Mai hotels and boutique properties allow professional outcall therapists, especially when guests book in advance. Some luxury brands or hostels restrict outside visitors for security.",
      "Ask the front desk: “Do you allow an outside massage therapist for an in-room appointment?” If they say yes, note any visitor registration or deposit rules and put them in your booking notes.",
      "RoomSpa therapists arrive as professional wellness visitors — calm, discreet, and clear with staff. We never share intimate session details at the desk.",
      "If the hotel says no, options include: book a condo/Airbnb stay that allows visitors, choose a nearby private spa room, or ask us on WhatsApp whether another coverage option fits your dates.",
      "When in doubt, check policy before you pay. We would rather help you adjust than send a therapist who cannot enter.",
    ],
    primaryCta: { label: "Book with hotel notes", href: "/book" },
    secondaryCta: { label: "WhatsApp us first", href: "/contact" },
  },
  {
    slug: "best-areas-chiang-mai-hotel-massage",
    title: "Best areas in Chiang Mai for hotel massage",
    description:
      "Old City, Nimman, and Airport / Hang Dong — where in-room hotel massage works best in Chiang Mai and how RoomSpa coverage maps to each area.",
    datePublished: "2026-08-08",
    tags: ["locations", "Nimman", "Old City"],
    body: [
      "The best area for hotel massage is wherever you are already staying — that is the point of outcall. Still, demand clusters in a few Chiang Mai neighborhoods.",
      "Old City / Center: guesthouses and heritage hotels inside and around the moat. Ideal after temple days and night markets. RoomSpa covers this as a core zone.",
      "Nimman / University area: boutiques, condos, and digital-nomad stays near Nimmanhaemin and Maya. Fast to reach for therapists; popular for evening couples and recovery sessions.",
      "Airport / Hang Dong corridor: convenient after landing or for residences south of the center. A light travel fee may apply depending on distance — shown when you book.",
      "Bangkok and Phuket are on the roadmap; Chiang Mai is live today. Open the Chiang Mai page for neighborhood detail, then book with your hotel name so we route correctly.",
    ],
    primaryCta: { label: "Explore Chiang Mai", href: "/city/chiang-mai" },
    secondaryCta: { label: "Book now", href: "/book" },
  },
  {
    slug: "hotel-massage-chiang-mai-how-it-works",
    title: "Hotel massage in Chiang Mai: how in-room booking works",
    description:
      "How RoomSpa brings a therapist to your Chiang Mai hotel room — what to prepare, pricing basics, and how to book with a PIN.",
    datePublished: "2026-08-07",
    tags: ["Chiang Mai", "hotel massage", "booking"],
    body: [
      "Looking for a massage without leaving your hotel in Chiang Mai? In-room (mobile) massage means a professional therapist travels to you — Old City guesthouses, Nimman boutiques, and airport-corridor hotels included.",
      "You choose a service online, pick a time, and share your hotel name or room details. We confirm availability and you receive a booking reference plus a 4-digit PIN by email.",
      "Prepare a clear bed or floor space and a quiet room. We bring oils, towels, and sheets as needed. For oil or Nuru sessions we use waterproof covers. You do not need spa equipment.",
      "Pay cash on arrival, card later from My booking, or card now at checkout. Discretion is standard: therapists use professional language with hotel staff and never share your booking details.",
      "Ready to book? Open the booking form, choose your service, and select Chiang Mai coverage that matches your hotel area.",
    ],
    primaryCta: { label: "Book a session", href: "/book" },
    secondaryCta: { label: "Browse services", href: "/services" },
  },
  {
    slug: "best-couples-massage-chiang-mai-in-room",
    title: "Best couples massage in Chiang Mai — in your room",
    description:
      "Side-by-side or dual-therapist couples massage at your Chiang Mai hotel or condo. How RoomSpa sessions work and what to expect.",
    datePublished: "2026-08-07",
    tags: ["couples", "Chiang Mai", "hotel"],
    body: [
      "Couples massage in Chiang Mai does not have to mean a crowded spa lobby. RoomSpa offers couples and four-hands sessions in your hotel, condo, or home — private, timed around your evening plans.",
      "Classic couples massage focuses on relaxation side by side. Four-hands sessions use two therapists on one guest when you want deeper unwind. We also offer a consent-led couples sensual format when both partners want a more intimate, professional session — boundaries are set before touch begins.",
      "Space tip: a king bed or clear floor area works best. Tell us the room type in notes so we bring the right setup.",
      "Book Couples or Couples Sensual from Services, or message WhatsApp if you want help choosing a duration.",
    ],
    primaryCta: { label: "Book couples massage", href: "/book?service=couples" },
    secondaryCta: { label: "View couples services", href: "/services" },
  },
  {
    slug: "thai-massage-vs-oil-massage",
    title: "Thai massage vs oil massage: which should you book?",
    description:
      "A clear comparison of Thai (dry, stretch-focused) and oil-based massage — and when to choose deep tissue or Swedish instead.",
    datePublished: "2026-08-07",
    tags: ["Thai massage", "oil massage", "guide"],
    body: [
      "Thai massage is typically performed clothed, on a mat, with rhythmic compressions and assisted stretches. It is excellent for mobility, travel stiffness, and guests who prefer less oil.",
      "Oil massage (Swedish, aromatherapy, hot oil, Balinese) uses lotion or oil with longer gliding strokes. Choose these when you want classic spa relaxation, softer pressure, or scent-led unwind.",
      "Deep tissue and sports sit between therapeutic goals and pressure — better when you have a specific tight area after hiking Doi Suthep or sitting through long flights.",
      "Not sure? Start with Swedish for general recovery or Thai if you want stretch-focused work. You can note pressure preferences when you book.",
    ],
    primaryCta: { label: "Compare on Services", href: "/services" },
    secondaryCta: { label: "Book now", href: "/book" },
  },
  {
    slug: "deep-tissue-massage-after-hiking-chiang-mai",
    title: "Deep tissue massage after hiking in Chiang Mai",
    description:
      "Recover from Doi Suthep, Doi Inthanon, or city walking tours with in-room deep tissue or sports massage in Chiang Mai.",
    datePublished: "2026-08-07",
    tags: ["deep tissue", "hiking", "Chiang Mai"],
    body: [
      "Chiang Mai hikes and temple climbs leave calves, hips, and shoulders tight. An in-room deep tissue or sports session lets you recover without another tuk-tuk ride across town.",
      "Tell your therapist which trails or activities you did and where you feel sore. We adjust pressure and avoid inflamed areas.",
      "Hydrate after the session and keep the evening light. Pair with foot reflexology if your feet took the worst of the climb.",
      "Book Deep Tissue or Sports from the therapeutic menu — available in Old City, Nimman, and Airport / Hang Dong coverage.",
    ],
    primaryCta: { label: "Book deep tissue", href: "/book?service=deep-tissue" },
    secondaryCta: { label: "Therapeutic menu", href: "/services" },
  },
  {
    slug: "nuru-massage-chiang-mai-what-to-expect",
    title: "Nuru massage in Chiang Mai: what to expect",
    description:
      "A clear, professional overview of consent-led Nuru bodywork with RoomSpa — boundaries, hygiene, and how to book discreetly.",
    datePublished: "2026-08-07",
    tags: ["Nuru", "sensual", "Chiang Mai"],
    body: [
      "Nuru is a gel-based body-to-body massage offered as consent-led professional bodywork — not an escort service. RoomSpa sessions begin with clear boundaries; you can pause or stop anytime.",
      "We bring waterproof sheets and towels. A shower nearby is helpful. Privacy and discretion are standard for hotel arrivals.",
      "If you are new to sensual or tantric work, read the service description and FAQ first, then book Nuru or related sessions from the sensual menu. Questions before booking are welcome on WhatsApp.",
    ],
    primaryCta: { label: "View Nuru", href: "/services/nuru" },
    secondaryCta: { label: "Read FAQ", href: "/faq" },
  },
  {
    slug: "how-often-should-you-get-a-massage",
    title: "How often should you get a massage when traveling?",
    description:
      "Practical guidance on massage frequency for tourists and digital nomads in Thailand — recovery, budget, and booking tips.",
    datePublished: "2026-08-07",
    tags: ["travel", "wellness", "tips"],
    body: [
      "There is no single rule. Many travelers feel best with a session after a long flight, then again mid-trip if they are hiking or sitting for work.",
      "Digital nomads in Chiang Mai often book weekly Swedish or Thai to manage desk tension. Athletes lean toward sports or deep tissue after hard training days.",
      "Listen to your body: soreness that improves with movement is different from sharp pain — mention injuries when you book so we can adapt or decline unsafe work.",
      "RoomSpa makes repeat visits easy: save your email + PIN from My booking, or rebook from the site in a few taps.",
    ],
    primaryCta: { label: "Book a session", href: "/book" },
    secondaryCta: { label: "Manage booking", href: "/my-booking" },
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts() {
  return [...blogPosts].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}
