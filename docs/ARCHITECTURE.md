# Architecture

## Principles
- **MVP first** — ship modularly; avoid over-engineering.
- **City-agnostic brand** — coverage areas are data; product name stays **RoomSpa**.
- **CMS-ready content** — seed/copy in `src/content`; live catalog in Supabase via admin.
- **Mobile-first** — phones are the primary device; floats and safe areas are first-class.

## Stack
| Layer | Choice |
| --- | --- |
| UI | Next.js App Router, React, Tailwind CSS v4 |
| Language | TypeScript |
| Auth / DB / Storage | Supabase |
| Hosting | Vercel |
| Payments | Stripe |
| Email | Resend (`getroomspa.com`) |
| Concierge | Site knowledge + optional OpenAI |

## Folder map
```
src/
  app/                 # Routes, APIs, metadata, sitemap
  components/
    home/              # Landing sections
    chat/              # Ask RoomSpa widget
    booking/           # Booking form
    layout/            # Header, footer, floats
    admin/             # Dashboard panels
    seo/               # JSON-LD helpers
  content/             # Static / CMS precursor content
  lib/                 # Catalog, chat, email, payments, reviews
supabase/migrations/   # Apply on Supabase before relying on new features
env/                   # Vercel import templates (no secrets in git values)
docs/                  # Ship + feature docs
```

## Environments
Separate Supabase projects and Vercel envs for **development** / **preview** / **production** when possible. Secrets only in env vars — see `.env.example` and `env/VERCEL_IMPORT.production.env`.

## Go live
Follow [SHIP.md](./SHIP.md).
