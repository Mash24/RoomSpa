/** Review posting rules — shared by API validation and public UI copy */

export const REVIEW_MIN_BODY = 20;
export const REVIEW_MAX_BODY = 1000;
export const REVIEW_MIN_NAME = 2;
export const REVIEW_MAX_NAME = 80;
export const REVIEW_MAX_TITLE = 120;

export const reviewGuidelines = {
  allowed: [
    "Your honest experience with RoomSpa (service quality, punctuality, professionalism, atmosphere).",
    "Star rating from 1 to 5.",
    "Optional service name and booking reference (helps us verify genuine guests).",
    "Constructive feedback written respectfully.",
  ],
  notAllowed: [
    "Hate speech, threats, harassment, or discrimination.",
    "Graphic sexual descriptions of intimate / tantric sessions — keep it tasteful and non-explicit.",
    "Illegal activity, solicitation, or anything that implies escort services.",
    "Spam, ads, affiliate links, or unrelated promotions.",
    "Personal data of therapists or other guests (full names of staff, private phones, addresses).",
    "Your own phone number, email, or social handles meant for others to contact you.",
    "False claims, impersonation, or reviews that are clearly not about RoomSpa.",
  ],
} as const;

/** Soft blocklist — rejects obvious policy violations before moderation. */
const BLOCKED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(kill yourself|kys|rape|molest)\b/i,
    reason: "Your review contains language we cannot publish.",
  },
  {
    pattern: /\b(escort|prostitute|hooker|happy ending|full service sex)\b/i,
    reason: "Reviews cannot solicit or describe escort / sexual services.",
  },
  {
    pattern: /\b(buy now|click here|crypto|forex|viagra|casino)\b/i,
    reason: "Promotional or spam content is not allowed.",
  },
  {
    pattern: /https?:\/\/|www\./i,
    reason: "Please do not include links in reviews.",
  },
  {
    pattern: /(?:\+?\d[\d\s\-()]{8,}\d)/,
    reason: "Please do not include phone numbers in reviews.",
  },
  {
    pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    reason: "Please do not include email addresses in the review text.",
  },
];

export function findReviewPolicyViolation(text: string): string | null {
  const normalized = text.trim();
  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(normalized)) {
      return rule.reason;
    }
  }
  return null;
}

export function isValidReviewRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}
