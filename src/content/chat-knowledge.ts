/**
 * Grounded knowledge for the RoomSpa concierge chat.
 * Keep answers factual, discreet, and aligned with the public site.
 */

export type KnowledgeEntry = {
  id: string;
  title: string;
  tags: string[];
  content: string;
};

export const chatKnowledge: KnowledgeEntry[] = [
  {
    id: "what-is-roomspa",
    title: "What is RoomSpa?",
    tags: ["about", "roomspa", "mobile", "in-room", "hotel", "condo", "home"],
    content:
      "RoomSpa is a private in-room massage service in Chiang Mai. We come to your hotel, condo, or home — there is no walk-in spa lobby. Guests book online, pick a time, and a therapist arrives prepared.",
  },
  {
    id: "coverage",
    title: "Coverage areas",
    tags: ["coverage", "area", "zone", "nimman", "old city", "airport", "hang dong", "where", "travel"],
    content:
      "We serve Chiang Mai coverage zones: Old City / Center, Nimman / University area, and Airport / Hang Dong corridor (small travel fee may apply on the airport corridor). Outside those areas, ask WhatsApp or open a ticket — we can often still help with a travel fee.",
  },
  {
    id: "how-to-book",
    title: "How to book",
    tags: ["book", "booking", "reserve", "availability", "tonight", "same day", "slot"],
    content:
      "Book at /book: choose a service, duration (60 / 90 / 120 min), date, time slot, and hotel/condo/home details. Same-day slots are often available — open times and remaining capacity show on the booking form. The chat cannot invent live availability; always point guests to Check availability / Book.",
  },
  {
    id: "payment",
    title: "Payments",
    tags: ["pay", "payment", "card", "cash", "stripe", "price", "cost"],
    content:
      "Guests can pay by card when booking (when enabled), pay by card later from My booking (email + PIN), or pay cash on arrival. Prices are listed on each service page and /pricing in THB for 60 / 90 / 120 minutes.",
  },
  {
    id: "pin",
    title: "Booking PIN",
    tags: ["pin", "my booking", "manage", "cancel", "change"],
    content:
      "After booking, guests get a 4-digit PIN (shown once and emailed). Use email + PIN on My booking to manage the appointment. To change or cancel, use My booking or WhatsApp with the reference code — give as much notice as possible.",
  },
  {
    id: "prepare-room",
    title: "What to prepare",
    tags: ["prepare", "room", "bring", "table", "shower", "towels", "oil"],
    content:
      "Clear floor or bed space, a quiet atmosphere, and bathroom/shower access when possible. Guests do not need spa equipment. For oil or Nuru we bring waterproof sheets and towels. A portable table is used when space allows.",
  },
  {
    id: "discretion",
    title: "Privacy and discretion",
    tags: ["privacy", "discreet", "discretion", "hotel staff", "secret", "confidential"],
    content:
      "Therapists arrive discreetly and use professional language with hotel staff when needed. Booking details are never shared. This is especially important for private/sensual sessions.",
  },
  {
    id: "consent",
    title: "Consent and boundaries",
    tags: ["consent", "boundaries", "stop", "safe", "professional", "escort"],
    content:
      "All sensual and intimate sessions are consent-led professional bodywork. Boundaries are confirmed before touch begins. Guests can pause or stop anytime. RoomSpa sessions are not escort bookings.",
  },
  {
    id: "legal",
    title: "Is in-room massage legal?",
    tags: ["legal", "law", "thailand", "allowed"],
    content:
      "Yes. RoomSpa provides professional mobile massage at hotels, condos, and homes in Chiang Mai. Therapists operate professionally within the scope of wellness and massage services.",
  },
  {
    id: "languages",
    title: "Languages",
    tags: ["english", "language", "thai", "speak"],
    content:
      "Booking, WhatsApp support, and sessions are available in English. Other languages may be available on request — ask when booking or via WhatsApp.",
  },
  {
    id: "tipping",
    title: "Tipping",
    tags: ["tip", "tipping", "gratuity"],
    content: "Tipping is optional and appreciated for great service. There is no required amount.",
  },
  {
    id: "tantric-who",
    title: "Is tantric massage only for men?",
    tags: [
      "tantric",
      "men",
      "women",
      "gender",
      "for men",
      "only for",
      "who can",
      "couples",
    ],
    content:
      "No. Tantric massage with RoomSpa is not only for men. It is a slow, full-body, consent-led session for guests who want presence, breath, and energy-aware touch — men, women, and couples (see Couples Sensual / Tantric). Boundaries are agreed before the session. Link: /services/tantric and /services/couples-sensual.",
  },
  {
    id: "tantric-what",
    title: "What is tantric massage?",
    tags: ["tantric", "what is", "energy", "breath"],
    content:
      "Tantric massage is slower, full-body, consent-led bodywork combining breath, presence, and energy awareness. It may include sensual full-body work depending on stated boundaries. Ideal when someone wants something more intentional than a classic spa massage. Book: /services/tantric or /book?service=tantric.",
  },
  {
    id: "nuru",
    title: "Nuru massage",
    tags: ["nuru", "gel", "slippery", "body slide"],
    content:
      "Nuru is a full-body gel massage with smooth continuous contact — private and consent-led. Performed on waterproof sheets we provide. Clear boundaries before the session. Shower access helps but is not always required. Book: /services/nuru or /book?service=nuru.",
  },
  {
    id: "body-to-body",
    title: "Body-to-body massage",
    tags: ["body to body", "body-to-body", "btb", "close contact"],
    content:
      "Body-to-body uses the therapist’s body for broad, flowing oil pressure with agreed boundaries upfront. Discreet arrival and professional conduct throughout. Book: /services/body-to-body or /book?service=body-to-body.",
  },
  {
    id: "yoni",
    title: "Yoni massage",
    tags: ["yoni", "women", "female", "genital", "intimate women"],
    content:
      "Yoni massage is tantric, consent-based genital massage for women — focused on presence, breath, and body trust. It is structured professional bodywork, not an escort service. Intake conversation before touch. Book: /services/yoni or /book?service=yoni.",
  },
  {
    id: "lingam",
    title: "Lingam massage",
    tags: ["lingam", "men", "male", "genital", "intimate men"],
    content:
      "Lingam massage is tantric, consent-based genital massage for men — awareness, breath, and full-body relaxation. Clear consent and boundaries; designed as bodywork, not a rushed sexual appointment. Book: /services/lingam or /book?service=lingam.",
  },
  {
    id: "couples-sensual",
    title: "Couples sensual / tantric",
    tags: ["couples sensual", "couples tantric", "partners", "together intimate"],
    content:
      "Couples Sensual / Tantric is a guided dual session for partners who want shared intimacy and relaxation at home. Format depends on availability (two therapists or facilitated couples). Boundaries confirmed before starting. Book: /services/couples-sensual or /book?service=couples-sensual.",
  },
  {
    id: "couples-wellness",
    title: "Couples massage (wellness)",
    tags: ["couples", "two people", "side by side", "partner"],
    content:
      "Classic Couples Massage is side-by-side or dual-therapist wellness massage (not necessarily sensual). For intimate couples work, point to Couples Sensual / Tantric. Book couples: /services/couples.",
  },
  {
    id: "swedish-thai-deep",
    title: "Classic wellness massages",
    tags: ["swedish", "thai", "deep tissue", "aromatherapy", "wellness", "therapeutic"],
    content:
      "RoomSpa offers classic and therapeutic wellness massage (Swedish, Thai, Deep Tissue, Aromatherapy, sports, prenatal, foot reflexology, etc.) at /services/wellness. Signature Experiences (Tantric, Nuru, etc.) are separate at /services/signature.",
  },
  {
    id: "private-vs-wellness",
    title: "Signature vs wellness",
    tags: ["sensual", "private", "difference", "which service", "recommend"],
    content:
      "Signature experiences (Tantric, Nuru, Body-to-Body, Yoni, Lingam, Couples Sensual) emphasize intimacy, presence, and consent-led bodywork. Wellness massage (classic/therapeutic) focuses on relaxation and muscle work. Ask what the guest wants (relax vs intimate connection) and recommend accordingly, then link to book.",
  },
  {
    id: "arrival-speed",
    title: "How fast can someone arrive?",
    tags: ["how fast", "how soon", "arrive", "tonight", "now", "asap"],
    content:
      "Same-day slots are often available in coverage zones. Guests should pick an open time on the booking form — remaining capacity shows per slot. Do not invent a specific arrival time in chat.",
  },
  {
    id: "hygiene",
    title: "Hygiene",
    tags: ["hygiene", "clean", "sanitized", "linen", "safe"],
    content:
      "Fresh linens, sanitized equipment, and professional conduct are standard. Guests can pause or stop a session at any time.",
  },
  {
    id: "reviews",
    title: "Reviews",
    tags: ["review", "rating", "feedback"],
    content: "Guests can leave honest reviews on /reviews after a visit.",
  },
  {
    id: "contact-human",
    title: "Talk to a human",
    tags: ["agent", "human", "person", "whatsapp", "call", "ticket", "help"],
    content:
      "Guests can WhatsApp RoomSpa anytime, or open a support ticket from this chat so an agent is notified by email. Prefer collecting name + WhatsApp/phone for callbacks. Do not promise an exact reply minute — typically we respond as soon as possible, often same evening for booking questions.",
  },
];

export const chatSystemPreamble = `You are RoomSpa’s discreet concierge for getroomspa.com — the warm, private voice of an in-room massage service in Chiang Mai.

Brand voice: calm, welcoming, premium, professional. Sound like a thoughtful host, not a helpdesk or engineer. Never crude, never escort-agency tone. Prefer “private / consent-led / we come to you.”

You answer using the retrieved website documents provided in each request (full-site index). Treat that as your source of truth for services, prices, FAQ, coverage, cities, policies, about, and blog content.

Facts:
- In-room massage in Chiang Mai (Bangkok/Phuket coming soon).
- Hotel · Condo · Home — we come to the guest.
- Primary commercial focus: private & sensual (Tantric, Nuru, Body-to-Body, Yoni, Lingam, Couples Sensual/Tantric). Wellness services still available.
- Payments: card now (when enabled), card later (My booking + PIN), or cash on arrival.
- You do NOT invent live calendar slots, therapist names, or medical claims.
- When unsure or the guest wants a person: invite them to Talk to our care team (a real person joins the chat) or WhatsApp.

Answer style:
- Short, friendly paragraphs. Mobile-friendly.
- Avoid jargon (“API”, “ticket”, “CMS”, “database”). Say “care team”, “booking”, “session”.
- When recommending a service, include paths like /book?service=tantric or /services/nuru.
- For “is tantric only for men?”: No — women, men, and couples formats.
- Be able to compare services, explain policies, and guide booking from site content.`;
