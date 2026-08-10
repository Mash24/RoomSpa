# Domain email (getroomspa.com)

## Receive (Cloudflare Email Routing)
Already set up: `hello@getroomspa.com` forwards to your Gmail.

Replies from Gmail still show as Gmail unless you add “Send mail as” with SMTP.

## Send (Resend — booking confirmations)

### 1. Resend dashboard
1. Create an account at [resend.com](https://resend.com)
2. **Domains** → Add `getroomspa.com`
3. Copy the DNS records Resend shows (usually DKIM CNAMEs + SPF update)

### 2. Cloudflare DNS
1. Add Resend’s **DKIM** CNAME records (DNS only, grey cloud)
2. Edit the existing **Unlocked** SPF TXT on `getroomspa.com` to include Resend, for example:

```text
v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
```

Use the exact `include:` value Resend displays (often Amazon SES). Do not remove Cloudflare’s `include:_spf.mx.cloudflare.net`.

3. Wait until Resend marks the domain **Verified**

### 3. Vercel env (Production)

**Easiest:** import `env/VERCEL_IMPORT.production.env` (fill `RESEND_API_KEY` first).

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.getroomspa.com` |
| `RESEND_API_KEY` | from Resend → API Keys |
| `EMAIL_FROM` | `GetRoomSpa <hello@getroomspa.com>` |
| `EMAIL_REPLY_TO` | `support@getroomspa.com` |
| `EMAIL_HELLO` | `hello@getroomspa.com` |
| `EMAIL_BOOKING` | `booking@getroomspa.com` |
| `EMAIL_SUPPORT` | `support@getroomspa.com` |
| `EMAIL_ADMIN` | `admin@getroomspa.com` |
| `EMAIL_OPS_NOTIFY` | Your personal inbox for **NEW BOOKING** and **NEW TICKET** alerts (e.g. `testtestness@gmail.com`). Comma-separated OK. |
| `OPENAI_API_KEY` | Optional. Powers the site concierge chat (GPT). Without it, chat still answers from the grounded knowledge base. |
| `OPENAI_CHAT_MODEL` | Optional. Defaults to `gpt-4o-mini`. |

Redeploy after saving.

### Inbox roles
| Address | Role |
|---------|------|
| `hello@` | Public contact / From |
| `support@` | Reply-To (guest replies) |
| `booking@` | BCC of guest confirmation |
| `admin@` | BCC of guest confirmation |
| `EMAIL_OPS_NOTIFY` | **To:** dedicated ops “New booking” + “New support ticket” emails |

### 4. What the app sends
After a successful `/api/bookings` create:
- Guest receives confirmation with reference + **PIN** + manage link
- You receive a separate **New booking** email at `EMAIL_OPS_NOTIFY` with guest, service, time, place, payment, PIN, and admin link
- `booking@` and `admin@` are still BCC’d on the guest confirmation when configured

When a guest opens an agent ticket from the site chat (`/api/chat/ticket`):
- You receive a **New support ticket** email at `EMAIL_OPS_NOTIFY` with contact details, message, and recent chat transcript
- Manage status under `/admin/tickets` (after running the `support_tickets` migration)

After Stripe Checkout payment succeeds:
- Guest receives a **payment receipt** email with booking details + PIN
- Same BCC list (only on first mark-paid, not on page refresh)

When an admin changes booking status in the dashboard:
- Guest receives a status update email (confirmed / cancelled / completed / etc.)
- Same BCC list as above

If `RESEND_API_KEY` is missing, booking/status/payment updates still work; email is skipped.
