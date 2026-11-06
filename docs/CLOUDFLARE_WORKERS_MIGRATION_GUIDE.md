# 🚀 Cloudflare Workers ($5 Paid) Migration Guide
## Zero Vercel Architecture (Permanent Project Plan)

> **Core Objective:** Vercel ka kissa mukammal khatam. Next.js application ko Cloudflare Workers ($5 Paid) par shift karna, database Supabase mein rahegi, aur images Cloudflare R2 mein store hongi.
> **Safety First:** Live Vercel store bilkul untouched rahega jab tak Cloudflare Worker par tamam tests (Checkout, Supabase order save, Admin, Images) 100% pass na ho jayein.

---

## 1. Master Architecture Overview

| Component | Target Location | Description |
|-----------|-----------------|-------------|
| **Next.js Compute (Storefront + Admin)** | **Cloudflare Workers ($5 Paid)** | Global edge execution across 300+ edge locations with 0ms cold starts |
| **Database & Auth** | **Supabase (PostgreSQL + RLS)** | Unchanged. Direct connection pool via Supabase client & service role |
| **Product Images & Media** | **Cloudflare R2 Storage** | High-performance, zero egress fee image bucket (`img.<domain>`) |
| **Page Caching & Edge Shield** | **Cloudflare Edge Cache + R2 Cache** | Instant delivery, zero bandwidth limits, 100k+ visits/day capacity |
| **Vercel** | **NONE (Permanently Removed)** | Disconnected completely once live cutover is confirmed |

---

## 2. The 4 Golden Safety Principles

1. **Zero Downtime Cutover:** Live DNS records and active Vercel deployments remain 100% untouched while Cloudflare Worker is being built and tested.
2. **Preview Verification Gate:** The Cloudflare Worker must pass all 5 verification gates on a staging/preview subdomain before domain pointing:
   - Full storefront SSR browsing & Category filtering
   - Admin login & settings saving
   - Live checkout relational write to Supabase
   - WhatsApp order click & phone redirect
   - Image rendering & optimization
3. **Account Isolation (RULE CRED-ENVBACKUP):** Cloudflare Workers Paid plan is bound to the target store's specific Cloudflare Account (`c218bd...` for TotVogue). Never mix credentials across stores.
4. **Permanent Independence:** With Cloudflare Workers Paid, all Vercel limits (ISR writes, Fluid CPU, Build hours, Fast Origin Transfer) are permanently eradicated.

---

## 3. Migration Roadmap & Execution Steps

### Phase 1: Local Adapter & Configuration Setup
- Install `@opennextjs/cloudflare` and `wrangler` CLI tools.
- Configure `wrangler.jsonc` with the target Cloudflare Account ID and environment bindings.
- Bind Supabase credentials as encrypted Cloudflare Worker secrets.
- Configure Cloudflare R2 bucket for product media storage.

### Phase 2: Local Runtime Testing & Audit
- Build the Next.js app using `@opennextjs/cloudflare`.
- Audit any Node.js native dependencies for Cloudflare V8 compatibility flags (`nodejs_compat`).
- Run local worker simulation using `wrangler dev`.

### Phase 3: Preview Deployment & Staging Smoke Tests
- Deploy the worker to a Cloudflare Workers preview URL (e.g. `https://totvogue-preview.workers.dev`).
- Execute end-to-end checkout test: place a real test order and verify Supabase relational persistence.
- Verify Admin dashboard functionality.

### Phase 4: Production Cutover (`GO CUTOVER`)
- Update Cloudflare DNS routing to bind the custom domain (`totvogue.pk`) directly to the Cloudflare Worker.
- Disconnect domain from Vercel.
- Verify production TTFB, SSL certificate, and instant webhook revalidation.
