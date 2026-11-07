# 🚀 Cloudflare Workers ($5 Paid) Migration Guide
## Zero Vercel Architecture (Permanent Project Plan)

> **Core Objective:** Vercel ka kissa mukammal khatam. Next.js compute Cloudflare Workers ($5 Paid) par, Supabase strictly ONLY Auth + Database, images Cloudflare R2 mein, aur database webhooks direct Cloudflare Worker par.
> **Safety First:** Live Vercel store bilkul untouched rahega jab tak Cloudflare Worker par tamam tests (Checkout, Supabase order save, Admin, Images) 100% pass na ho jayein.
> **Universal Guide Rule (RULE 18):** Never hardcode domain names in guides or rule docs. Always use `<domain>`, `<domain>.pk`, `img.<domain>`, and `<store>`.

---

## 1. Master Architecture Overview (Post-$5 Cutover)

| Component | Target Location | Description |
|-----------|-----------------|-------------|
| **Next.js Compute (Store + Admin)** | **Cloudflare Workers ($5 Paid)** | Global edge execution across 300+ locations with 0ms cold starts |
| **Database & Auth** | **Supabase (PostgreSQL + RLS ONLY)** | Dedicated strictly to relational DB queries and authentication. Storage eliminated. |
| **Product Images & Media** | **Cloudflare R2 Storage (`img.<domain>`)** | Zero egress fees, unlimited capacity, high-speed CDN delivery. |
| **Edge Cache & Shield** | **Cloudflare Edge Cache + R2 Cache** | Instant delivery, zero bandwidth limits, 100k+ visits/day capacity. |
| **Database Webhooks** | **Direct to Cloudflare Worker** | Supabase DB triggers ping `https://<domain>/api/revalidate` directly. |
| **Vercel** | **NONE (Permanently Removed)** | Disconnected completely once live cutover is confirmed. |

---

## 2. The 5 Golden Safety Principles

1. **Zero Downtime Cutover:** Live DNS records and active deployments remain 100% untouched while Cloudflare Worker is being configured and tested.
2. **Preview Verification Gate:** The Cloudflare Worker must pass all 5 verification gates on a staging/preview subdomain before domain pointing:
   - Full storefront SSR browsing & Category filtering
   - Admin login & settings saving
   - Live checkout relational write to Supabase
   - WhatsApp order click & phone redirect
   - Image rendering & optimization from R2
3. **Account Isolation (RULE CRED-ENVBACKUP):** Cloudflare Workers Paid plan is bound to each store's specific Cloudflare Account from `env-backups/<store>.env.local`. Never mix credentials across stores.
4. **Supabase Scope Restriction:** Once on Workers Paid, Supabase is strictly for PostgreSQL Database & Auth. Media storage belongs in Cloudflare R2 to eliminate Supabase storage quotas and bandwidth limits.
5. **Universal Domain Standard:** All documentation, guides, and configs must use universal placeholders (`<domain>`, `<domain>.pk`, `img.<domain>`). Zero hardcoded domains.

---

## 3. Migration Roadmap & Execution Steps

### Phase 1: Local Adapter & Configuration Setup
- Configure `wrangler.jsonc` with the target Cloudflare Account ID and environment bindings for `<store>`.
- Bind Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) as encrypted Cloudflare Worker secrets.
- Provision Cloudflare R2 bucket (`<store>-media`) bound to custom subdomain `img.<domain>`.

### Phase 2: Local Runtime Testing & Audit
- Build the Next.js app using `@opennextjs/cloudflare`.
- Audit any Node.js native dependencies for Cloudflare V8 compatibility flags (`nodejs_compat`).
- Run local worker simulation using `wrangler dev`.

### Phase 3: Preview Deployment & Staging Smoke Tests
- Deploy the worker to a Cloudflare Workers preview URL (e.g. `https://<store>-preview.workers.dev`).
- Execute end-to-end checkout test: place a real test order and verify Supabase relational persistence.
- Verify Admin dashboard functionality.

### Phase 4: Production Cutover (`GO CUTOVER`)
- Update Cloudflare DNS routing to bind the custom domain (`<domain>`) and `www.<domain>` directly to the Cloudflare Worker.
- Disconnect domain from Vercel.
- Verify production TTFB, SSL certificate, and instant webhook revalidation direct from Supabase to `https://<domain>/api/revalidate`.
