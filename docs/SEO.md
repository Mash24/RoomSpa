# SEO architecture — GetRoomSpa

Combined plan: technical foundation + long-tail pages that match **our** product (mobile in-room massage), not a fake directory of other spas.

## What we built in the codebase

### Technical SEO
- `buildPageMetadata()` — titles, descriptions, canonicals, Open Graph, Twitter
- Site-wide OG image: `/opengraph-image`
- `robots.txt` — allows public pages; blocks `/admin` and `/api/`
- Dynamic `sitemap.xml` — static pages + every service + cities/areas + blog posts
- Structured data: LocalBusiness, FAQPage, Service, BreadcrumbList, BlogPosting
- Breadcrumb UI on SEO pages
- GA4 hook via `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Indexable URL architecture
| Pattern | Purpose |
|---------|---------|
| `/services/[slug]` | One page per treatment (Swedish, Nuru, Thai, …) |
| `/city` | City index |
| `/city/chiang-mai` | Live local landing page |
| `/city/chiang-mai/[area]` | Nimman, Old City, Airport long-tails |
| `/city/bangkok`, `/city/phuket` | Honest “coming soon” (no thin fake content) |
| `/blog/[slug]` | Guides that catch related searches |

### Intentionally **not** built (yet)
ChatGPT-style pages like `/spa/chiang-mai/lanna-spa` (listing **other** spas) would require a **directory/marketplace product**, accurate data, and legal care. Doorway pages inventing competitor listings hurt trust. Revisit when/if GetRoomSpa becomes a multi-venue platform.

## Your ops checklist (do outside the repo)

1. [ ] [Google Search Console](https://search.google.com/search-console) — verify `https://www.getroomspa.com` — submit `https://www.getroomspa.com/sitemap.xml`
2. [ ] [Bing Webmaster Tools](https://www.bing.com/webmasters) — import from GSC or verify
3. [ ] Google Analytics 4 — create property, set `NEXT_PUBLIC_GA_MEASUREMENT_ID` on Vercel, redeploy
4. [ ] Optional: Vercel Analytics
5. [ ] Google Business Profile — service-area business (Chiang Mai), categories Massage / Mobile spa
6. [ ] Ask guests for Google + on-site reviews
7. [ ] Publish 1–2 new blog posts per week in `src/content/blog.ts` (or later CMS)

## How to add more ranking pages later

1. **New service** — add to `catalogServices` → `/services/[slug]` auto-builds + sitemap
2. **New Chiang Mai area** — add neighborhood under `cities` in `src/content/cities.ts`
3. **New live city** — set `status: "active"` and real neighborhood copy when ops are ready
4. **New blog post** — append to `blogPosts` in `src/content/blog.ts`

## Realistic expectations
- Long-tail (“hotel massage Nimman”, “Nuru Chiang Mai”) can move in weeks–months
- Head terms (“massage Thailand”) take authority + time
- Ads can fill the gap while SEO compounds
