import { site } from "@/content/site";
import type { Attribution } from "@/lib/analytics/attribution";

const whatsappNumber = site.contact.whatsapp.replace(/\D/g, "");

export type WhatsAppLinkOptions = {
  /** Where on the site the click came from, e.g. float, hero, city-phuket */
  cta: string;
  cityHint?: string;
  serviceSlug?: string;
  attribution?: Attribution | null;
  pagePath?: string;
};

/**
 * Builds a WhatsApp deep link with a clean guest-facing prefill.
 * Attribution stays in first-party analytics events — never in the message.
 */
export function buildWhatsAppHref(options: WhatsAppLinkOptions): string {
  const bits: string[] = [
    "Hi RoomSpa! I'd like to book a massage at my address. What openings are available?",
  ];

  if (options.cityHint) {
    bits.push(`I'm in / staying in ${options.cityHint}.`);
  }

  if (options.serviceSlug) {
    bits.push(`Service: ${options.serviceSlug}.`);
  }

  const text = encodeURIComponent(bits.join(" "));
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}

/** Static fallback for SSR / non-client contexts (no session attribution yet). */
export function defaultWhatsAppHref(cta = "site") {
  return buildWhatsAppHref({ cta });
}
