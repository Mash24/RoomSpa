import { Resend } from "resend";
import { site } from "@/content/site";

let client: Resend | null = null;

export function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

function envEmail(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

/** Public / website contact */
export function getHelloEmail() {
  return envEmail("EMAIL_HELLO", site.contact.email);
}

/** New booking alerts (BCC) */
export function getBookingEmail() {
  return envEmail("EMAIL_BOOKING", "booking@getroomspa.com");
}

/** Guest support / help */
export function getSupportEmail() {
  return envEmail("EMAIL_SUPPORT", "support@getroomspa.com");
}

/** Internal ops */
export function getAdminEmail() {
  return envEmail("EMAIL_ADMIN", "admin@getroomspa.com");
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || `RoomSpa <${getHelloEmail()}>`;
}

export function getEmailReplyTo() {
  return process.env.EMAIL_REPLY_TO?.trim() || getSupportEmail();
}

/** BCC list for new booking confirmations (booking + admin). */
export function getBookingNotifyEmails() {
  const list = [getBookingEmail(), getAdminEmail()].filter(Boolean);
  return [...new Set(list)];
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
