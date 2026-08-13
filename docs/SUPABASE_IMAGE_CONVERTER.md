# Supabase Image Converter — WebP Compression Guide

Ye guide batati hai ke Supabase Storage mein maujood **product images ko WebP me convert + compress** (50–100KB) kaise karna hai, bina kisi URL/DB break ke. Yeh kaam pehli baar **zaynahs.pk** (project `unfdpfmjqljbjydgsccr`) pe kiya gaya — isi guide ko follow karke kisi bhi store clone pe dobara chala sakte hain.

---

## 1. Kya karta hai (ek line me)

`product-images` bucket ki **har image ko WebP me convert** karta hai, quality ladder (q92 → q38) + resize fallback (max 1200px) ke saath, taake har file **≤100KB** ho — aur **exact same object path pe overwrite** karta hai, is liye **URL kabhi change nahi hota** aur **DB me koi change nahi hota**.

## 2. Kyun zaroori hai

- `next.config.ts` me `images.unoptimized: true` hai (Vercel image-optimization limits) → Next.js images ko resize nahi karta.
- Storefront pe `getOptimizedImageUrl()` (`lib/utils/imageUrl.ts`) display ke waqt Supabase CDN transform (`?width=&quality=80`) use karta hai — CDN pe chhota serve hota hai, lekin **stored file abhi bhi full-size** rehti hai.
- Ye script **stored files ko hi** compress kar deti hai → storage cost + download size dono kam.

## 3. Files Involved (links)

| File | Role |
|------|------|
| [`scripts/convert-images-webp.mjs`](../scripts/convert-images-webp.mjs) | **Main converter script** (yahee use karna) |
| [`lib/utils/imageUrl.ts`](../lib/utils/imageUrl.ts) | Display-time `getOptimizedImageUrl()` helper — stored URL + transform params (width/quality) |
| [`lib/services/storage.ts`](../lib/services/storage.ts) | Upload/download service (bucket: `product-images`) — same bucket jahan script likhta hai |
| [`lib/types.ts`](../lib/types.ts) | Product/image types (agar image URL format change karo to yahan update karo) |
| [`next.config.ts`](../next.config.ts) | `images.unoptimized: true` + remotePatterns (Supabase domain allow-list) |
| `.env.local` | Credentials: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` (har store ki apni) |
| `env-backups/<store>.env.local` | Har store ke alag credentials |
| `.env.example` | Naye clone ke liye env template |
| [`docs/UI_PERFORMANCE_GUIDE.md`](UI_PERFORMANCE_GUIDE.md) | Section 5 — Image Optimization rules (raw URL kabhi storefront pe nahi) |

**Script ke andar jo supabase-js APIs use hoti hain:**
- `supabase.storage.from('product-images').list(prefix, ...)` — listing (root + `catalog/` + `store/`)
- `supabase.storage.from('product-images').download(name)` — download
- `supabase.storage.from('product-images').upload(name, buffer, { upsert: true, contentType: 'image/webp', cacheControl: '31536000' })` — in-place overwrite
- `sharp` (from `node_modules/sharp`, Next.js dependency) — WebP conversion

**Koi bhi store pe chalane ke liye:**
1. `cp env-backups/<store>.env.local .env.local` (store switch)
2. Script + guide me jo bhi hardcoded nahi — sab `.env.local` se padhta hai (URL, keys, bucket name sirf `product-images` hai sab stores me)

## 4. Script kaise kaam karta hai

```
list objects (root + catalog/ + store/ folders)
  → already-small WebP (≤100KB) SKIP (fast)
  → baaki har file:
      download → sharp convert WebP quality 92 → 85 → 78 → 70 → 62 → 55 → 48 → 40
        (pehli quality jo ≤100KB me fit ho wahi final)
      agar q40 pe bhi >100KB → resize max 1200px → phir q70→60→50→40 try
      upload: upsert:true, SAME path, content-type image/webp  ← URL unchanged
  → concurrency 10 (fast)
```

**Safety features:**
- Non-image / already-small files skip — re-run me sirf remaining process hote hain
- Fail hone pe skip (agla run phir utha leta hai)
- `TEST_LIMIT=3` se pehle test karo, phir full run

## 5. Run Karne ka Tarika

### Step 1 — Store select karo
Current store ki `.env.local` check karo (kaunsa project use ho raha hai):
```bash
grep -E "NEXT_PUBLIC_SUPABASE_URL|SUPABASE_PROJECT_REF" .env.local
```
Store switch karne ke liye: `cp env-backups/<store>.env.local .env.local`

### Step 2 — Test run (pehle sirf 3 files)
```bash
TEST_LIMIT=3 node scripts/convert-images-webp.mjs
```
Output me `OK  <file>  <old>KB -> <new>KB (qXX)` dikhe to OK. Har store ka bucket `product-images` hi hai (verify: `ls` se bucket list).

### Step 3 — Full run
```bash
node scripts/convert-images-webp.mjs
```
Full run ~5-10 min (702 files zaynahs pe). `Done. Converted: N | Failed: M` — failed files ke liye script dobara chalao.

### Step 4 — Verify
```bash
# koi file >100KB bachi to nahi?
node --input-type=module -e "
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = fs.readFileSync('.env.local','utf8').split('\n');
const get = k => { const m = env.find(l => l.startsWith(k+'=')); return m ? m.split('=').slice(1).join('=') : ''; };
const supabase = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));
const all = [];
for (const prefix of ['', 'catalog', 'store']) {
  const { data } = await supabase.storage.from('product-images').list(prefix, { limit: 1000 });
  for (const f of data || []) if (f.id) all.push(f.metadata?.size || 0);
}
console.log('files:', all.length, '| >100KB:', all.filter(x=>x>100*1024).length, '| total MB:', Math.round(all.reduce((s,x)=>s+x,0)/1048576));
"
```

## 6. Requirements / Notes

- **sharp installed hona chahiye** (`node_modules/sharp` — Next.js dependency ke saath aa jata hai; verify: `ls node_modules/sharp/package.json`)
- **supabase-js installed**: `node_modules/@supabase/supabase-js`
- **Upload curl se nahi hota** (Bucket not found error aata hai) — hamesha supabase-js `upload(name, buf, { upsert: true })` use karo
- `dotenv` package use nahi karte — script khud `.env.local` parse karta hai
- **URLs unchanged** → DB (`product_images`, `products`) touch nahi hota → migration/RLP/trigger kuch nahi
- Admin original uploads karta rehta hai — ye sirf stored files ko compress karta hai, quality ~q92 = visually lossless
- Quality floor q38/resize ke bawajood >100KB rehna ab bhi possible hai (extreme complex images) — accept karo, ya resize threshold kam karo

## 7. Pehli Baar (zaynahs.pk) ka Result

| Metric | Value |
|--------|-------|
| Files converted | 607 + 450 + 442 = ~1070 attempts (re-runs) → **702 files total** |
| Files >100KB after | **0** |
| Total bucket size | ~47 MB (pehle ~150-200 MB+) |
| Quality | q92 default (near-lossless); complex AI images q38-70 + max 1200px resize |
| Breaks | None — URLs/DB untouched, build pass |

## 8. Agent Checklist (next time)

1. Store ka `.env.local` confirm karo (grep se)
2. `TEST_LIMIT=3` test run
3. Full run + re-run jab tak `Failed: 0`
4. Verify (Step 4) — `>100KB: 0`
5. Cloudflare/edge cache pe koi asar nahi (URLs same) — koi purge zaroori nahi