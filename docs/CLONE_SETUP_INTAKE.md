# 🧩 CLONE SETUP — Agent Intake Flow (universal, all IDEs/agents)

> **Trigger:** jab user kahe **"clone setup"** / **"/clone setup"** / **"new store setup"** / **"naya clone banao"** — koi bhi coding agent (OpenCode, Cursor, Claude Code, Copilot, etc.) **ye exact flow** follow kare. Ye `scripts/clone-setup.mjs` (One-Command Clone Setup) ka human-facing intake hai.

## STEP 1 — Agent user ko required credentials ki list de (ye table + direct links bhejo)

User ko ye maango, har ek ke **direct link** ke saath. User sab paste kar de to STEP 2.

| # | Credential (env key) | Direct link (yahan se lo) | Permissions / Scope |
|---|----------------------|---------------------------|---------------------|
| 1 | `SUPABASE_MGMT_TOKEN` | https://supabase.com/dashboard/account/tokens → "Generate new token" | Full (project create + SQL) |
| 2 | `SUPABASE_PROJECT_REF` | https://supabase.com/dashboard/project/_/settings/general → **Reference ID** | — |
| 3 | `NEXT_PUBLIC_SUPABASE_URL` | https://supabase.com/dashboard/project/_/settings/api → **Project URL** | — |
| 4 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | https://supabase.com/dashboard/project/_/settings/api → **anon public** | — |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` | https://supabase.com/dashboard/project/_/settings/api → **service_role** (secret) | — |
| 6 | `VERCEL_TOKEN` | https://vercel.com/account/tokens → "Create Token" | **Full Account** (ya team), no expiry |
| 7 | `VERCEL_PROJECT_NAME` | https://vercel.com/dashboard → project → name copy | — |
| 8 | `VERCEL_TEAM_ID` *(sirf team)* | https://vercel.com/account → Team Settings → **Team ID** | — |
| 9 | `GITHUB_USERNAME` + `GITHUB_REPO` | https://github.com → repo owner + repo name | — |
| 10 | `GITHUB_TOKEN` | https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hooks&description=clone-setup (scopes pre-selected) | **`repo`, `workflow`, `admin:repo_hooks`** |
| 11 | `CLOUDFLARE_API_TOKEN` | https://dash.cloudflare.com/profile/api-tokens → "Create Custom Token" | **Zone:Edit, DNS:Edit, Cache Rules:Edit, Zone Settings:Edit, Cache Purge:Purge, Analytics:Read** → Zone Resources: **All zones** |
| 12 | `CLOUDFLARE_ZONE_ID` | https://dash.cloudflare.com → domain → **Overview** (right sidebar) → Zone ID | — |
| 13 | `CF_ACCOUNT_ID` | https://dash.cloudflare.com → domain → **Overview** (right sidebar) → Account ID | — |
| 14 | `NEXT_PUBLIC_SITE_URL` | Final site URL, e.g. `https://www.yourstore.pk` (koi redirect nahi) | — |
| 15 | `NEXT_PUBLIC_BRAND_NAME` | Store brand name, e.g. `Yourstore.pk` | — |
| 16 | `NEXT_PUBLIC_ADMIN_EMAIL` | Admin login email(s), comma-separated | — |
| 17 | `REVALIDATE_SECRET` | Koi bhi strong string (sab stores ek jaisa chalega) | — |
| — | *(optional)* `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey → "Create API key" | AI listings/SEO automation |
| — | *(optional)* `GOOGLE_SITE_VERIFICATION` | https://search.google.com/search-console → property → HTML tag | SEO |
| — | *(optional)* `NEXT_PUBLIC_META_PIXEL_ID`, `META_*` | https://business.facebook.com/events_manager | Pixel/catalog |

> **Links note:** Supabase ke `/project/_/...` links me `_` khud-ba-khud selected project pe resolve ho jaata hai (pehle us project ko dashboard me open/select kar lo). GitHub link scopes pre-ticked aata hai — bas "Generate token" dabao.


> **Non-API prerequisites (user khud karega):** (a) Supabase/Vercel/Cloudflare accounts + domain banwana (billing), (b) domain Cloudflare pe add karke uske **nameservers registrar (PKNIC for .pk) par Cloudflare NS** pe point karna. In ke baghair baqi sab agent karega.

## STEP 2 — Agent env file banaye
Jab user saari values de de, agent `env-backups/<store>.env.local` likhe (same keys), aur confirm kare ke required 12 keys (table #1–7, 11–12, 14–15, 17) maujood hain. `.env.example` canonical key list hai.

## STEP 3 — Agent setup chalaye (ek command)
```bash
npm run clone:setup -- --store=<store> --deploy --yes
```
Ye idempotent orchestrator chalata hai: preflight → db:schema → db:webhooks → db:admin → db:brand → vercel (env+deploy) → cf:dns → cf:rules → verify.

## STEP 4 — Agent user ko bataye
- Agar `clone:setup` ne Cloudflare zone **pending** dikhaya → user ko nameservers registrar par switch karne ko kahe (agent ne NS values output ki hongi).
- Tab tak test URL: `https://<VERCEL_PROJECT_NAME>.vercel.app`.
- NS propagate hote hi custom domain live.

## Rules agent ke liye
- Secrets kabhi chat/logs/commit me plaintext mat chhodo (sirf `env-backups/` me, jo `.gitignore` me hai).
- Already-live store par `--skip-db` do (warna `db:brand` brand text overwrite kar dega).
- Fresh clone ke baad `npm run check:setup` green hona chahiye (RULE SYNC1).
