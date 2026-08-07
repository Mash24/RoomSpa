import { site } from "@/content/site";
import { productPriceLabel } from "@/content/services";
import { paymentMethodLabel } from "@/lib/booking/pin";
import {
  getBookingNotifyEmails,
  getEmailFrom,
  getEmailReplyTo,
  getResend,
} from "@/lib/email/resend";

export type BookingEmailInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  referenceCode: string;
  accessPin: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  locationType?: string;
  locationLabel: string;
  locationDetails?: string;
  notes?: string;
  amountThb: number;
  paymentMethod: string;
  siteUrl: string;
};

function manageUrl(input: BookingEmailInput) {
  const base = input.siteUrl.replace(/\/$/, "");
  return `${base}/my-booking?email=${encodeURIComponent(input.customerEmail)}`;
}

function locationTypeLabel(value?: string) {
  if (value === "hotel") return "Hotel";
  if (value === "condo") return "Condo";
  if (value === "home") return "Home";
  return value || "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bookingEmailHtml(input: BookingEmailInput) {
  const manage = manageUrl(input);
  const placeType = locationTypeLabel(input.locationType);
  const details = input.locationDetails?.trim();
  const notes = input.notes?.trim();

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f6f4f1;font-family:Georgia,'Times New Roman',serif;color:#1c1917;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffaf5;border:1px solid #e7e0d6;padding:32px;">
            <tr>
              <td>
                <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9a6b3f;">RoomSpa</p>
                <h1 style="margin:12px 0 0;font-size:28px;font-weight:normal;line-height:1.2;">Your booking details</h1>
                <p style="margin:16px 0 0;font-size:16px;line-height:1.5;color:#57534e;">
                  Hi ${escapeHtml(input.customerName)}, here is your RoomSpa booking confirmation.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#44403c;">
                  <tr>
                    <td style="padding:6px 0;color:#78716c;width:120px;vertical-align:top;">Service</td>
                    <td style="padding:6px 0;"><strong>${escapeHtml(input.serviceName)}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">When</td>
                    <td style="padding:6px 0;">${escapeHtml(input.scheduledDate)} at ${escapeHtml(input.scheduledTime)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Where</td>
                    <td style="padding:6px 0;">
                      ${placeType ? `${escapeHtml(placeType)} · ` : ""}${escapeHtml(input.locationLabel)}
                      ${details ? `<br /><span style="color:#78716c;">${escapeHtml(details)}</span>` : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Amount</td>
                    <td style="padding:6px 0;">${escapeHtml(productPriceLabel(input.amountThb))}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Payment</td>
                    <td style="padding:6px 0;">${escapeHtml(paymentMethodLabel(input.paymentMethod))}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Reference</td>
                    <td style="padding:6px 0;"><strong>${escapeHtml(input.referenceCode)}</strong></td>
                  </tr>
                  ${
                    input.customerPhone
                      ? `<tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Phone</td>
                    <td style="padding:6px 0;">${escapeHtml(input.customerPhone)}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    notes
                      ? `<tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Notes</td>
                    <td style="padding:6px 0;">${escapeHtml(notes)}</td>
                  </tr>`
                      : ""
                  }
                </table>

                <div style="margin:24px 0;padding:20px;border:1px solid #d4b896;background:#f3ebe1;">
                  <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#9a6b3f;">Your booking PIN</p>
                  <p style="margin:10px 0 0;font-size:36px;letter-spacing:0.25em;font-family:ui-monospace,monospace;">${escapeHtml(input.accessPin)}</p>
                  <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#57534e;">
                    Keep this PIN. Use your email + PIN on My booking to manage your appointment or pay by card later.
                  </p>
                </div>

                <p style="margin:0;">
                  <a href="${escapeHtml(manage)}" style="display:inline-block;background:#9a6b3f;color:#fffaf5;text-decoration:none;padding:12px 18px;font-size:14px;">
                    Manage booking
                  </a>
                </p>
                <p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#78716c;">
                  Questions? Reply to this email or WhatsApp ${escapeHtml(site.contact.whatsapp)}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function bookingEmailText(input: BookingEmailInput) {
  const placeType = locationTypeLabel(input.locationType);
  const lines = [
    `Hi ${input.customerName},`,
    ``,
    `Your RoomSpa booking confirmation:`,
    ``,
    `Service: ${input.serviceName}`,
    `When: ${input.scheduledDate} at ${input.scheduledTime}`,
    `Where: ${placeType ? `${placeType} · ` : ""}${input.locationLabel}`,
  ];

  if (input.locationDetails?.trim()) {
    lines.push(`Details: ${input.locationDetails.trim()}`);
  }

  lines.push(
    `Amount: ${productPriceLabel(input.amountThb)}`,
    `Payment: ${paymentMethodLabel(input.paymentMethod)}`,
    `Reference: ${input.referenceCode}`,
    `PIN: ${input.accessPin}`,
  );

  if (input.customerPhone) {
    lines.push(`Phone: ${input.customerPhone}`);
  }
  if (input.notes?.trim()) {
    lines.push(`Notes: ${input.notes.trim()}`);
  }

  lines.push(
    ``,
    `Manage booking: ${manageUrl(input)}`,
    ``,
    `WhatsApp: ${site.contact.whatsapp}`,
    `Email: ${site.contact.email}`,
  );

  return lines.join("\n");
}

/** Sends guest confirmation. Never throws — booking must still succeed if email fails. */
export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const resend = getResend();
  if (!resend) {
    console.info("[email] RESEND_API_KEY not set — skipped booking confirmation.");
    return { sent: false as const, reason: "not_configured" as const };
  }

  const payload = {
    from: getEmailFrom(),
    to: input.customerEmail,
    replyTo: getEmailReplyTo(),
    subject: `Your RoomSpa booking ${input.referenceCode}`,
    html: bookingEmailHtml(input),
    text: bookingEmailText(input),
  };

  try {
    const notify = getBookingNotifyEmails().filter(
      (email) => email.toLowerCase() !== input.customerEmail.toLowerCase(),
    );

    let result = await resend.emails.send({
      ...payload,
      ...(notify.length ? { bcc: notify } : {}),
    });

    // If BCC/domain notify fails, still deliver to the guest.
    if (result.error && notify.length) {
      console.warn("[email] booking BCC failed, retrying guest-only:", result.error);
      result = await resend.emails.send(payload);
    }

    if (result.error) {
      console.error("[email] booking confirmation failed:", result.error);
      return { sent: false as const, reason: "send_error" as const, error: result.error };
    }

    return { sent: true as const, id: result.data?.id };
  } catch (error) {
    console.error("[email] booking confirmation exception:", error);
    return { sent: false as const, reason: "exception" as const, error };
  }
}
