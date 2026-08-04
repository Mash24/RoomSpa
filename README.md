# RoomSpa

Premium mobile-first booking platform for in-room massage at hotels, condos, and homes.

See [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) for full product scope and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for engineering notes.

## Current status

**Phase 1 — started**
- Next.js + TypeScript + Tailwind scaffold
- Premium landing page (dark / light mode)
- SEO foundation: metadata, sitemap, robots.txt, JSON-LD
- Route shells for all marketing pages

**Next up:** Supabase, booking flow, admin CMS + media

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Accounts to connect (start here)

| Service | Purpose |
| --- | --- |
| GitHub | Source control |
| Vercel | Hosting |
| Supabase | Database + auth + storage |
| Domain | Cloudflare / Namecheap |

Add Stripe, Maps, email, and WhatsApp when those features ship. Store keys in `.env.local` / Vercel env vars only.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Brand

**RoomSpa** is city-agnostic by design. Expand service areas without renaming the product.
