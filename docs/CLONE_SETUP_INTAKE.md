# 🧩 CLONE SETUP — Agent Intake Flow (Universal Standards)

> **Trigger:** Jab bhi user kahe **"clone setup"** / **"/clone setup"** / **"new store setup"** / **"naya clone banao"** — koi bhi coding agent (Antigravity, Cursor, Claude Code, Copilot, etc.) **ye exact flow** follow kare.

---

## 🛑 STEP 0 — MANDATORY FIRST STEP (Poocho Kahan Aur Kaise Setup Karna Hai)

Agent foran setup shuru nahi karega, balki **pehle user se poochega**:

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

---

## STEP 1 — Required Credentials Intake

User ke response ke mutabiq credentials table bhejo direct links ke saath:

### Required for Option A (Cloudflare Workers $5 Paid — Zero Vercel):
| # | Credential (env key) | Direct Link | Permissions / Scope |
|---|----------------------|-------------|---------------------|
| 1 | `SUPABASE_MGMT_TOKEN` | https://supabase.com/dashboard/account/tokens | Full (project create + SQL) |
| 2 | `SUPABASE_PROJECT_REF` | https://supabase.com/dashboard/project/_/settings/general | Reference ID |
| 3 | `NEXT_PUBLIC_SUPABASE_URL` | https://supabase.com/dashboard/project/_/settings/api | Project URL |
| 4 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | https://supabase.com/dashboard/project/_/settings/api | anon public |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` | https://supabase.com/dashboard/project/_/settings/api | service_role (secret) |
| 6 | `CLOUDFLARE_API_TOKEN` | https://dash.cloudflare.com/profile/api-tokens | **Workers:Edit, R2:Edit, Zone:Edit, DNS:Edit, Cache:Edit** |
| 7 | `CLOUDFLARE_ZONE_ID` | https://dash.cloudflare.com → domain → Overview | Zone ID |
| 8 | `CF_ACCOUNT_ID` | https://dash.cloudflare.com → domain → Overview | Account ID |
| 9 | `GITHUB_USERNAME` + `GITHUB_REPO` | https://github.com | Repo owner + repo name |
| 10 | `GITHUB_TOKEN` | https://github.com/settings/tokens/new | `repo`, `workflow` |
| 11 | `NEXT_PUBLIC_SITE_URL` | e.g. `https://www.<domain>.pk` | Final canonical URL |
| 12 | `NEXT_PUBLIC_BRAND_NAME` | e.g. `<BrandName>.pk` | Brand name |
| 13 | `NEXT_PUBLIC_ADMIN_EMAIL` | Admin login email(s) | Comma-separated |
| 14 | `REVALIDATE_SECRET` | Strong secret string | Shared across clones |

*(Note: Option A mein Vercel tokens ki koi zaroorat nahi hai).*

### Additional for Option B (Vercel Legacy):
- `VERCEL_TOKEN`, `VERCEL_PROJECT_NAME`, `VERCEL_TEAM_ID` (from https://vercel.com/account/tokens).

---

## STEP 2 — Agent Env Backup File Banaye

User ki di hui values se `env-backups/<store>.env.local` create karo aur verify karo ke required keys mojud hain.

---

## STEP 3 — Setup Command Execute Karo (1-Command Orchestrator)

### For Option A (Cloudflare Workers $5 Paid):
```bash
# 1. DB Schema + Triggers + Admin + Brand setup
npm run clone:setup -- --store=<store> --skip-vercel --yes

# 2. Deploy Cloudflare Worker & Cache Shield
node scripts/stores-bulk-ops.mjs sync-cf
```

### For Option B (Legacy Vercel):
```bash
npm run clone:setup -- --store=<store> --deploy --yes
```

---

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
