/** Legal pages — keep plain and accurate; update when ops change. */

export const privacyContent = {
  title: "Privacy Policy",
  updated: "August 2026",
  intro:
    "RoomSpa (GetRoomSpa) collects only what we need to book and deliver in-room massage, support your visit, and process payments.",
  sections: [
    {
      heading: "What we collect",
      body: [
        "When you book or contact us we may collect your name, email, phone number, booking notes, location details (hotel/condo/home), preferred service and time, and a booking PIN.",
        "If you pay by card, payment details are processed by Stripe. We do not store full card numbers on our servers.",
        "If you leave a review, we store the content you submit and may show your display name publicly after moderation.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "To confirm bookings, send email confirmations and receipts, coordinate therapists, handle changes or cancellations, and respond on WhatsApp or email.",
        "To improve availability, prevent fraud or abuse, and meet legal or accounting requirements.",
      ],
    },
    {
      heading: "Sharing",
      body: [
        "We share booking details with assigned therapists only as needed to deliver your session.",
        "We use processors such as Supabase (database), Stripe (payments), Resend (email), and hosting providers to run the site. They process data under their own security and privacy terms.",
        "We do not sell your personal information.",
      ],
    },
    {
      heading: "Retention & your choices",
      body: [
        "We keep booking records as long as needed for service history, dispute resolution, and legal obligations.",
        "Email hello@getroomspa.com to request access, correction, or deletion where applicable. Some records may be retained when required by law or legitimate business needs.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Privacy questions: hello@getroomspa.com. Operating area: Chiang Mai, Thailand.",
      ],
    },
  ],
} as const;

export const termsContent = {
  title: "Terms of Service",
  updated: "August 2026",
  intro:
    "By booking RoomSpa (GetRoomSpa) you agree to these terms. If you do not agree, please do not place a booking.",
  sections: [
    {
      heading: "Our service",
      body: [
        "RoomSpa provides mobile massage at hotels, condos, and private homes in our coverage areas. Sessions are professional bodywork. Intimate or sensual services listed on the site are consent-led bodywork with boundaries confirmed before the session — they are not escort or sexual services.",
        "Availability depends on therapist capacity. A submitted request may still be declined or rescheduled if we cannot fulfill it safely or on time.",
      ],
    },
    {
      heading: "Your responsibilities",
      body: [
        "Provide accurate contact and location details, be reachable at the scheduled time, and ensure a suitable private space for the therapist to work.",
        "Treat therapists with respect. Harassment, unsafe conditions, or requests outside agreed boundaries may end the session immediately without refund for time already used.",
      ],
    },
    {
      heading: "Payments",
      body: [
        "Prices are shown in THB. You may pay cash on arrival, by card later via My booking, or by card at checkout when offered.",
        "Card payments are processed by Stripe. A paid booking remains subject to our cancellation policy.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "Tell us about relevant health conditions or injuries before the session. Massage is not a substitute for medical care.",
        "To the extent permitted by law, RoomSpa is not liable for indirect or consequential losses arising from bookings or sessions.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Questions: hello@getroomspa.com or WhatsApp. Chiang Mai, Thailand.",
      ],
    },
  ],
} as const;

export const cancellationContent = {
  title: "Cancellation & Refund Policy",
  updated: "August 2026",
  intro:
    "We hold therapist time for your booking. Please change or cancel as early as you can.",
  sections: [
    {
      heading: "How to change or cancel",
      body: [
        "Use My booking with your email and PIN, or message us on WhatsApp/email with your reference code.",
        "Same-day changes depend on remaining capacity — we will confirm what is possible.",
      ],
    },
    {
      heading: "Timing",
      body: [
        "Cancel or reschedule at least 3 hours before your start time when possible so we can free the slot.",
        "Late cancellations or no-shows may forfeit prepaid amounts or incur a fee for cash bookings, especially when a therapist is already en route.",
      ],
    },
    {
      heading: "Refunds",
      body: [
        "If we cancel or cannot fulfill a prepaid booking, we will refund the card payment or offer a reschedule.",
        "Refunds for customer cancellations depend on notice given and costs already incurred. We aim to be fair — contact us and we will confirm the outcome in writing.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "hello@getroomspa.com · WhatsApp · My booking on getroomspa.com",
      ],
    },
  ],
} as const;
