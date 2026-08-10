# Ship checklist — RoomSpa production

Live site: **https://www.getroomspa.com**  
Brand in UI: **RoomSpa** · Domain / email: **getroomspa.com** / GetRoomSpa

Use this before or right after a production deploy.

---

## 1. Deploy the latest `main`

Vercel must build the **current** `main` commit — not an old deployment.

```bash
git push origin main   # if anything is still local
# Vercel → Deployments → redeploy the latest main
# Or: vercel deploy --prod
```

Avoid “Redeploy” on an old deployment hash; that can ship stale code.

---

## 2. Vercel environment (Production)

Import or verify `env/VERCEL_IMPORT.production.env` after filling secrets.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.getroomspa.com` |
| Supabase + Stripe keys | Yes | Already on Vercel — leave alone |
| `RESEND_API_KEY` | Yes | Booking / care emails |
| `EMAIL_FROM` | Yes | `GetRoomSpa <hello@getroomspa.com>` |
| `EMAIL_REPLY_TO` | Yes | `support@getroomspa.com` |
| `EMAIL_OPS_NOTIFY` | Yes | Your ops Gmail for new bookings + care alerts |
| `EMAIL_HELLO` / `BOOKING` / `SUPPORT` / `ADMIN` | Yes | Domain inboxes |
| `OPENAI_API_KEY` | Recommended | Smarter “Ask RoomSpa” chat; works without it via site knowledge |
| `OPENAI_CHAT_MODEL` | Optional | Default `gpt-4o-mini` |
| `BOOKING_SLOT_CAPACITY` | Optional | Default `3` |

Details: [EMAIL.md](./EMAIL.md), [CHAT.md](./CHAT.md).

---

## 3. Supabase migrations (must be applied)

In project **RoomSpa** (`ffjcuajxhjvpfodohxhn`), confirm these recent migrations ran (SQL Editor or CLI):

| File | Purpose |
| --- | --- |
| `20260810_feature_private_services.sql` | Feature private / sensual catalog order |
| `20260810144039_support_tickets.sql` | Care tickets table |
| `20260810_ticket_messaging_ratings.sql` | Thread messages + end-chat ratings |

Older Phase 1 migrations (booking, Stripe, reviews, CMS, admin) must already be present.

---

## 4. Smoke test (phone + desktop)

Do these on production after deploy:

1. **Home** — hero, book strip, featured sensual section (backdrop visible), how it works, reviews  
2. **Book** — create a test booking (pay later / cash path is enough)  
3. **Email** — confirmation + PIN arrive; ops notify hits `EMAIL_OPS_NOTIFY`  
4. **My booking** — email + PIN lookup works  
5. **Pricing** — backdrop + readable prices; Book links open `/book?service=…`  
6. **Ask RoomSpa** — chat opens on mobile; “Talk to care team” creates a ticket  
7. **Admin** — `/admin/login` → Care chats (`/admin/tickets`) → reply / end  
8. **WhatsApp** float — does not cover primary CTAs on a small phone  

---

## 5. Ops day-one habits

| Channel | Use |
| --- | --- |
| WhatsApp | Fast guest booking / same-day |
| Ask RoomSpa → Care | Logged threads; reply in `/admin/tickets` |
| `EMAIL_OPS_NOTIFY` | New booking + care alerts |
| `/admin` | Confirm / complete bookings, approve reviews |

---

## 6. Brand (don’t mix)

| Surface | Name |
| --- | --- |
| Site hero, nav, chat, guest emails body | **RoomSpa** |
| Domain, Resend From display, schema alternate | **GetRoomSpa** / getroomspa.com |

---

## 7. Intentionally not on homepage (yet)

These components exist but are not mounted on `/`:

- `HomeCta` — optional closing CTA  
- `HomeGallery` — optional atmosphere strip  
- `HomePricing` — prefer `/pricing` instead of repeating cards  

Add later if conversion needs a stronger close.

---

## Related docs

| Doc | Topic |
| --- | --- |
| [CHAT.md](./CHAT.md) | Concierge chat + care tickets |
| [EMAIL.md](./EMAIL.md) | Resend + domain mail |
| [BOOKING.md](./BOOKING.md) | Booking + payments |
| [ADMIN.md](./ADMIN.md) | Admin setup |
| [REVIEWS.md](./REVIEWS.md) | Guest reviews |
| [SEO.md](./SEO.md) | Metadata / sitemap |
| [CMS.md](./CMS.md) | Services / media / blog CMS |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack overview |
