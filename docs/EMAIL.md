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
| `EMAIL_FROM` | `RoomSpa <hello@getroomspa.com>` |
| `EMAIL_REPLY_TO` | `support@getroomspa.com` |
| `EMAIL_HELLO` | `hello@getroomspa.com` |
| `EMAIL_BOOKING` | `booking@getroomspa.com` |
| `EMAIL_SUPPORT` | `support@getroomspa.com` |
| `EMAIL_ADMIN` | `admin@getroomspa.com` |

Redeploy after saving.

### Inbox roles
| Address | Role |
|---------|------|
| `hello@` | Public contact / From |
| `support@` | Reply-To (guest replies) |
| `booking@` | BCC of new bookings |
| `admin@` | BCC of new bookings (ops) |

### 4. What the app sends
After a successful `/api/bookings` create:
- Guest receives confirmation with reference + **PIN** + manage link
- `hello@getroomspa.com` is BCC’d (forwards to your Gmail)

If `RESEND_API_KEY` is missing, booking still works; email is skipped.
