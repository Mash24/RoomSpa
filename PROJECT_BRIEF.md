# Project Brief: Premium Mobile Massage Booking Platform

## 1. Overview
A mobile-first booking platform for massage appointments delivered at hotels, condos, or private homes. Target audience: foreign tourists, expats, digital nomads, and business travelers. The brand should be city-agnostic so it can expand to new service areas without a rebrand.

## 2. Tech Stack
- Frontend: Next.js, React, Tailwind CSS
- Backend: Supabase (database + storage)
- Hosting: Vercel
- Database: PostgreSQL
- Payments: Stripe
- Language: TypeScript throughout

## 3. Design Requirements
- Premium, clean, professional aesthetic
- Mobile-first, fast load times
- SEO-optimized
- Dark and light mode
- Multi-language support
- Professional photography/media

## 4. Pages
Home · Services · Pricing · About · Book Appointment · Coverage Area · Reviews · FAQ · Contact · Blog

## 5. Core Booking Features
- Online booking calendar with real-time availability
- Service selection
- Therapist profiles
- Travel area selection
- Booking confirmations
- SMS/WhatsApp reminders
- Customer accounts
- Double-booking prevention and travel-time blocking
- Automatic invoices and receipts

## 6. Content Management (CMS)
- No-code admin panel for uploading photos/videos, managing services, blog posts, testimonials, and homepage text
- Supabase Storage for media, with automatic optimization on upload
- Social publishing workflow to Instagram, Facebook, and LINE

## 7. SEO Strategy
- Clean semantic HTML, server-side rendering
- Auto-generated sitemap.xml and robots.txt
- Schema markup
- SEO-friendly URLs, titles, meta descriptions
- Service-specific landing pages built around search intent (e.g., "mobile massage Chiang Mai," "hotel massage Chiang Mai")
- SEO-optimized blog content with strong internal linking
- Google Search Console integration
- Target strong Google Lighthouse scores

## 8. Admin Dashboard
- Manage bookings, customers, services, therapists, reviews
- Business intelligence: bookings, revenue, popular services, conversion tracking
- Room to add a heatmap tool later

## 9. Accounts Needed for Integration

**Required:**
- GitHub (code)
- Vercel (hosting)
- Supabase (database + storage)
- Domain registrar (Cloudflare or Namecheap)

**Optional / add as needed:**
- Google Maps API
- Google Analytics
- Stripe (payments)
- Resend or SendGrid (email)
- Twilio or WhatsApp Business API (notifications)
- Cloudinary (advanced media optimization)

All API keys should be stored as environment variables — never hardcoded. Start with Supabase + GitHub + Vercel, then add the rest as needed.

## 10. Security
- Two-factor admin login
- Rate limiting
- CAPTCHA
- Daily backups

## 11. Performance
- Image optimization and lazy loading
- CDN caching

## 12. User Roles
Guest · Customer · Therapist · Admin

## 13. Growth / Business Features
- Notification system (email, SMS, WhatsApp, LINE)
- Coupon and promotions engine
- Review moderation
- Referral/affiliate system with trackable codes
- Basic CRM for customer preferences
- Email newsletters and abandoned-booking reminders
- API-first architecture, to support future mobile apps or hotel partnerships without rebuilding

## 14. Engineering Practices
- Clean architecture, component library
- Automated testing
- CI/CD via GitHub Actions
- Separate dev, staging, and production environments
- Request database schema docs, setup instructions, and seed data from Casa AI so the site isn't empty at launch

## 15. Build Philosophy
- MVP first, every feature modular, no over-engineering
- Prioritize performance, security, SEO, maintainability, and booking UX

## 16. Phased Roadmap

**Phase 1 (MVP):** Landing page, services, booking, admin dashboard, media management, basic SEO

**Phase 2:** Payments, customer accounts, reviews, promotions

**Phase 3:** Multiple therapists, referral system, CRM, mobile apps

## 17. Priority Order (initial build)
1. Beautiful landing page
2. Solid SEO foundation
3. Online booking
4. Admin dashboard
5. Payments
6. Customer accounts
7. Marketplace/multi-therapist features

---
*Request production-quality code with clean architecture and full documentation.*
