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

/** Resend From — must match verified domain (default: GetRoomSpa <hello@…>) */
export function getEmailFrom() {
  return (
    process.env.EMAIL_FROM?.trim() || `GetRoomSpa <${getHelloEmail()}>`
  );
}

/** Where guest Replies go (default: support@) */
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

type SendAppEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  bcc?: string | string[];
  /** Overrides EMAIL_REPLY_TO when set */
  replyTo?: string;
};

/**
 * Shared Resend sender — always applies EMAIL_FROM + EMAIL_REPLY_TO from env.
 * Returns a structured result; never throws.
 */
export async function sendAppEmail(input: SendAppEmailInput) {
  const resend = getResend();
  if (!resend) {
    console.info("[email] RESEND_API_KEY not set — skipped send.");
    return { sent: false as const, reason: "not_configured" as const };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.to,
      replyTo: input.replyTo?.trim() || getEmailReplyTo(),
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      ...(input.bcc
        ? { bcc: Array.isArray(input.bcc) ? input.bcc : [input.bcc] }
        : {}),
    });

    if (error) {
      console.error("[email] send failed:", error);
      return { sent: false as const, reason: "send_error" as const, error };
    }

    return { sent: true as const, id: data?.id };
  } catch (error) {
    console.error("[email] send exception:", error);
    return { sent: false as const, reason: "exception" as const, error };
  }
}
