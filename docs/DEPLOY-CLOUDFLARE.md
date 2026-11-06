# DEPLOY — CLOUDFLARE WORKERS

One Worker per brand. Admin is served by the same Worker, selected by host.

```
zaynahs.pk + www.zaynahs.pk   ─┐
admin.zaynahs.pk              ─┼─▶ Worker "zaynahs"
img.zaynahs.pk                ─┘     R2 cache + DO tag cache + R2 images
```

## 1. Prerequisites

| Requirement | Why |
|---|---|
| `Workers Paid` | Free = 10 ms CPU / 3 MB bundle; this app exceeds both |
| R2 enabled on the account | incremental cache + images (needs a card, free tier is fine) |
| Token perms: `Workers R2 Storage: Edit`, `Workers Scripts: Edit`, `Workers Routes: Edit`, `Account Settings: Read`, `Cache Purge: Purge`, `DNS: Edit` | all deploys are CLI-only |

## 2. Generate config (never hardcoded)

```bash
npm run worker:config -- --store=zaynahs
# → worker-config/zaynahs/wrangler.store.jsonc   (git-ignored)
```

Derived from the brand env file: worker name, routes, R2 bucket names,
Durable Object bindings, `WORKER_ROLE`. No domain or brand appears in source.

## 3. Build

```bash
npx opennextjs-cloudflare build        # emits .open-next/
npx wrangler deploy --dry-run --outdir dist \
  --config worker-config/<slug>/wrangler.store.jsonc   # size report only
```

Report: compressed size per Worker. > 3 MB ⇒ Paid required (STOP POINT A).

## 4. Deploy

```bash
# test first
npx wrangler deploy --config worker-config/<slug>/wrangler.store.jsonc
# secrets (names only, values prompted)
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --config ...
```

## 5. Bindings

| Binding | Type | Purpose |
|---|---|---|
| `NEXT_INC_CACHE_R2_BUCKET` | R2 | OpenNext incremental cache |
| `NEXT_CACHE_DO_QUEUE` | Durable Object | revalidation queue |
| `NEXT_TAG_CACHE_DO_QUEUE` | Durable Object | tag cache |
| `ASSETS` | Assets | static output |
| `R2_IMAGES_BUCKET` | R2 | image uploads (Phase 2) |

## 6. Images (R2)

```bash
node scripts/r2-migrate-images.mjs --env=.env.local --dry-run   # 459 objects / 31.6 MB
node scripts/r2-migrate-images.mjs --env=.env.local --apply     # idempotent, batched
```

- Keys are prefix-preserving (`product-images/<path>`), so `/storage/*` keeps working.
- Cutover switch: set `R2_PUBLIC_BASE=https://img.<host>` → `/storage/*` serves R2.
  Rollback = clear the variable. **No database row is ever rewritten.**
- New uploads: `R2_UPLOAD_ENABLED=true` (Supabase remains the fallback on failure).
- Workers runtime note: `sharp` cannot run in the Workers runtime — the upload
  route needs the edge-safe path before Worker cutover (open item).

## 7. Cron

Vercel cron → Cloudflare cron triggers in the same Worker config:
`/api/cron/abandoned-cart`, `/api/cron/review-requests`.
`CRON_SECRET` still required.

## 7. Cutover order

1. Export DNS + cache rules (local backup)
2. Backup Supabase auth Site URL + redirect list
3. Add new auth redirects (ADD only)
4. Add brand DB webhook (keep other brands untouched)
5. Switch DNS, remove old HTML cache rules (this zone only)
6. Remove the domain from the Vercel project
7. Verify store, admin, images + one freshness test

## 8. Rollback (< 5 min)

1. Restore DNS snapshot → Vercel
2. Restore cache rules JSON
3. Re-add domain to Vercel project
4. Delete the added webhook + added redirects
5. Verify `www`, `admin`, one price change

## 9. Verification

```bash
npm run check:redirects
npm run verify:network
curl -sI https://<host> | grep -i cache
```

## 10. Never

- Never touch another brand's zone, DNS, cache rules, project or webhooks.
- Never purge everything (`purge_everything`) — targeted only.
- Never put a secret in `vars`.
