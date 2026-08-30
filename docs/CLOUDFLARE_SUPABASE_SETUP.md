# 🚀 Cloudflare + Supabase + Vercel Setup — Complete Multi-Store Guide
> **MANDATORY READ** for all agents and developers before touching any caching, webhooks, or token configuration.
> Last updated: 2026-08-11 (Added RULE VERCEL1, multi-store purge system)

---

## ⚠️ ABSOLUTE RULES — ALL CURRENT AND FUTURE PROJECTS
- **Code** = Universal (same for all stores, no hardcoded brand/domain)
- **Credentials** = 100% Separate per store (never share tokens)
- **Vercel ISR + Cloudflare BOTH** must be purged after every deploy

---

## 📋 ALL PROJECTS — Quick Reference

| Project | Supabase Ref | CF Zone ID | CF Account ID | Vercel Project | Site URL |
|---------|-------------|------------|---------------|----------------|----------|
| **TotVogue** | `ziucrfpebpxijqhwmqre` | `e4aceeacdc4f6a1677e92823df1651fd` | `c218bd7557331b8360d7085105b732b2` | `zaynahsestore-tv` | `www.totvogue.pk` |
| **Zaynahs** | `unfdpfmjqljbjydgsccr` | `10d964449186f64d7896f8dcac4e5eff` | `37b6f57e13fe9466342b453d3a3ed4af` | `zaynahsestore-tv-main` | `www.zaynahs.pk` |
| **MiniMahal** | `mgwkcumurrllhpjvfezz` | `6acd493022cd0f2d5a9c290088b5327a` | `7bb146345ffcc335d3435eda7bf7592d` | `mini-mahal-e-store` | `www.minimahal.com` |
| **LittleMister** | `ljknmwianiswkalifueb` | `063a3d5c72d44b3654aa60b17ed94863` | `597d5f9b660750e13c2f68b3748eef22` | `eestore` | `www.littlemister.pk` |

**REVALIDATE_SECRET (all projects — universal):** `zaynahs_secret_cache_revalidate_2026`

---

## ✅ ONE-COMMAND FULL AUDIT (Run After Every Deploy)

```bash
node scripts/post-deploy-fix.mjs
```

**Expected output (ALL CHECKS PASSED):**
```
[1/4] Vercel cache purge: OK             ← Must NOT be "SKIPPED"
[2/4] Cloudflare purge (4 zones):
  https://www.totvogue.pk: OK ✅
  https://www.littlemister.pk/: OK ✅
  https://www.minimahal.com: OK ✅
  https://www.zaynahs.pk: OK ✅
[3/4] 200 / OK
[3/4] 200 /shop OK
[3/4] 200 /reviews OK
[4/4] Webhook: OK (revalidated:true)
✅ ALL CHECKS PASSED — setup is clean.
```

**🚨 RULE VERCEL1 — If [1/4] shows SKIPPED:**
```bash
# Add missing VERCEL_PROJECT_NAME to env-backups files:
grep "VERCEL_PROJECT_NAME" env-backups/*.env.local   # Check which are missing
echo "VERCEL_PROJECT_NAME=<project-name>" >> env-backups/<store>.env.local
```

---


## 🔑 SECTION 1: Cloudflare API Tokens — COMPLETE GUIDE

### ❌ CRITICAL: Token Type Confusion (Most Common Bug)

Cloudflare has TWO different types of keys — agents/devs often confuse them:

| Type | Format | Auth Method | Works for Cache Purge? |
|------|--------|-------------|------------------------|
| **Global API Key** | `cfk_XXXXXXXX` | `X-Auth-Email` + `X-Auth-Key` headers | ❌ **NO** — wrong auth method |
| **API Token** | `cfut_XXXXXXXX` | `Authorization: Bearer TOKEN` | ✅ **YES** |

> **Rule:** `CLOUDFLARE_API_TOKEN` in env files MUST always be `cfut_` format.
> If you see `cfk_` in env → it will SILENTLY FAIL on cache purge. Always fix immediately.

---

### 1A. Creating New API Token — Via Cloudflare Dashboard

1. Go to: **https://dash.cloudflare.com/profile/api-tokens**
2. Click **"Create Token"** (top section — NOT "API Keys" at bottom)
3. Select **"Create Custom Token"**
4. Fill in:
   - Token name: `projectname-cache-purge`
   - Permissions: `Zone → Cache Purge → Purge`
   - Zone Resources: `Include → Specific zone → yourdomain.com`
5. Continue → Create Token → **Copy the `cfut_XXXX` token**

---

### 1B. Creating New API Token — Via API (Agent Method — PREFERRED)

If you have the Global API Key (`cfk_`) + email, you can create a proper `cfut_` token via API:

```bash
# Step 1: Test Global API Key works (X-Auth-Email + X-Auth-Key)
curl -s "https://api.cloudflare.com/client/v4/user" \
  -H "X-Auth-Email: ACCOUNT_EMAIL" \
  -H "X-Auth-Key: cfk_XXXXXXXX"
# Expect: {"success": true, "result": {"email": "..."}}

# Step 2: Get Cache Purge permission group ID
curl -s "https://api.cloudflare.com/client/v4/user/tokens/permission_groups" \
  -H "X-Auth-Email: ACCOUNT_EMAIL" \
  -H "X-Auth-Key: cfk_XXXXXXXX" | python3 -c "
import sys,json; d=json.load(sys.stdin)
for g in d.get('result',[]):
  if 'cache' in g.get('name','').lower() or 'purge' in g.get('name','').lower():
    print(g['id'], g['name'])
"
# Cache Purge ID: e17beae8b8cb423a99b1730f21238bed

# Step 3: Create new API Token with all needed permissions
curl -s -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "X-Auth-Email: ACCOUNT_EMAIL" \
  -H "X-Auth-Key: cfk_XXXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "projectname-all-permissions-auto",
    "policies": [{
      "effect": "allow",
      "resources": {
        "com.cloudflare.api.account.zone.ZONE_ID": "*"
      },
      "permission_groups": [
        {"id": "e17beae8b8cb423a99b1730f21238bed"},
        {"id": "c8fed203ed3043cba015a93ad1616f1f"},
        {"id": "e6d2666161e84845a636613608cee8d5"},
        {"id": "517b21aee92c4d89936c976ba6e4be55"},
        {"id": "3030687196b94b638145a3953da2b699"},
        {"id": "9ff81cbbe65c400b97d92c3c1033cab6"},
        {"id": "3245da1cf36c45c3847bb9b483c62f97"},
        {"id": "dbc512b354774852af2b5a5f4ba3d470"},
        {"id": "fb6778dc191143babbfaa57993f1d275"},
        {"id": "7b7216b327b04b8fbc8f524e1f9b7531"},
        {"id": "c03055bc037c4ea9afb9a9f104b7b721"}
      ]
    }],
    "not_before": "2026-01-01T00:00:00Z",
    "expires_on": "2030-12-31T00:00:00Z"
  }'
# Result: {"success": true, "result": {"value": "cfut_XXXXXXXXXX", "id": "...", "status": "active"}}
```

> **Permission IDs Reference (2026):**
> | Permission | ID |
> |-----------|-----|
> | Cache Purge | `e17beae8b8cb423a99b1730f21238bed` |
> | Cache Settings Read | `3245da1cf36c45c3847bb9b483c62f97` |
> | Cache Settings Write | `9ff81cbbe65c400b97d92c3c1033cab6` |
> | Zone Read | `c8fed203ed3043cba015a93ad1616f1f` |
> | Zone Write | `e6d2666161e84845a636613608cee8d5` |
> | Zone Settings Read | `517b21aee92c4d89936c976ba6e4be55` |
> | Zone Settings Write | `3030687196b94b638145a3953da2b699` |
> | Zone WAF Read | `dbc512b354774852af2b5a5f4ba3d470` |
> | Zone WAF Write | `fb6778dc191143babbfaa57993f1d275` |
> | SSL & Certs Read | `7b7216b327b04b8fbc8f524e1f9b7531` |
> | SSL & Certs Write | `c03055bc037c4ea9afb9a9f104b7b721` |

---

### 1C. Verify Token is Valid

```bash
curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer cfut_XXXXXXXXXX"
# Expect: {"result":{"status":"active"},"success":true}
```

---

### 1D. Update Token if It Has Missing Permissions

```bash
# Get token ID first
curl -s "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "X-Auth-Email: EMAIL" \
  -H "X-Auth-Key: cfk_XXXXXX" | python3 -c "
import sys,json; d=json.load(sys.stdin)
for t in d.get('result',[]): print(t['id'], t['name'], t['status'])
"

# Update existing token to add Cache Purge
curl -s -X PUT "https://api.cloudflare.com/client/v4/user/tokens/TOKEN_ID" \
  -H "X-Auth-Email: EMAIL" \
  -H "X-Auth-Key: cfk_XXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"name":"token-name","status":"active","policies":[{"effect":"allow","resources":{"com.cloudflare.api.account.zone.ZONE_ID":"*"},"permission_groups":[{"id":"e17beae8b8cb423a99b1730f21238bed"},{"id":"c8fed203ed3043cba015a93ad1616f1f"},{"id":"e6d2666161e84845a636613608cee8d5"}]}]}'
```

---

### 1E. Update Token in Vercel via API

```bash
VERCEL_TOKEN="vcp_XXXXXXXX"
PROJECT_ID="prj_XXXXXXXX"

# Step 1: Find env var ID
curl -s "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import sys,json; d=json.load(sys.stdin)
for e in d.get('envs',[]):
  if 'CLOUDFLARE' in e.get('key',''):
    print(e['id'], e['key'])
"

# Step 2: Update env var (production+preview only — sensitive vars can't include development)
curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID/env/ENV_VAR_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"cfut_NEW_TOKEN","target":["production","preview"]}'

# Step 3: Trigger redeploy
LATEST_DEPLOY=$(curl -s "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1&target=production" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['uid'])")

curl -s -X POST "https://api.vercel.com/v13/deployments?forceNew=1&withCache=0" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"deploymentId\":\"$LATEST_DEPLOY\",\"name\":\"PROJECT_NAME\",\"target\":\"production\",\"source\":\"api-trigger-git-deploy\"}"
```

---

### 1F. Update env-backups After Any Token Change

```bash
# Always update env-backups/ after changing tokens
sed -i '' 's|CLOUDFLARE_API_TOKEN=OLD_TOKEN|CLOUDFLARE_API_TOKEN=NEW_TOKEN|g' \
  env-backups/totvogue.env.local

# Also update VERCEL_TOKEN if changed
sed -i '' 's|VERCEL_TOKEN=OLD_TOKEN|VERCEL_TOKEN=NEW_TOKEN|g' \
  env-backups/totvogue.env.local
```

---

## 🎣 SECTION 2: Supabase Database Webhook Triggers

### How It Works

```
Admin changes product in database
    ↓
Supabase trigger fires (AFTER INSERT/UPDATE/DELETE)
    ↓
supabase_functions.http_request() called
    ↓
POST https://www.site.com/api/revalidate
    Header: x-revalidate-secret: zaynahs_secret_cache_revalidate_2026
    Body: {"type":"CHANGE","table":"products"}
    ↓
Next.js revalidates ISR cache for affected tags
    ↓
Cloudflare CDN gets fresh content on next request
```

### 2A. Create Trigger via API (Agent Method)

```bash
SUPABASE_MGMT_TOKEN="sbp_XXXXXXXX"
SUPABASE_REF="PROJECT_REF"
SITE_URL="https://www.yourdomain.com"
SECRET="zaynahs_secret_cache_revalidate_2026"

SQL=$(cat << ENDSQL
DROP TRIGGER IF EXISTS "revalidate-products" ON public.products;
CREATE TRIGGER "revalidate-products"
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    '${SITE_URL}/api/revalidate', 'POST',
    '{"Content-Type":"application/json","x-revalidate-secret":"${SECRET}"}',
    '{"type":"CHANGE","table":"products"}',
    '5000'
  );
ENDSQL
)

SQL_JSON=$(python3 -c "import json,sys; print(json.dumps({'query': '''$SQL'''}))")
curl -s -X POST "https://api.supabase.com/v1/projects/$SUPABASE_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_MGMT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SQL_JSON"
```

### 2B. Required Triggers — All Tables

All projects need triggers on these tables:

```
products, categories, product_variants, product_images, product_modifiers,
store_settings, reviews, seo_meta, collections, collection_categories,
badges, homepage_sections, coupons, size_guides, social_proof,
social_proof_products, variant_presets, ai_settings, meta_category_mapping,
payment_methods, shipping_methods
```

> TotVogue also has: `verticals`

### 2C. Verify All Triggers Point to Correct URL

```bash
# Run this SQL to verify no trigger has wrong URL (localhost, domain.com etc.)
SQL='{"query":"SELECT trigger_name, action_statement FROM information_schema.triggers WHERE trigger_name LIKE '\''revalidate%'\'' GROUP BY trigger_name, action_statement ORDER BY trigger_name;"}'

curl -s -X POST "https://api.supabase.com/v1/projects/SUPABASE_REF/database/query" \
  -H "Authorization: Bearer MGMT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SQL" | python3 -c "
import sys,json,re
d=json.load(sys.stdin)
CORRECT_DOMAIN = 'www.yourdomain.com'
for row in d:
  m = re.search(r\"https?://[^']+\", row.get('action_statement',''))
  url = m.group() if m else 'NO URL'
  status = '✅' if CORRECT_DOMAIN in url else '❌ WRONG'
  print(f'{status} {row[\"trigger_name\"]} → {url}')
"
```

---

## 📌 SECTION 3: Cache TTL Map

| Path | Cache Layer | TTL | Notes |
|------|-------------|-----|-------|
| `/*` (HTML pages) | Cloudflare | BYPASS | HTML not cached at CF — Vercel ISR handles it |
| `/product/[slug]` | Vercel ISR | 24h | Revalidated on product DB change |
| `/_next/static/*` | Cloudflare | 1 year | Hashed filenames — safe to cache forever |
| `supabase.co` storage | Cloudflare | 1 month | Image CDN cache |
| `/cart`, `/checkout`, `/admin`, `/api/*` | Cloudflare | BYPASS | Never cache dynamic/private |

---

## 🔑 SECTION 4: Required .env.local Variables

```env
# Supabase
SUPABASE_PROJECT_REF=your_ref
SUPABASE_MGMT_TOKEN=sbp_XXXXXXXX
NEXT_PUBLIC_SUPABASE_URL=https://ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Vercel
VERCEL_TOKEN=vcp_XXXXXXXX

# GitHub
GITHUB_USERNAME=your-bot-user
GITHUB_TOKEN=ghp_XXXXXXXX
GITHUB_REPO=repo-name

# Cloudflare — MUST be cfut_ format, NEVER cfk_
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=cfut_XXXXXXXX
CF_ACCOUNT_ID=your_account_id

# Cache & Webhook
REVALIDATE_SECRET=zaynahs_secret_cache_revalidate_2026
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
```

---

## 🚨 SECTION 5: Common Issues & Fixes

### Issue 1: `cfk_` token in env file
**Symptom:** Cache purge silently fails — `{"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}`
**Fix:** Create new `cfut_` token via API (see Section 1B) and update env + Vercel

### Issue 2: Trigger pointing to `localhost:3000` or `domain.com`
**Symptom:** Cache not clearing after admin changes on live site
**Fix:**
```bash
DROP TRIGGER IF EXISTS "revalidate-TABLE" ON public.TABLE;
CREATE TRIGGER "revalidate-TABLE" AFTER INSERT OR UPDATE OR DELETE ON public.TABLE
FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
  'https://www.CORRECT-DOMAIN.com/api/revalidate', 'POST',
  '{"Content-Type":"application/json","x-revalidate-secret":"zaynahs_secret_cache_revalidate_2026"}',
  '{"type":"CHANGE","table":"TABLE"}', '5000');
```

### Issue 3: Vercel token expired (`invalidToken: True`)
**Symptom:** `{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}`
**Fix:** Get new token from https://vercel.com/account/tokens → Create → No Expiration → update env-backups

### Issue 4: Missing triggers on a table
**Symptom:** Admin changes to that table don't refresh site cache
**Fix:** Run Section 2A for the missing table

---

## ⚡ SECTION 6: Agent Auto-Verification Script

Run this after any setup or credential change to verify ALL 4 projects:

```python
import subprocess, json, re

REVALIDATE_SECRET = "zaynahs_secret_cache_revalidate_2026"

projects = {
    "TOTVOGUE":    {"ref":"ziucrfpebpxijqhwmqre","mgmt":"sbp_your_management_token_placeholder","zone":"e4aceeacdc4f6a1677e92823df1651fd","cf_token":"cfut_your_cloudflare_token_placeholder","domain":"www.totvogue.pk"},
    "ZAYNAHS":     {"ref":"unfdpfmjqljbjydgsccr","mgmt":"sbp_your_management_token_placeholder","zone":"10d964449186f64d7896f8dcac4e5eff","cf_token":"cfut_your_cloudflare_token_placeholder","domain":"www.zaynahs.pk"},
    "MINIMAHAL":   {"ref":"mgwkcumurrllhpjvfezz","mgmt":"sbp_your_management_token_placeholder","zone":"6acd493022cd0f2d5a9c290088b5327a","cf_token":"cfut_your_cloudflare_token_placeholder","domain":"www.minimahal.com"},
    "LITTLEMISTER":{"ref":"ljknmwianiswkalifueb","mgmt":"sbp_your_management_token_placeholder","zone":"063a3d5c72d44b3654aa60b17ed94863","cf_token":"cfut_your_cloudflare_token_placeholder","domain":"www.littlemister.pk"},
}

for name, cfg in projects.items():
    print(f"\n{'='*55}\n  {name} ({cfg['domain']})\n{'='*55}")

    # 1. Webhook live test
    r = subprocess.run(["curl","-s","-X","POST",f"https://{cfg['domain']}/api/revalidate",
        "-H","Content-Type: application/json",
        "-H",f"x-revalidate-secret: {REVALIDATE_SECRET}",
        "-d",'{"type":"UPDATE","table":"products","record":{"slug":"test"}}'],
        capture_output=True,text=True,timeout=15)
    wh = json.loads(r.stdout) if r.stdout else {}
    print(f"  Webhook: {'✅' if wh.get('revalidated') else '❌'} → {wh}")

    # 2. CF token verify
    r2 = subprocess.run(["curl","-s","https://api.cloudflare.com/client/v4/user/tokens/verify",
        "-H",f"Authorization: Bearer {cfg['cf_token']}"], capture_output=True,text=True,timeout=10)
    d2 = json.loads(r2.stdout)
    cf_status = d2.get('result',{}).get('status','INVALID') if d2.get('success') else 'INVALID'
    print(f"  CF Token: {'✅' if cf_status=='active' else '❌'} → {cf_status}")

    # 3. CF cache purge test
    r3 = subprocess.run(["curl","-s","-X","POST",
        f"https://api.cloudflare.com/client/v4/zones/{cfg['zone']}/purge_cache",
        "-H",f"Authorization: Bearer {cfg['cf_token']}",
        "-H","Content-Type: application/json",
        "-d",'{"files":["https://test.com/test"]}'],
        capture_output=True,text=True,timeout=10)
    d3 = json.loads(r3.stdout)
    print(f"  CF Purge: {'✅' if d3.get('success') else '❌'}")

    # 4. Trigger URL check
    r4 = subprocess.run(["curl","-s","-X","POST",
        f"https://api.supabase.com/v1/projects/{cfg['ref']}/database/query",
        "-H",f"Authorization: Bearer {cfg['mgmt']}",
        "-H","Content-Type: application/json",
        "-d",'{"query":"SELECT trigger_name,action_statement FROM information_schema.triggers WHERE trigger_name LIKE \'revalidate%\' GROUP BY trigger_name,action_statement;"}'],
        capture_output=True,text=True,timeout=20)
    d4 = json.loads(r4.stdout)
    wrong = [row['trigger_name'] for row in d4 if isinstance(d4,list)
             and cfg['domain'] not in re.search(r"https?://[^']+", row.get('action_statement','')).group('') if re.search(r"https?://[^']+", row.get('action_statement',''))]
    total = len(d4) if isinstance(d4, list) else 0
    print(f"  Triggers: {'✅' if not wrong else '❌'} {total} total | Wrong URL: {wrong if wrong else 'None'}")

print("\n✅ Audit complete")
```

---

## 🔥 CRITICAL BUG FIX (AUG 2026): NEVER USE PARTIAL CLOUDFLARE URL PURGE

**Problem:** 
When the admin saved the Customizer or updated Settings, the storefront UI (e.g., banners, active sections) was not reflecting the new data immediately, despite the Supabase Webhook firing perfectly. 

**Root Cause:**
In `lib/revalidate.ts`, the functions `revalidateBanner` and `revalidateHomepage` were using `purgeCloudflareUrls(urls)`. Cloudflare Edge Cache is extremely strict about URL matches (e.g., matching `www.zaynahs.pk` vs `zaynahs.pk` vs `http://...`). This caused the partial URL purge to silently fail, leaving stale cached HTML on the edge servers, leading to users seeing old layouts.

**The Fix / Rule:**
We removed `purgeCloudflareUrls` and replaced it entirely with **`purgeCloudflareEverything()`**.

**Rule for Future AI Agents:**
**NEVER use `purgeCloudflareUrls` for cache invalidation.** Always use `purgeCloudflareEverything()` when dealing with admin save actions, customizer updates, or product changes. This guarantees that all edge cache is wiped instantly, and the Next.js server handles the fresh data fetch on the very next user request seamlessly.
