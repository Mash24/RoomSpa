# RoomSpa

Premium mobile-first booking for private in-room massage in Chiang Mai — hotel, condo, or home.

Live: [https://www.getroomspa.com](https://www.getroomspa.com)

**Shipping?** Start with [docs/SHIP.md](./docs/SHIP.md).

## Brand

- **RoomSpa** — guest-facing product name (hero, nav, chat, copy)
- **getroomspa.com** / GetRoomSpa — domain, email From, SEO alternate name

## What’s live

- Booking with duration tiers, PIN manage flow, Stripe pay-now / pay-later / cash
- Catalog CMS (services, media, blog) + admin dashboard
- Guest reviews + approval
- Pricing page with sensual full-bleed backdrop
- Homepage featured private/sensual experiences
- Ask RoomSpa concierge + care-team tickets (`/admin/tickets`)
- Mobile-first layout (safe areas, float clearance, fluid type)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

| Doc | Purpose |
| --- | --- |
| [docs/SHIP.md](./docs/SHIP.md) | **Go-live checklist** |
| [docs/CHAT.md](./docs/CHAT.md) | Concierge + care tickets |
| [docs/EMAIL.md](./docs/EMAIL.md) | Resend + domain email |
| [docs/BOOKING.md](./docs/BOOKING.md) | Booking & payments |
| [docs/ADMIN.md](./docs/ADMIN.md) | Admin access |
| [docs/REVIEWS.md](./docs/REVIEWS.md) | Reviews |
| [docs/CMS.md](./docs/CMS.md) | Services / media / blog |
| [docs/SEO.md](./docs/SEO.md) | SEO |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Stack map |
| [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) | Product scope |

Production env import template: `env/VERCEL_IMPORT.production.env`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
