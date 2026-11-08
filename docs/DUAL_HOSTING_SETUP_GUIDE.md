۱     ٍ# Dual-Hosting & Deployment Architecture Guide
## Vercel Free (Zero Cost) & Cloudflare Workers Paid ($5/mo) Scale-Up

This project is built on a **Universal Codebase** — the exact same code runs on both:
1. **Vercel + Supabase (100% Free)**: For new stores, test clones, and low-traffic pilots ($0/month).
2. **Cloudflare Workers + Cloudflare R2 ($5/mo)**: For high-traffic stores, unlimited image egress, and edge speed ($5/month per account).

---

## 🧭 Strategy: Start Free, Upgrade at Scale

```
┌────────────────────────────────────────────────────────┐
│  Phase 1: Zero-Cost Pilot (100% Free)                  │
│  - Hosting: Vercel Free (Hobby)                       │
│  - Database: Supabase Free Tier                       │
│  - Images: Supabase Storage / Cloudflare Free CDN     │
│  - Monthly Cost: $0.00 / month                        │
└──────────────────────────┬─────────────────────────────┘
                           │ (Traffic > 10k or Sales Scaling)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 2: Scale-Up to Edge ($5/month Total)           │
│  - Hosting: Cloudflare Workers Paid ($5/mo per acct)  │
│  - Incremental Cache: Cloudflare R2 (Free 10GB)       │
│  - Images: Cloudflare R2 (Free egress, fast edge)     │
│  - Database: Supabase (DB + Auth only, zero egress)   │
│  - Monthly Cost: $5.00 / month (covers ALL stores)    │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 PATH A: Launching a New Store on Vercel (100% FREE)

Use this path whenever you want to test a new niche, launch a client store, or run a pilot with **zero upfront cost**.

### Step 1: Create Store Credentials (`env-backups/<store>.env.local`)
Create `env-backups/<store>.env.local` with the store's tokens:
* Supabase URL & Anon Key (Free project)
* Vercel Project Token (Free Hobby account)
* Cloudflare Zone ID & Token (Free DNS)

### Step 2: One-Command Automated Setup
Run the battle-tested setup orchestrator:
```bash
npm run clone:setup -- --store=<store> --deploy --yes
```
This runs:
1. **Preflight**: Validates tokens, IDs, and required keys.
2. **Database**: Applies master schema (`SUPER_MASTER_SCHEMA.sql`), webhook triggers, and admin account.
3. **Vercel Deploy**: Sets up environment variables on Vercel and triggers production build.
4. **Cloudflare DNS & Cache**: Sets up proxied DNS and edge caching rules.

**Result**: Complete, functional e-commerce store live in ~2 minutes at $0/month cost.

---

## ⚡ PATH B: Scaling Up to Cloudflare Workers ($5/mo)

When the store grows and you want to eliminate Supabase storage limits and Vercel compute limits:

### Step 1: Migrate Images to Cloudflare R2
Cloudflare R2 provides 10 GB free storage and **free outbound data transfer (zero egress fees)**.
```bash
# 1. Audit & dry-run
node scripts/r2-migrate-images.mjs --env=.env.local --dry-run

# 2. Copy all images from Supabase to R2 (idempotent, batch copy)
node scripts/r2-migrate-images.mjs --env=.env.local --apply

# 3. Enable R2 in .env.local:
# R2_PUBLIC_BASE=https://img.<your-domain>.pk
# R2_UPLOAD_ENABLED=true
```

### Step 2: Build Cloudflare Worker
The build converts the Next.js App Router into an edge-optimized Cloudflare Worker bundle with R2 incremental cache and Durable Object tag caching:
```bash
# 1. Generate brand wrangler config
node scripts/gen-worker-config.mjs --env=.env.local

# 2. Build OpenNext bundle
npx opennextjs-cloudflare build
```

### Step 3: Test on `workers.dev` (Safe Staging)
Deploy to your free `workers.dev` subdomain first without affecting live DNS:
```bash
# Deploy to workers.dev
npx wrangler deploy --config worker-config/<store>/wrangler.test.jsonc

# Upload runtime secrets (Supabase keys, R2 keys, tokens)
npx wrangler secret bulk /tmp/secrets.json --config worker-config/<store>/wrangler.test.jsonc
```
Verify the store at `https://<store>.<account>.workers.dev`:
* Home: `HTTP/2 200`
* Catalog: `HTTP/2 200`
* Admin login: `HTTP/2 200`
* R2 cache: `x-nextjs-cache: HIT`

---

## 🔄 PATH C: Live Domain Cutover (Vercel ➔ Cloudflare)

Once your Worker is tested on `workers.dev`, cut over the live domain:

### Option 1 (Worker Routes — Instant Edge Interception — What Was Executed For TotVogue)
The safest, fastest cutover method that requires **zero DNS deletion**:
1. Worker Routes are added on the Cloudflare zone (`totvogue.pk/*`, `www.totvogue.pk/*`, `admin.totvogue.pk/*`) bound to Worker script `totvogue`.
2. Cloudflare Edge intercepts requests matching those domains at the edge and executes the Worker. Vercel origin is never contacted.
3. If rollback is needed, simply remove the route and Vercel takes over instantly in 1 second.

### Option 2 (1-Click Cloudflare Dashboard Custom Domain)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Open **Workers & Pages** ➔ Click your worker (`<store>`)
3. Click **Settings** (or **Triggers**) ➔ **Domains & Routes**
4. Click **Add Custom Domain**:
   * Add `@` (`yourdomain.pk`)
   * Add `www` (`www.yourdomain.pk`)
   * Add `admin` (`admin.yourdomain.pk`)
5. When Cloudflare warns: *"An existing DNS record was found. Overwrite?"* ➔ Click **Overwrite / Confirm**.

---

## 🧹 How Cache Purging & Revalidation Works (Deep-Dive)

Our system uses **Targeted Purging (RULE C9 & C10)** — not a brute-force `purge_everything`:

| Admin Action | Purge Level | What Gets Purged | What Stays in Cache |
|---|---|---|---|
| **Product Edit** (Price, title, stock) | **Targeted** | Next.js tag `product-[slug]`, `/product/[slug]`, and homepage tag. Cloudflare edge purges ONLY `https://<domain>/product/<slug>`. | All other products, categories, reviews remain cached. |
| **Category Edit** | **Targeted** | `/shop/[category]`, `/shop` tag, and homepage category section. | Other categories & product detail pages stay cached. |
| **Store Settings Edit** (Phone, Announcement banner, Logo) | **Zone-Wide** | Store settings affects the layout header/footer of every page, so `purgeCloudflareEverything()` is triggered. | Nothing (refreshes all pages within ~1s). |
| **Admin Manual "Purge Cache" Button** | **Zone-Wide** | Calls Cloudflare API `/zones/:zone_id/purge_cache` with `purge_everything: true`. | Fresh pull from origin on next request. |

**Purge Health Check:**
* The Cloudflare API purge endpoint has been verified live: `{"success": true}`.
* Revalidate Webhook `/api/revalidate` has been verified live: `{"revalidated": true}`.

---

## 🔑 Required Credentials Intake Table (Where to get what)

When preparing a new store for Cloudflare Workers ($5 Scale-Up):

| Key Name | Where to Get in Cloudflare Dashboard | Required Permissions |
|---|---|---|
| `CF_ACCOUNT_ID` | Right-side of **Workers & Pages** overview | — |
| `CLOUDFLARE_ZONE_ID` | Domain Overview ➔ Right sidebar bottom | — |
| `CLOUDFLARE_API_TOKEN` | Profile ➔ **API Tokens** ➔ Create Custom Token | `Workers Scripts: Edit`, `Workers Routes: Edit`, `Workers R2 Storage: Edit`, `Cache Purge: Purge`, `Account Settings: Read` |
| `R2_ACCOUNT_ID` | Cloudflare Dashboard ➔ **R2** (Same as Account ID) | — |
| `R2_ACCESS_KEY_ID` | R2 ➔ **Manage R2 API Tokens** ➔ Create API Token | Object Read & Write |
| `R2_SECRET_ACCESS_KEY` | Same modal when generating R2 token | Copy secret immediately |
| `CF_WORKER_SUBDOMAIN` | Workers & Pages ➔ Account details ➔ Subdomain | `<account>.workers.dev` |

---

## ⏪ Rollback Plan (< 2 Minutes)

If you ever need to revert a store back to Vercel:
1. **If using Worker Routes:** Delete the 3 worker routes via Cloudflare API or Dashboard. Vercel resumes handling traffic instantly.
2. **If using Custom Domains:** In Cloudflare Dashboard ➔ **Workers & Pages** ➔ Your Worker ➔ **Domains & Routes** ➔ Remove the Custom Domains.
3. In Cloudflare **DNS**:
   * Add `A` record: `@` ➔ `76.76.21.21` (Proxied ☁️)
   * Add `CNAME` record: `www` ➔ `cname.vercel-dns.com` (Proxied ☁️)
4. Site is back on Vercel immediately. Zero data loss.

