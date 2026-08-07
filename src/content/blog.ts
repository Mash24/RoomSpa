export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  tags: string[];
  /** Simple paragraphs for Phase 1 — CMS later */
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "hotel-massage-chiang-mai-how-it-works",
    title: "Hotel massage in Chiang Mai: how in-room booking works",
    description:
      "How RoomSpa brings a therapist to your Chiang Mai hotel room — what to prepare, pricing basics, and how to book with a PIN.",
    datePublished: "2026-08-07",
    tags: ["Chiang Mai", "hotel massage", "booking"],
    body: [
      "Looking for a massage without leaving your hotel in Chiang Mai? In-room (mobile) massage means a professional therapist travels to you — Old City guesthouses, Nimman boutiques, and airport-corridor hotels included.",
      "You choose a service online (Swedish, Thai, deep tissue, couples, or consent-led sensual sessions), pick a time, and share your hotel name or room details. We confirm availability and you receive a booking reference plus a 4-digit PIN by email.",
      "Prepare a clear bed or floor space and a quiet room. We bring oils, towels, and sheets as needed. For oil or Nuru sessions we use waterproof covers. You do not need spa equipment.",
      "Pay cash on arrival, card later from My booking, or card now when the service supports online checkout. Discretion is standard: therapists use professional language with hotel staff and never share your booking details.",
      "Ready to book? Open the booking form, choose your service, and select Chiang Mai coverage that matches your hotel area.",
    ],
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
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts() {
  return [...blogPosts].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}
