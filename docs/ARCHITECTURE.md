# Architecture

## Principles
- **MVP first** — ship Phase 1 modularly; avoid over-engineering.
- **City-agnostic brand** — coverage areas are data, not hardcoded into the product name.
- **CMS-ready content** — copy lives in `src/content` now; migrate to Supabase tables + admin later.
- **API-first later** — booking and CMS will expose clear server boundaries for mobile apps / hotel partners.

## Stack
| Layer | Choice |
| --- | --- |
| UI | Next.js App Router, React, Tailwind CSS v4 |
| Language | TypeScript |
| Auth / DB / Storage | Supabase (wired next) |
| Hosting | Vercel |
| Payments | Stripe (Phase 2) |

## Folder map
```
src/
  app/                 # Routes, metadata, sitemap, robots
  components/
    home/              # Landing sections
    layout/            # Header, footer, theme toggle
    providers/         # Theme provider
    seo/               # JSON-LD and SEO helpers
    ui/                # Shared presentational pieces
  content/             # Static site content (CMS precursor)
  lib/                 # Shared utilities (expand as features land)
```

## Phase 1 remaining
1. Supabase schema + seed data
2. Booking calendar + availability
3. Admin dashboard + media uploads (Supabase Storage)
4. Service / SEO landing pages with real content

## Environments
Use separate Supabase projects and Vercel environments for **development**, **staging**, and **production**. Keep all secrets in environment variables (see `.env.example`).
