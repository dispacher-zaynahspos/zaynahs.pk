# app/ — routes only

## Purpose
Every URL the site answers. Route files should stay thin: fetch data via `lib/services/`,
render via `components/`.

## Belongs here
- `(store)/` public storefront routes (home, shop, product, cart, checkout, account, ...)
- `admin/` admin UI routes (auth-gated by `middleware.ts` + `lib/auth/requireAdmin`)
- `api/` route handlers (JSON, webhooks, cron, uploads)
- `auth/` Supabase auth callbacks
- `robots.ts`, `sitemap.ts`, `manifest.json/`, `llms.txt`, root `layout.tsx`

## Does not belong here
- Business logic → `lib/services/`
- Database clients → `lib/supabase/`
- Reusable UI → `components/`
- Brand/domain constants → `lib/brand/` (target) or settings
- Platform-specific code → `lib/platform/`

## Route conventions
- Store pages: server component by default; `'use client'` only for interactivity.
- Admin pages: behind auth; never indexable (`X-Robots-Tag: noindex`).
- API: validate input, guard with `requireAdmin` or `checkRateLimit` (RULE ABUSE2).
