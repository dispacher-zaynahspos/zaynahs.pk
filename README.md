# Universal Next.js E-Commerce Template

A high-performance, mobile-first, and SEO-optimized e-commerce template built with Next.js App Router (React Server Components), Tailwind CSS, and Supabase. Designed to be a public, clone-ready project that can be deployed across multiple domains (clothing, pharmacy, retail) with zero code changes required per brand.

## 🚀 Key Features

- **Multi-Domain Ready**: Fully decoupled from brand names. Domain, logo, and brand name are injected dynamically from database settings or environment variables (`getDomainBrand()`).
- **Mobile-First UX**: Specifically optimized for mobile viewing with touch-friendly gestures, bottom sheets, sticky cart bars, and fast TTFB (Time to First Byte).
- **Extreme Performance**: Implements a 5-layer caching strategy (Browser → Cloudflare → Vercel Edge → Next.js ISR → DB).
- **Zero-Friction Checkout**: WhatsApp-based ordering system bypasses complex payment gateway setups for instant market deployment in cash-on-delivery regions.
- **Advanced Admin Panel**: Complete inventory, order, category, media, and SEO management with real-time tracking and abandoned cart recovery.
- **Enterprise SEO**: Auto-generated structured data (JSON-LD), dynamic OpenGraph tags, sitemap, robots.txt, and integrated Google Indexing / IndexNow APIs.
- **Centralized Design System**: Modular UI components, strict typography (Geist + Inter), and centralized icon registry.

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v3/v4 (Dark mode ready)
- **Database / Auth / Storage**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Deployment**: Vercel
- **CDN / Edge**: Cloudflare

## 📦 Getting Started (Clone & Deploy)

### 1. Database Setup (Supabase)
This project uses a fully self-contained database schema.
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the master schema file in the SQL Editor: `supabase/schema/SUPER_MASTER_SCHEMA.sql`.
   - This automatically creates all tables, RLS policies, triggers, and the `product-images` storage bucket.
3. No manual dashboard configuration is required.

### 2. Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env.local
```
Key variables required:
- `SUPABASE_PROJECT_REF`, `SUPABASE_MGMT_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `REVALIDATE_SECRET` (Use: `zaynahs_secret_cache_revalidate_2026`)
- `NEXT_PUBLIC_SITE_URL` (For local dev: `http://localhost:3000`)

*See `.env.example` for comprehensive instructions on obtaining Cloudflare, Vercel, and SEO tokens.*

### 3. Local Development
```bash
npm install
npm run dev
```
Access the storefront at `http://localhost:3000` and the admin panel at `http://localhost:3000/admin`.

## 📜 Documentation

For deep dives into the architecture, caching rules, and development guidelines, refer to the `docs/` folder:
- **`STORE_GUIDE.md` / `NEW_PROJECT_SETUP_GUIDE.md`**: Complete deployment workflows.
- **`CLOUDFLARE_SUPABASE_SETUP.md`**: Webhook and caching strategies.
- **`LESSONS_LEARNED.md`**: Critical debugging logs and infrastructure gotchas.
- **`AGENTS.md` / `gemini.md`**: Strict system rules for AI agents and contributors.

## 🤝 Contributing
All UI changes must use the shared module architecture. No page-specific overrides are allowed. Ensure any new icons are imported via `components/common/Icons.tsx` and all database changes are reflected in `SUPER_MASTER_SCHEMA.sql` before opening a PR.
