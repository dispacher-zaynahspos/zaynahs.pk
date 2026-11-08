# 🧩 CLONE SETUP — Agent Intake Flow (Universal Standards)

> **Trigger:** Jab bhi user kahe **"clone setup"** / **"/clone setup"** / **"new store setup"** / **"naya clone banao"** — koi bhi coding agent (Antigravity, Cursor, Claude Code, Copilot, etc.) **ye exact flow** follow kare.

## STEP 0 — Target Architecture Confirmation
Agent pehle user se poochhe ya verify kare:
1. **Path A (Cloudflare Workers $5 Paid Plan — Primary / Modern)**:
   - Compute: 100% Cloudflare Workers (0% Vercel).
   - Storage: 100% Cloudflare R2 (`img.<domain>`), Supabase Storage is 0% (banned).
   - DB & Auth: Supabase only.
   - Vercel tokens (#6–8) NOT needed!
2. **Path B (Legacy Vercel Free Mode)**:
   - Compute: Vercel Serverless.
   - Storage: Supabase Storage bucket `product-images`.
   - Vercel tokens (#6–8) required.

## STEP 1 — Agent user ko required credentials ki list de (ye table + direct links bhejo)

## 🛑 STEP 0 — MANDATORY FIRST STEP (Poocho Kahan Aur Kaise Setup Karna Hai)

| # | Credential (env key) | Direct link (yahan se lo) | Permissions / Scope | Notes |
|---|----------------------|---------------------------|---------------------|-------|
| 1 | `SUPABASE_MGMT_TOKEN` | https://supabase.com/dashboard/account/tokens → "Generate new token" | Full (project create + SQL) | Both Paths |
| 2 | `SUPABASE_PROJECT_REF` | https://supabase.com/dashboard/project/_/settings/general → **Reference ID** | — | Both Paths |
| 3 | `NEXT_PUBLIC_SUPABASE_URL` | https://supabase.com/dashboard/project/_/settings/api → **Project URL** | — | Both Paths |
| 4 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | https://supabase.com/dashboard/project/_/settings/api → **anon public** | — | Both Paths |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` | https://supabase.com/dashboard/project/_/settings/api → **service_role** (secret) | — | Both Paths |
| 6 | `VERCEL_TOKEN` | https://vercel.com/account/tokens → "Create Token" | **Full Account** (ya team), no expiry | **Path B only** |
| 7 | `VERCEL_PROJECT_NAME` | https://vercel.com/dashboard → project → name copy | — | **Path B only** |
| 8 | `VERCEL_TEAM_ID` *(sirf team)* | https://vercel.com/account → Team Settings → **Team ID** | — | **Path B only** |
| 9 | `GITHUB_USERNAME` + `GITHUB_REPO` | https://github.com → repo owner + repo name | — | Both Paths |
| 10 | `GITHUB_TOKEN` | https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hooks&description=clone-setup (scopes pre-selected) | **`repo`, `workflow`, `admin:repo_hooks`** | Both Paths |
| 11 | `CLOUDFLARE_API_TOKEN` | https://dash.cloudflare.com/profile/api-tokens → "Create Custom Token" | **Zone:Edit, DNS:Edit, Cache Rules:Edit, Zone Settings:Edit, Cache Purge:Purge, Analytics:Read, Workers R2:Edit** → Zone Resources: **All zones** | Both Paths |
| 12 | `CLOUDFLARE_ZONE_ID` | https://dash.cloudflare.com → domain → **Overview** (right sidebar) → Zone ID | — | Both Paths |
| 13 | `CF_ACCOUNT_ID` | https://dash.cloudflare.com → domain → **Overview** (right sidebar) → Account ID | — | Both Paths |
| 14 | `NEXT_PUBLIC_SITE_URL` | Final site URL, e.g. `https://www.yourstore.pk` (koi redirect nahi) | — | Both Paths |
| 15 | `NEXT_PUBLIC_BRAND_NAME` | Store brand name, e.g. `Yourstore.pk` | — | Both Paths |
| 16 | `NEXT_PUBLIC_ADMIN_EMAIL` | Admin login email(s), comma-separated | — | Both Paths |
| 17 | `REVALIDATE_SECRET` | Koi bhi strong string (sab stores ek jaisa chalega) | — | Both Paths |
| 18 | `R2_ACCESS_KEY_ID` | Cloudflare Dashboard → R2 Overview → **Manage R2 API Tokens** | Admin Read & Write | **Path A only** |
| 19 | `R2_SECRET_ACCESS_KEY` | Cloudflare Dashboard → R2 Overview → **Manage R2 API Tokens** | Secret Key | **Path A only** |
| 20 | `R2_IMAGES_BUCKET` | E.g. `<store>-images` (pre-created or auto-created in R2) | Bucket name | **Path A only** |
| 21 | `R2_PUBLIC_BASE` | E.g. `https://img.yourstore.pk` (R2 custom domain) | Public Edge URL | **Path A only** |
| 22 | `R2_UPLOAD_ENABLED` | `true` | Activates direct R2 pipeline | **Path A only** |
| — | *(optional)* `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey → "Create API key" | AI listings/SEO automation | Optional |
| — | *(optional)* `GOOGLE_SITE_VERIFICATION` | https://search.google.com/search-console → property → HTML tag | SEO | Optional |
| — | *(optional)* `NEXT_PUBLIC_META_PIXEL_ID`, `META_*` | https://business.facebook.com/events_manager | Pixel/catalog | Optional |

1. **Store & Domain Name:**
   - *"Kis store aur domain ke liye clone setup karna hai?"* (e.g. `<store>`, `<domain>.pk`)
2. **Architecture Target:**
   - **Option A (Standard & Recommended):** **Cloudflare Workers ($5 Paid) — Zero Vercel**
     - Compute: Cloudflare Workers (300+ edge nodes, 0ms cold start)
     - Database & Auth: Supabase (PostgreSQL + RLS ONLY)
     - Media / Images: Cloudflare R2 (`img.<domain>`) — Supabase Storage phased out (0 egress fees)
     - Webhooks: Supabase triggers direct to `https://<domain>/api/revalidate`
     - Vercel: 0% / Disconnected
   - **Option B (Legacy):** **Vercel + Supabase** (Agar user explicitly Vercel chahe)

> **Non-API prerequisites (user khud karega):** (a) Supabase/Cloudflare accounts + domain banwana (billing), (b) domain Cloudflare pe add karke uske **nameservers registrar (PKNIC for .pk) par Cloudflare NS** pe point karna. In ke baghair baqi sab agent karega.

## STEP 2 — Agent env file banaye
Jab user saari values de de, agent `env-backups/<store>.env.local` likhe (same keys).

## STEP 3 — Agent setup chalaye (1 Command)

### Path A (S5 Cloudflare Workers Paid Plan — Recommended):
```bash
# 1. Orchestrate DB schema, webhooks, admin user, brand settings & Cloudflare DNS/Rules:
npm run clone:setup -- --store=<store> --skip-vercel --yes

# 2. Build & Deploy Cloudflare Worker:
npm run worker:build
npx wrangler deploy --config worker-config/<store>/wrangler.jsonc
```

### Path B (Legacy Vercel Free Mode):
```bash
npm run clone:setup -- --store=<store> --deploy --yes
```

## STEP 4 — Agent user ko bataye
- Agar `clone:setup` ne Cloudflare zone **pending** dikhaya → user ko nameservers registrar par switch karne ko kahe (agent ne NS values output ki hongi).
- NS propagate hote hi custom domain live.

## STEP 4 — Post-Setup Health Sweep (MANDATORY)

Setup tabhi complete maana jayega jab ye 4 checks green hon:

1. **Edge Cache / Worker Status:**
   ```bash
   curl -sI "https://www.<domain>/" | grep -i "server\|x-opennext\|cache"
   # Must return HTTP 200 OK
   ```
2. **Revalidation Webhook Check:**
   ```bash
   curl -X POST "https://www.<domain>/api/revalidate" \
     -H "Content-Type: application/json" \
     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
     -d '{"type":"UPDATE","table":"store_settings","record":{}}'
   # Expected: {"revalidated":true,"table":"store_settings","type":"UPDATE"}
   ```
3. **Database Relational Orders Check:**
   `scripts/verify-store-network.mjs` chala kar real relational checkout verify karo.
4. **Setup Sync Verification:**
   ```bash
   npm run check:setup && npx tsc --noEmit
   ```
