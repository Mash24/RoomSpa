export type ServiceFaq = { question: string; answer: string };

const sharedFaqs: ServiceFaq[] = [
  {
    question: "Is hotel / in-room massage legal in Thailand?",
    answer:
      "Yes. RoomSpa provides professional mobile massage services at hotels, condos, and homes in Chiang Mai. Our services are wellness and massage treatments, and therapists operate professionally within the scope of their services.",
  },
  {
    question: "Can couples book together?",
    answer:
      "Yes. Book Couples or Couples Sensual, or two individual sessions at the same time when therapists are available. Add a note if you want side-by-side setup.",
  },
  {
    question: "Can I pay by card?",
    answer:
      "Yes. Choose card later (pay from My booking with email + PIN), card now when enabled for that service, or cash on arrival.",
  },
  {
    question: "How much should I tip?",
    answer:
      "Tipping is optional and appreciated for great service. There is no required amount.",
  },
  {
    question: "How fast can someone arrive?",
    answer:
      "Same-day slots are often available in Chiang Mai coverage zones. Pick an open time on the booking form — you’ll see remaining capacity per slot.",
  },
];

/** Extra FAQs keyed by service slug (merged with shared). */
const bySlug: Record<string, ServiceFaq[]> = {
  thai: [
    {
      question: "Do I wear clothes for Thai massage?",
      answer:
        "Thai-style sessions are usually done in comfortable clothing on a mat with stretch-focused work. Wear loose pants and a T-shirt, or ask us what to prepare.",
    },
  ],
  swedish: [
    {
      question: "How much pressure is Swedish massage?",
      answer:
        "Medium by default, adjustable softer or firmer. Tell your therapist during the session anytime.",
    },
  ],
  "deep-tissue": [
    {
      question: "Will deep tissue hurt?",
      answer:
        "It can feel intense on tight areas but should stay productive, not sharp. We ease off immediately if anything feels wrong.",
    },
  ],
  couples: [
    {
      question: "Do you bring two therapists for couples?",
      answer:
        "For true side-by-side synchronized work we schedule two therapists when available. Note your preference when booking.",
    },
  ],
  nuru: [
    {
      question: "Is Nuru professional bodywork?",
      answer:
        "Yes. Nuru with RoomSpa is consent-led professional bodywork with clear boundaries. You can pause or stop anytime.",
    },
  ],
  yoni: [
    {
      question: "How do boundaries work for Yoni massage?",
      answer:
        "We discuss consent and limits before touch begins. Sessions are private, professional, and stop immediately on request.",
    },
  ],
  lingam: [
    {
      question: "Is Lingam massage discreet?",
      answer:
        "Yes. Hotel arrivals use professional language, and booking details stay confidential.",
    },
  ],
  prenatal: [
    {
      question: "Is prenatal massage safe?",
      answer:
        "We use pregnancy-aware positioning and avoid contraindicated pressure. Share your trimester and any doctor guidance when booking.",
    },
  ],
};

export function getServiceFaqs(slug: string): ServiceFaq[] {
  return [...sharedFaqs, ...(bySlug[slug] ?? [])];
}
