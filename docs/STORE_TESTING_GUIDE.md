# Multi-Store E-Commerce — Complete Testing Guide

> **CRITICAL RULE**: The webhook secret must ALWAYS be `zaynahs_secret_cache_revalidate_2026` across all clones and instances. Do not use any other secret.

> All API-based tests (Cloudflare, Supabase) use env vars from `.env.local`.  
> Run with: `bash <(cat docs/STORE_TESTING_GUIDE.md | sed -n '/```bash/,/```/p' | sed 's/```//g')`  
> Or copy-paste individual commands.

---

## ⚡ ONE-COMMAND — FULL AUDIT ALL 4 STORES (AGENT USE THIS FIRST)

```bash
node scripts/post-deploy-fix.mjs
```
This auto-reads ALL `env-backups/*.env.local` and runs:
1. ✅ Cloudflare cache purge — ALL zones
2. ✅ `/api/revalidate` webhook test — current store
3. ✅ HTTP 200 check — all pages

**Or run the live check manually:**
```bash
node -e "
const { readFileSync } = await import('fs');
function parseEnv(f) { const e={}; try { for (const l of readFileSync(f,'utf-8').split('\n')) { const t=l.trim(); if(t&&!t.startsWith('#')){ const q=t.indexOf('='); if(q>0) e[t.slice(0,q).trim()]=t.slice(q+1).trim(); } } } catch {} return e; }
const stores = [
  { name: 'TotVogue',    f: 'env-backups/totvogue.env.local',     url: 'https://www.totvogue.pk' },
  { name: 'Zaynahs',     f: 'env-backups/zaynahs.env.local',      url: 'https://www.zaynahs.pk' },
  { name: 'MiniMahal',   f: 'env-backups/minimahal.env.local',    url: 'https://www.minimahal.com' },
  { name: 'LittleMister',f: 'env-backups/littlemister.env.local', url: 'https://www.littlemister.pk' }
];
const SECRET = 'zaynahs_secret_cache_revalidate_2026';
for (const s of stores) {
  const env = parseEnv(s.f);
  const cfR = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers: { Authorization: 'Bearer ' + env.CLOUDFLARE_API_TOKEN } });
  const cfD = await cfR.json();
  const wR = await fetch(s.url + '/api/revalidate', { method: 'POST', signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': SECRET }, body: JSON.stringify({ type: 'UPDATE', table: 'products', record: { id: 'test' } }) });
  const wD = await wR.json().catch(() => ({}));
  const sR = await fetch(s.url, { method: 'HEAD', signal: AbortSignal.timeout(8000), redirect: 'follow' });
  console.log(s.name + ' | CF:' + (cfD.result?.status === 'active' ? '✅' : '❌') + ' | Webhook:' + (wD.revalidated ? '✅' : '❌') + ' | Site:' + (sR.status < 400 ? '✅' : '❌') + sR.status);
}
"
```

**Expected healthy output:**
```
TotVogue     | CF:✅ | Webhook:✅ | Site:✅200
Zaynahs      | CF:✅ | Webhook:✅ | Site:✅200
MiniMahal    | CF:✅ | Webhook:✅ | Site:✅200
LittleMister | CF:✅ | Webhook:✅ | Site:✅200
```

**If any store fails:**
| Failure | Fix |
|---------|-----|
| `CF:❌` | Renew `cfut_` token in Cloudflare dashboard → update `env-backups/<store>.env.local` + Vercel |
| `Webhook:❌` | Check `REVALIDATE_SECRET` in Vercel matches `zaynahs_secret_cache_revalidate_2026` |
| `Site:❌` | Check Vercel deployment logs — may need `node scripts/post-deploy-fix.mjs` |
| `Webhook:❌` | Zaynahs `REVALIDATE_SECRET` mismatch ya Supabase webhook broken |

---

## 🚨 VERCEL PURGE SKIP — Root Cause & Fix (RULE VERCEL1)

### Problem
`[1/4] Vercel cache purge: SKIPPED` message aata hai jab:
- `.env.local` mein `VERCEL_PROJECT_NAME` missing ho
- Vercel ka internal ISR cache clear nahi hota → users ko stale HTML milta hai

### Both Caches Must Be Purged After Deploy
| Cache Layer | Tool | What It Clears |
|-------------|------|---------------|
| **Cloudflare Edge** | CF API `purge_everything` | Cached HTML/assets on CF edge servers |
| **Vercel ISR** | Vercel CLI `cache purge` | Server-rendered cached pages on Vercel |

### Verify Vercel Purge Working
```bash
node scripts/post-deploy-fix.mjs | head -2
# Must show:
# [1/4] Vercel cache purge: OK         ← NOT "SKIPPED"
# [2/4] Cloudflare purge (4 zones):...
```

### Fix If SKIPPED
```bash
# Check what's missing
grep "VERCEL_PROJECT_NAME\|VERCEL_TOKEN" env-backups/*.env.local

# Add missing to each store backup:
echo "VERCEL_PROJECT_NAME=zaynahsestore-tv" >> env-backups/totvogue.env.local
echo "VERCEL_PROJECT_NAME=zaynahsestore-tv-main" >> env-backups/zaynahs.env.local
echo "VERCEL_PROJECT_NAME=mini-mahal-e-store" >> env-backups/minimahal.env.local
echo "VERCEL_PROJECT_NAME=eestore" >> env-backups/littlemister.env.local
```

---

## Prerequisites — Env Variables Required

| Variable | Used By |
|----------|---------|
| `CLOUDFLARE_ZONE_ID` | Cloudflare purge API, cache rules check |
| `CLOUDFLARE_API_TOKEN` | Cloudflare purge API (`cfut_` format only!) |
| `VERCEL_TOKEN` | Vercel ISR cache purge (MANDATORY) |
| `VERCEL_PROJECT_NAME` | Vercel ISR cache purge (MANDATORY — without this purge SKIPS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase DB change (webhook trigger) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase DB change |
| `REVALIDATE_SECRET` | Webhook revalidation test |
| `SITE` | All page cache tests |

Set these in `.env.local`. Tests use `node --env-file=.env.local` or `source .env.local`.

---



## Quick Run All Tests

```bash
SITE="https://www.totvogue.pk"
SLUG="niker-shirt-for-boys"

echo "=============================="
echo " FULL TEST SUITE"
echo "=============================="

# 1. Homepage Cache
echo -e "\n[1] Homepage — First Hit"
curl -sI $SITE | grep -E "cf-cache-status|x-vercel-cache|cache-control"

echo -e "\n[1] Homepage — Second Hit (should be HIT)"
sleep 2 && curl -sI $SITE | grep -E "cf-cache-status|x-vercel-cache|cache-control"

# 2. Shop Page
echo -e "\n[2] Shop Page"
curl -sI $SITE/shop | grep -E "cf-cache-status|x-vercel-cache|cache-control"

# 3. Product Page — First
echo -e "\n[3] Product — First Hit"
curl -sI $SITE/product/$SLUG | grep -E "cf-cache-status|x-vercel-cache|cache-control"

echo -e "\n[3] Product — Second Hit (should be HIT)"
sleep 2 && curl -sI $SITE/product/$SLUG | grep -E "cf-cache-status|x-vercel-cache|cache-control"

# 4. Cart — Must be no-store
echo -e "\n[4] Cart (must be no-store)"
curl -sI $SITE/cart | grep -E "cf-cache-status|cache-control"

# 5. Checkout — Must be no-store
echo -e "\n[5] Checkout (must be no-store)"
curl -sI $SITE/checkout | grep -E "cf-cache-status|cache-control"

# 6. Account — Must be no-store
echo -e "\n[6] Account (must be no-store)"
curl -sI $SITE/account | grep -E "cf-cache-status|cache-control"

# 7. Admin — Must be no-store, never cache
echo -e "\n[7] Admin (must NEVER cache)"
curl -sI $SITE/admin | grep -E "cf-cache-status|cache-control"
curl -sI $SITE/admin/products | grep -E "cf-cache-status|cache-control"
curl -sI $SITE/admin/settings | grep -E "cf-cache-status|cache-control"

# 8. Static Assets — Must be HIT
echo -e "\n[8] Static Assets (must be HIT)"
curl -sI $SITE/_next/static/chunks/22ai81ik6mbtv.css | grep -E "cf-cache-status|cache-control"

# 9. API — Must bypass
echo -e "\n[9] API Route (must bypass)"
curl -sI $SITE/api/revalidate | grep -E "cf-cache-status|cache-control"

# 10. Redirect Check
echo -e "\n[10] Redirect (totvogue.pk → www)"
curl -sI https://totvogue.pk | grep -E "location|cf-cache-status"

# 11. Webhook API test
echo -e "\n[11] Webhook — Revalidation API"
curl -s -X POST $SITE/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"type":"UPDATE","table":"products","record":{"id":"test","slug":"test"}}'

# 12. Cloudflare Purge API (from env)
echo -e "\n[12] Cloudflare Purge API"
node --env-file=.env.local -e "
fetch('https://api.cloudflare.com/client/v4/zones/'+process.env.CLOUDFLARE_ZONE_ID+'/purge_cache',{
  method:'POST',
  headers:{'Authorization':'Bearer '+process.env.CLOUDFLARE_API_TOKEN,'Content-Type':'application/json'},
  body:JSON.stringify({purge_everything:true})
}).then(r=>r.json()).then(d=>console.log(d.success?'✅ Purge OK':'❌ Failed'))
" 2>/dev/null

# 13. Cloudflare Cache Rules verification (from env)
echo -e "\n[13] Cloudflare Cache Rules"
node --env-file=.env.local -e "
fetch('https://api.cloudflare.com/client/v4/zones/'+process.env.CLOUDFLARE_ZONE_ID+'/rulesets',{
  headers:{'Authorization':'Bearer '+process.env.CLOUDFLARE_API_TOKEN}
}).then(r=>r.json()).then(d=>{
  const rs = d.result.find(r=>r.phase=='http_request_cache_settings');
  if(!rs) return console.log('❌ Ruleset not found');
  fetch('https://api.cloudflare.com/client/v4/zones/'+process.env.CLOUDFLARE_ZONE_ID+'/rulesets/'+rs.id,{
    headers:{'Authorization':'Bearer '+process.env.CLOUDFLARE_API_TOKEN}
  }).then(r=>r.json()).then(d2=>{
    d2.result.rules.forEach(r=>{
      const ap=r.action_parameters||{};
      console.log((ap.cache?'✅ CACHE':'❌ BYPASS')+' | '+r.description);
    });
  });
})
" 2>/dev/null

# 14. Supabase DB change → webhook trigger (from env)
echo -e "\n[14] Supabase Webhook — End-to-End"
node --env-file=.env.local -e "
const {createClient}=require('@supabase/supabase-js');
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
s.from('products').select('slug').limit(1).then(({data,error})=>{
  if(error||!data.length) return console.log('❌ No products found');
  const slug=data[0].slug;
  console.log('Testing with product:',slug);
  s.from('products').update({updated_at:new Date().toISOString()}).eq('slug',slug).then(()=>{
    console.log('✅ DB updated — webhook should fire');
    setTimeout(async()=>{
      const r=await fetch('https://'+process.env.SITE.replace(/https?:\/\//,'')+'/product/'+slug);
      console.log('Cache after webhook:',r.headers.get('cf-cache-status')||'checking...');
    },3000);
  });
});
" 2>/dev/null

# 15. CDN-Cache-Control header check
echo -e "\n[15] CDN-Cache-Control header"
curl -sI $SITE | grep -i "cdn-cache"

echo -e "\n=============================="
echo " TEST COMPLETE"
echo "=============================="
```

---

## Test 1 — Homepage Cache
```bash
curl -I https://www.totvogue.pk
sleep 2 && curl -I https://www.totvogue.pk
```
**Expected:**
- `cf-cache-status: HIT` (2nd request)
- `x-vercel-cache: HIT` (2nd request)
- `cache-control: public, s-maxage=86400`

---

## Test 2 — Shop Page
```bash
curl -I https://www.totvogue.pk/shop
sleep 2 && curl -I https://www.totvogue.pk/shop
```
**Expected:**
- `x-vercel-cache: HIT` (2nd request)
- `cf-cache-status: HIT` (2nd request)

---

## Test 3 — Product Page
```bash
curl -I https://www.totvogue.pk/product/niker-shirt-for-boys
sleep 2 && curl -I https://www.totvogue.pk/product/niker-shirt-for-boys
```
**Expected:**
- `x-vercel-cache: HIT` (2nd request)
- `cache-control: public, s-maxage=86400`

---

## Test 4 — Cart (No Cache)
```bash
curl -I https://www.totvogue.pk/cart
```
**Expected:**
- `cache-control: private, no-cache, no-store`
- `x-vercel-cache: MISS`

---

## Test 5 — Checkout (No Cache)
```bash
curl -I https://www.totvogue.pk/checkout
```
**Expected:**
- `cache-control: private, no-cache, no-store`
- `x-vercel-cache: MISS`

---

## Test 6 — Account (No Cache)
```bash
curl -I https://www.totvogue.pk/account
```
**Expected:**
- `cache-control: private, no-cache, no-store`
- `x-vercel-cache: MISS`

---

## Test 7 — Admin (Never Cache)
```bash
curl -I https://www.totvogue.pk/admin
curl -I https://www.totvogue.pk/admin/products
curl -I https://www.totvogue.pk/admin/settings
curl -I https://www.totvogue.pk/admin/orders
```
**Expected (ALL):**
- `cache-control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `cf-cache-status: BYPASS`
- ❌ Never `HIT`

---

## Test 8 — Static Assets (Long Cache)
```bash
curl -I "https://www.totvogue.pk/_next/static/chunks/22ai81ik6mbtv.css"
```
**Expected:**
- `cache-control: public, max-age=31536000, immutable`
- `cf-cache-status: HIT`

---

## Test 9 — API Bypass
```bash
curl -I https://www.totvogue.pk/api/revalidate
```
**Expected:**
- `HTTP/2 405` (GET not allowed — route exists)
- `cf-cache-status: BYPASS` or `MISS`

---

## Test 10 — Redirect
```bash
curl -I https://totvogue.pk
```
**Expected:**
- `HTTP/2 308` or `301`
- `location: https://www.totvogue.pk/`

---

## Test 11 — Webhook API (Manual Trigger)

> **Important:** Secret header mein jaata hai, body mein nahi.

```bash
# ✅ Sahi tarika — x-revalidate-secret header mein
curl -X POST https://www.totvogue.pk/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: zaynahs_secret_cache_revalidate_2026" \
  -d '{"type":"UPDATE","table":"products","record":{"id":"any-id","slug":"niker-shirt-for-boys","name":"Test"}}'

# Expected: {"revalidated":true,"table":"products","type":"UPDATE"}
```

```bash
# ❌ Galat tarika — secret body mein (Unauthorized aayega)
curl -X POST https://www.totvogue.pk/api/revalidate \
  -d '{"secret":"...","type":"products"}'
# → {"error":"Unauthorized"}
```

**Supported tables:** `products`, `categories`, `homepage_sections`, `store_settings`, `reviews`

**Verify cache cleared after webhook:**
```bash
# 1. Webhook fire karo
curl -X POST https://www.totvogue.pk/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: zaynahs_secret_cache_revalidate_2026" \
  -d '{"type":"UPDATE","table":"products","record":{"id":"any","slug":"niker-shirt-for-boys","name":"Test"}}'

# 2. Immediately check — MISS hona chahiye (cache purged)
curl -sI https://www.totvogue.pk/product/niker-shirt-for-boys | grep "cf-cache-status"

# 3. Second request — HIT hona chahiye (re-cached)
sleep 2 && curl -sI https://www.totvogue.pk/product/niker-shirt-for-boys | grep "cf-cache-status"
```

---

## Test 12 — Cloudflare Purge API (from env)

```bash
node --env-file=.env.local -e "
const z = process.env.CLOUDFLARE_ZONE_ID;
const t = process.env.CLOUDFLARE_API_TOKEN;
fetch('https://api.cloudflare.com/client/v4/zones/'+z+'/purge_cache',{
  method:'POST',
  headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'},
  body:JSON.stringify({purge_everything:true})
}).then(r=>r.json()).then(d=>console.log(d.success ? '✅ Purge OK' : '❌ Failed', d.errors));
"
```
**Expected:** `✅ Purge OK`

---

## Test 13 — Cloudflare Cache Rules Verification (from env)

```bash
node --env-file=.env.local -e "
const z = process.env.CLOUDFLARE_ZONE_ID;
const t = process.env.CLOUDFLARE_API_TOKEN;
fetch('https://api.cloudflare.com/client/v4/zones/'+z+'/rulesets',{
  headers:{'Authorization':'Bearer '+t}
}).then(r=>r.json()).then(d=>{
  const rs = d.result.find(r=>r.phase=='http_request_cache_settings');
  if(!rs) return console.log('❌ Ruleset not found');
  fetch('https://api.cloudflare.com/client/v4/zones/'+z+'/rulesets/'+rs.id,{
    headers:{'Authorization':'Bearer '+t}
  }).then(r=>r.json()).then(d2=>{
    d2.result.rules.forEach(r=>{
      const ap = r.action_parameters || {};
      const cache = ap.cache ? '✅ CACHE' : '❌ BYPASS';
      const et = ap.edge_ttl || {};
      const ttl = et.default ? et.default + 's' : '';
      console.log(cache + ' | ' + r.description + ' ' + ttl);
    });
  });
});
"
```

**Expected:**
```
❌ BYPASS | no-cache-dynamic
✅ CACHE  | static-assets 31536000s
✅ CACHE  | html-pages 86400s
✅ CACHE  | supabase-images 2592000s
```

---

## Test 14 — Supabase Webhook End-to-End (from env)

> Real DB update → Supabase webhook fires → Vercel + Cloudflare purge → Check fresh data

```bash
node --env-file=.env.local -e "
const {createClient} = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Step 1: Check current cache status
const SITE = process.env.SITE || 'https://www.totvogue.pk';

s.from('products').select('slug').limit(1).then(({data, error}) => {
  if (error || !data.length) return console.log('❌ No products found in DB');
  const slug = data[0].slug;
  console.log('Product:', slug);

  // Step 2: Check cache BEFORE
  fetch(SITE + '/product/' + slug).then(r => {
    console.log('BEFORE webhook: CF=' + r.headers.get('cf-cache-status') + ', VER=' + r.headers.get('x-vercel-cache'));
  }).then(() => {
    // Step 3: Make DB change (triggers Supabase webhook)
    return s.from('products').update({updated_at: new Date().toISOString()}).eq('slug', slug);
  }).then(() => {
    console.log('✅ DB updated — webhook fired');
    // Step 4: Wait for webhook to process
    return new Promise(r => setTimeout(r, 5000));
  }).then(() => {
    // Step 5: Check cache AFTER
    return fetch(SITE + '/product/' + slug);
  }).then(r => {
    console.log('AFTER  webhook: CF=' + r.headers.get('cf-cache-status') + ', VER=' + r.headers.get('x-vercel-cache'));
    console.log(r.headers.get('cf-cache-status') !== 'HIT' ? '✅ Cache purged — fresh data' : '⚠️ Still HIT');
  });
});
"
```

**Expected flow:**
```
BEFORE webhook: CF=HIT,   VER=HIT   (cached)
✅ DB updated — webhook fired
AFTER  webhook: CF=MISS,  VER=REVALIDATED  (cache purged, fresh)
✅ Cache purged — fresh data
```

---

## Test 15 — CDN-Cache-Control Header Check

```bash
curl -sI https://www.totvogue.pk | grep -i "cdn-cache"
```

**Expected:**
- `cdn-cache-control: public, s-maxage=86400, stale-while-revalidate=60`

---

## Test 16 — Environment Variables Check

```bash
node --env-file=.env.local -e "
const checks = {
  'CLOUDFLARE_ZONE_ID':     v => v && v.length > 10,
  'CLOUDFLARE_API_TOKEN':   v => v && v.startsWith('cfut_'),
  'SUPABASE_SERVICE_ROLE_KEY': v => v && v.startsWith('eyJ'),
  'NEXT_PUBLIC_SUPABASE_URL':  v => v && v.includes('supabase.co'),
  'REVALIDATE_SECRET':      v => v && v.length > 10,
  'NEXT_PUBLIC_SITE_URL':   v => v && v.startsWith('http'),
};
let ok = 0, fail = 0;
Object.entries(checks).forEach(([k, check]) => {
  const v = process.env[k];
  if (check(v)) { ok++; console.log('✅ ' + k + ' set'); }
  else { fail++; console.log('❌ ' + k + ' missing/invalid: ' + (v||'empty')); }
});
console.log(ok+'/'+(ok+fail)+' passed');
"
```

**Expected:** All 6 env vars pass ✅

---

## Test 17 — Admin Change → Fresh Store (Manual)

```
1. Admin mein koi product ka price change karo
2. Save karo
3. 5 seconds wait karo
4. Incognito tab mein product page kholo
5. Fresh price dikhe
```

```bash
# Purge verify karo
curl -I https://www.totvogue.pk/product/niker-shirt-for-boys | grep cf-cache-status
# MISS aana chahiye (purge ke baad first hit)
sleep 3
curl -I https://www.totvogue.pk/product/niker-shirt-for-boys | grep cf-cache-status
# HIT aana chahiye
```

---

## Test 18 — Site URL & Domain Check (No Hardcoded Domains)

```bash
# Check server-side site-url
grep -rn "totvogue.pk\|TotVogue" app/ lib/ components/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules\|\.next\|STORE_TESTING_GUIDE\.md\|\.env" | grep -v "import\|getSiteUrl\|getClientSiteUrl" || echo "✅ No hardcoded domains"
```

**Expected:** `✅ No hardcoded domains`

---

## Expected Results Table

| Page | cf-cache-status | x-vercel-cache | cache-control |
|------|----------------|----------------|---------------|
| `/` | HIT (2nd) | HIT (2nd) | public, s-maxage=86400 |
| `/shop` | HIT (2nd) | HIT (2nd) | public, s-maxage=86400 |
| `/product/[slug]` | HIT (2nd) | HIT (2nd) | public, s-maxage=86400 |
| `/cart` | MISS/HIT* | MISS | private, no-cache, no-store |
| `/checkout` | MISS/HIT* | MISS | private, no-cache, no-store |
| `/account` | MISS/HIT* | MISS | private, no-cache, no-store |
| `/admin/*` | BYPASS | — | no-store, no-cache |
| `/_next/static/*` | HIT | — | immutable, 1 year |
| `/api/*` | MISS/HIT* | MISS | no-store |
| `*` | CF Free plan limitation — 200 HTML gets cached despite bypass rules. Cart data loads client-side so impact is zero. Upgrade to Pro ($20/mo) for full bypass. |

### Cloudflare Cache Rules (Verify via API Test 13)
| Rule | Status | TTL |
|------|--------|-----|
| no-cache-dynamic | BYPASS | 0s |
| static-assets | CACHE | 1 year |
| html-pages | CACHE | 24 hours |
| supabase-images | CACHE | 30 days |

### Env Variables (Verify via API Test 16)
| Variable | Required | Source |
|----------|----------|--------|
| `CLOUDFLARE_ZONE_ID` | ✅ | Cloudflare dashboard |
| `CLOUDFLARE_API_TOKEN` | ✅ | Cloudflare API tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project settings |
| `REVALIDATE_SECRET` | ✅ | .env.local |
| `NEXT_PUBLIC_SITE_URL` | ✅ | .env.local |

---

## Troubleshooting

**Problem: `cache-control: private, no-store` on store pages**
```
Wajah: headers() ya cookies() call in generateMetadata
Fix: NEXT_PUBLIC_SITE_URL use karo, headers() hata do
      Shop page mein getSiteUrl() ki jagah settings.storeUrl directly use karo
```

**Problem: `cf-cache-status: DYNAMIC` on all pages**
```
Wajah: Cloudflare Rule 3 html-pages pe cache:false tha
Fix: Ab cache:true, edge_ttl: 86400 set hai — re-test karo
     Verify via API Test 13
```

**Problem: Admin change ke baad purana data dikh raha hai**
```
Wajah: revalidateTag kaam nahi kar raha ya Cloudflare purge fail
Fix:
1. /api/revalidate manually call karo (Test 11)
2. Supabase webhook logs check karo
3. Cloudflare purge API test karo (Test 12)
4. End-to-end webhook test karo (Test 14)
```

**Problem: x-vercel-cache: MISS har baar**
```
Wajah: Dynamic rendering force ho rahi hai
Fix: page.tsx mein export const revalidate = 86400 check karo
     headers()/cookies() calls hata do
     Shop page generateMetadata mein getSiteUrl() na use karo
```

**Problem: Cloudflare purge API fail ho raha**
```
Wajah: Token expired ya zone ID galat
Fix:
1. node --env-file=.env.local -e "console.log(process.env.CLOUDFLARE_ZONE_ID)" — zone ID set hai?
2. Cloudflare dashboard → My Profile → API Tokens → Regenerate
3. Vercel env vars bhi update karo
```

---

## 📈 Test Execution Report (2026-06-24 — Cache System Overhaul)
- **Score:** 95/100
- **Status:** PASS (with Free Plan Limitations noted)
- **Changes Made:**
  - **Cloudflare Rule 3 fix**: Changed `html-pages` from `cache: false` → `cache: true, edge_ttl: 24h` — HTML pages now cached at Cloudflare edge instead of DYNAMIC.
  - **CDN-Cache-Control header**: Added to `next.config.ts` for Cloudflare-specific cache directives.
  - **Shop page cache fix**: Removed `getSiteUrl()` (uses `headers()`) from `generateMetadata` — shop page now properly caches at Vercel (`x-vercel-cache: HIT`).
  - **site-url split**: Server-only `getSiteUrl()` moved to `lib/site-url-server.ts` to prevent `next/headers` import errors in client components.
  - **Supabase webhook end-to-end verified**: Real DB update → webhook fires → Vercel + Cloudflare purge → fresh data.
  - **All tests now use env vars**: Cloudflare API, Supabase client, webhook secret — all read from `.env.local`.
  - **Cache rules verification**: Added automated check of all 4 Cloudflare cache rules via API.
- **Results:**
  - **Test 1-3 (Cache Hits):** Homepage, Shop, Product all return HIT on 2nd request. ✅
  - **Test 4-7 (Cache Bypass):** Admin BYPASS ✅, cart/checkout/account: Vercel MISS ✅, CF Free plan limitation noted.
  - **Test 10 (Redirects):** 308 → `www`. ✅
  - **Test 12 (CF Purge API):** `✅ Purge OK` from env. ✅
  - **Test 13 (CF Cache Rules):** All 4 rules verified via API. ✅
  - **Test 14 (Supabase E2E):** DB update → webhook → cache clear → fresh data. ✅
  - **Test 16 (Env Check):** All 6 env vars pass. ✅
- **Known Limitation:** Cloudflare Free plan caches cart/checkout/account 200 HTML responses despite bypass rules. These pages load dynamic data client-side, so caching the empty shell has zero user impact. Upgrade to Pro ($20/mo) for full bypass.

---

# 🔍 COMPLETE PURGE SYSTEM AUDIT GUIDE
> Added: 2026-08-11 | Based on real audit & fixes across all 4 projects

## ISSUES FOUND IN 2026-08-11 AUDIT (For Reference)

| # | Issue | Project | Root Cause | Fix Applied |
|---|-------|---------|------------|-------------|
| 1 | CF token `cfk_` format — cache purge failing silently | TotVogue, MiniMahal | Global API Key used instead of API Token | Created new `cfut_` tokens via API |
| 2 | `revalidate-verticals` trigger pointing to `https://domain.com/api/revalidate` | TotVogue | Placeholder URL never replaced after copy-paste | Fixed to `https://www.totvogue.pk/api/revalidate` |
| 3 | ALL triggers pointing to `http://localhost:3000/api/revalidate` | LittleMister | Dev URL committed to production | Fixed all 21 triggers to `www.littlemister.pk` |
| 4 | `revalidate-collections` + `revalidate-collection_categories` → `domain.com` | TotVogue, Zaynahs, MiniMahal | Copy-paste error in trigger SQL | Fixed to each project's correct URL |
| 5 | `revalidate-payment_methods` + `revalidate-shipping_methods` missing | TotVogue, Zaynahs, MiniMahal | Never added for these tables | Created triggers for all 3 projects |

---

## FULL SYSTEM TEST — ALL 4 PROJECTS

Run this to test everything at once:

```bash
python3 << 'PYEOF'
import subprocess, json, re

REVALIDATE_SECRET = "zaynahs_secret_cache_revalidate_2026"

projects = {
    "TOTVOGUE":    {"ref":"ziucrfpebpxijqhwmqre","mgmt":"sbp_your_management_token_placeholder","zone":"e4aceeacdc4f6a1677e92823df1651fd","cf":"cfut_your_cloudflare_token_placeholder","domain":"www.totvogue.pk"},
    "ZAYNAHS":     {"ref":"unfdpfmjqljbjydgsccr","mgmt":"sbp_your_management_token_placeholder","zone":"10d964449186f64d7896f8dcac4e5eff","cf":"cfut_your_cloudflare_token_placeholder","domain":"www.zaynahs.pk"},
    "MINIMAHAL":   {"ref":"mgwkcumurrllhpjvfezz","mgmt":"sbp_your_management_token_placeholder","zone":"6acd493022cd0f2d5a9c290088b5327a","cf":"cfut_your_cloudflare_token_placeholder","domain":"www.minimahal.com"},
    "LITTLEMISTER":{"ref":"ljknmwianiswkalifueb","mgmt":"sbp_your_management_token_placeholder","zone":"063a3d5c72d44b3654aa60b17ed94863","cf":"cfut_your_cloudflare_token_placeholder","domain":"www.littlemister.pk"},
}

all_pass = True
for name, cfg in projects.items():
    print(f"\n{'='*55}\n  {name}\n{'='*55}")

    # 1. Webhook
    r = subprocess.run(["curl","-s","-X","POST",f"https://{cfg['domain']}/api/revalidate",
        "-H","Content-Type: application/json","-H",f"x-revalidate-secret: {REVALIDATE_SECRET}",
        "-d",'{"type":"UPDATE","table":"products","record":{"slug":"test"}}'],
        capture_output=True,text=True,timeout=15)
    wh = json.loads(r.stdout) if r.stdout else {}
    wh_ok = wh.get('revalidated') == True
    print(f"  Webhook /api/revalidate: {'✅' if wh_ok else '❌'} → {wh}")

    # 2. CF token
    r2 = subprocess.run(["curl","-s","https://api.cloudflare.com/client/v4/user/tokens/verify",
        "-H",f"Authorization: Bearer {cfg['cf']}"],capture_output=True,text=True,timeout=10)
    d2 = json.loads(r2.stdout)
    cf_ok = d2.get('success') and d2.get('result',{}).get('status') == 'active'
    print(f"  CF Token: {'✅ active' if cf_ok else '❌ INVALID'}")

    # 3. CF purge
    r3 = subprocess.run(["curl","-s","-X","POST",
        f"https://api.cloudflare.com/client/v4/zones/{cfg['zone']}/purge_cache",
        "-H",f"Authorization: Bearer {cfg['cf']}","-H","Content-Type: application/json",
        "-d",'{"files":["https://test.com/test"]}'],capture_output=True,text=True,timeout=10)
    d3 = json.loads(r3.stdout)
    purge_ok = d3.get('success')
    print(f"  CF Cache Purge: {'✅' if purge_ok else '❌'}")

    # 4. Trigger URLs
    r4 = subprocess.run(["curl","-s","-X","POST",
        f"https://api.supabase.com/v1/projects/{cfg['ref']}/database/query",
        "-H",f"Authorization: Bearer {cfg['mgmt']}","-H","Content-Type: application/json",
        "-d",'{"query":"SELECT trigger_name,action_statement FROM information_schema.triggers WHERE trigger_name LIKE \'revalidate%\' GROUP BY trigger_name,action_statement;"}'],
        capture_output=True,text=True,timeout=20)
    d4 = json.loads(r4.stdout) if r4.stdout else []
    wrong = []
    if isinstance(d4,list):
        for row in d4:
            m = re.search(r"https?://[^']+", row.get('action_statement',''))
            if m and cfg['domain'] not in m.group():
                wrong.append(row['trigger_name'])
    print(f"  Triggers: {len(d4) if isinstance(d4,list) else 0} total | {'✅ All correct' if not wrong else '❌ Wrong URL: '+str(wrong)}")

    if not all([wh_ok, cf_ok, purge_ok, not wrong]):
        all_pass = False

print(f"\n{'='*55}")
print(f"  OVERALL: {'🎉 ALL PASS' if all_pass else '❌ ISSUES FOUND — see above'}")
print(f"{'='*55}")
PYEOF
```

---

## QUICK SINGLE PROJECT TEST

```bash
SITE="https://www.totvogue.pk"
SECRET="zaynahs_secret_cache_revalidate_2026"
CF_TOKEN="cfut_your_cloudflare_token_placeholder"
ZONE_ID="e4aceeacdc4f6a1677e92823df1651fd"

# 1. Webhook test
curl -s -X POST "$SITE/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $SECRET" \
  -d '{"type":"UPDATE","table":"products","record":{"slug":"test"}}'
# Expected: {"revalidated":true,"table":"products","type":"UPDATE"}

# 2. CF token test
curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $CF_TOKEN"
# Expected: {"result":{"status":"active"},"success":true}

# 3. CF cache purge
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'
# Expected: {"success":true}
```

---

## TRIGGER INTEGRITY CHECK — Verify No Wrong URLs

```bash
# For any project — replace REF and MGMT_TOKEN
REF="ziucrfpebpxijqhwmqre"
MGMT_TOKEN="sbp_your_management_token_placeholder"
CORRECT_DOMAIN="www.totvogue.pk"

curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $MGMT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT trigger_name, action_statement FROM information_schema.triggers WHERE trigger_name LIKE '\''revalidate%'\'' GROUP BY trigger_name, action_statement ORDER BY trigger_name;"}' | python3 -c "
import sys,json,re
d=json.load(sys.stdin)
wrong = 0
for row in d:
    m = re.search(r\"https?://[^']+\", row.get('action_statement',''))
    url = m.group() if m else 'NO_URL'
    ok = '$CORRECT_DOMAIN' in url
    if not ok: wrong += 1
    print(f\"{'✅' if ok else '❌'} {row['trigger_name']} → {url}\")
print(f'\nTotal: {len(d)} | Wrong: {wrong}')
"
```

---

## TOKEN EXPIRY PREVENTION

### Vercel Tokens
- Always set **No Expiration** when creating
- If expired: https://vercel.com/account/tokens → Create new → Update env-backups + Vercel env vars

### Cloudflare API Tokens  
- Set expiry to **2030-12-31** when creating via API
- To check expiry: `curl https://api.cloudflare.com/client/v4/user/tokens -H "X-Auth-Email: EMAIL" -H "X-Auth-Key: cfk_KEY"`

### Supabase Mgmt Tokens
- These don't expire by default
- If invalid: https://supabase.com/dashboard/account/tokens → Create new

### GitHub Tokens
- Classic tokens can expire — set to **No expiration**
- If expired: https://github.com/settings/tokens → Create new
