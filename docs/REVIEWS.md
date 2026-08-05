# Guest reviews

## How it works

1. A guest submits a review on `/reviews`
2. The review is stored as **pending**
3. An admin approves or rejects it at `/admin/reviews`
4. Only **approved** reviews appear on `/reviews` and the homepage

## What guests can post

- Honest experience feedback (quality, punctuality, professionalism)
- Star rating 1–5
- Optional service and booking reference
- Constructive, respectful language

## What cannot be posted

- Hate, threats, harassment
- Graphic sexual descriptions of intimate sessions
- Escort solicitation / illegal content
- Spam, ads, links
- Phone numbers or emails in the review text
- Other people’s private details
- Fake / unrelated reviews

The API also soft-blocks common violations before moderation. Admins still review every submission.

## Setup

Run in Supabase SQL Editor:

`supabase/migrations/20260805_reviews.sql`

Requires `is_admin()` from the admin dashboard migration.

## Rate limits

About 3 submissions per hour per IP + identity key.
