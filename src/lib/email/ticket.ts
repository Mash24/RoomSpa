import {
  getOpsNotifyEmails,
  getResend,
  sendAppEmail,
} from "@/lib/email/resend";

export type TicketEmailInput = {
  referenceCode: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  subject: string;
  message: string;
  pagePath?: string | null;
  transcript: { role: string; content: string }[];
  siteUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function adminTicketUrl(input: TicketEmailInput) {
  const base = input.siteUrl.replace(/\/$/, "");
  return `${base}/admin/tickets`;
}

function transcriptHtml(transcript: TicketEmailInput["transcript"]) {
  if (!transcript.length) return "<p style=\"color:#78716c;\">No prior chat transcript.</p>";
  const rows = transcript
    .slice(-12)
    .map((line) => {
      const who = line.role === "user" ? "Guest" : "Concierge";
      return `<p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:#44403c;"><strong>${escapeHtml(who)}:</strong> ${escapeHtml(line.content)}</p>`;
    })
    .join("");
  return rows;
}

function ticketEmailHtml(input: TicketEmailInput) {
  const admin = adminTicketUrl(input);
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f6f4f1;font-family:Georgia,'Times New Roman',serif;color:#1c1917;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffaf5;border:1px solid #e7e0d6;padding:32px;">
            <tr>
              <td>
                <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9a6b3f;">RoomSpa · Support</p>
                <h1 style="margin:12px 0 0;font-size:26px;font-weight:normal;line-height:1.25;">New support ticket ${escapeHtml(input.referenceCode)}</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#57534e;">
                  A guest asked to talk to an agent from the site chat.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#44403c;">
                  <tr>
                    <td style="padding:6px 0;color:#78716c;width:110px;vertical-align:top;">Guest</td>
                    <td style="padding:6px 0;"><strong>${escapeHtml(input.guestName)}</strong></td>
                  </tr>
                  ${
                    input.guestPhone
                      ? `<tr><td style="padding:6px 0;color:#78716c;vertical-align:top;">Phone / WA</td><td style="padding:6px 0;">${escapeHtml(input.guestPhone)}</td></tr>`
                      : ""
                  }
                  ${
                    input.guestEmail
                      ? `<tr><td style="padding:6px 0;color:#78716c;vertical-align:top;">Email</td><td style="padding:6px 0;">${escapeHtml(input.guestEmail)}</td></tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding:6px 0;color:#78716c;vertical-align:top;">Subject</td>
                    <td style="padding:6px 0;">${escapeHtml(input.subject || "Chat handoff")}</td>
                  </tr>
                  ${
                    input.pagePath
                      ? `<tr><td style="padding:6px 0;color:#78716c;vertical-align:top;">Page</td><td style="padding:6px 0;">${escapeHtml(input.pagePath)}</td></tr>`
                      : ""
                  }
                </table>
                <div style="margin:24px 0 0;padding:16px;border:1px solid #e7e0d6;background:#faf7f2;">
                  <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#9a6b3f;">Message</p>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#44403c;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
                </div>
                <div style="margin:24px 0 0;">
                  <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#9a6b3f;">Recent chat</p>
                  ${transcriptHtml(input.transcript)}
                </div>
                <p style="margin:28px 0 0;">
                  <a href="${escapeHtml(admin)}" style="display:inline-block;background:#1c1917;color:#fffaf5;text-decoration:none;padding:12px 18px;font-size:14px;">Open tickets in admin</a>
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

function ticketEmailText(input: TicketEmailInput) {
  const lines = [
    `New support ticket ${input.referenceCode}`,
    `Guest: ${input.guestName}`,
    input.guestPhone ? `Phone/WA: ${input.guestPhone}` : null,
    input.guestEmail ? `Email: ${input.guestEmail}` : null,
    `Subject: ${input.subject || "Chat handoff"}`,
    input.pagePath ? `Page: ${input.pagePath}` : null,
    "",
    "Message:",
    input.message,
    "",
    "Recent chat:",
    ...input.transcript.slice(-12).map(
      (line) => `${line.role === "user" ? "Guest" : "Concierge"}: ${line.content}`,
    ),
    "",
    `Admin: ${adminTicketUrl(input)}`,
  ];
  return lines.filter((line) => line !== null).join("\n");
}

/** Notify EMAIL_OPS_NOTIFY when a guest opens an agent ticket. Never throws. */
export async function sendNewTicketOpsEmail(input: TicketEmailInput) {
  if (!getResend()) {
    console.info("[email] RESEND_API_KEY not set — skipped ticket alert.");
    return { sent: false as const, reason: "not_configured" as const };
  }

  const recipients = getOpsNotifyEmails();
  if (!recipients.length) {
    console.info("[email] EMAIL_OPS_NOTIFY not set — skipped ticket alert.");
    return { sent: false as const, reason: "no_recipients" as const };
  }

  const replyTo = input.guestEmail?.trim() || undefined;

  return sendAppEmail({
    to: recipients,
    subject: `[RoomSpa] New ticket ${input.referenceCode} · ${input.subject || "Chat handoff"} · ${input.guestName}`,
    html: ticketEmailHtml(input),
    text: ticketEmailText(input),
    replyTo,
  });
}
