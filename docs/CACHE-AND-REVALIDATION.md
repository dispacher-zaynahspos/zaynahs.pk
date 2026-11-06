# CACHE AND REVALIDATION

Single source of truth for what is cached, where, and what an admin save refreshes.

## 1. Layers

| Layer | What | Where | TTL |
|---|---|---|---|
| Cloudflare edge | HTML pages, static assets, images | CF cache rules (`scripts/lib/cf-cache-rules.js`) | HTML 30 days, purge-driven |
| Next ISR | Rendered pages | Vercel today → R2 incremental cache on Workers | per-route `revalidate` |
| Next data cache | `unstable_cache` wrappers | memory today → R2/DO on Workers | ≤ 300 s (RULE C12) |
| Client | React state, zustand stores | browser | session |

Hard rule (RULE C12): CDN `s-maxage` must be **≤** ISR `revalidate`, otherwise the
edge serves HTML the app already replaced.

## 2. Single purge entry point

```
lib/revalidate.ts
  revalidateStorefrontEdge({ tags, urls })
    → revalidateTag(tag)            // single-arg only
    → CF targeted purge (URL + cache-tag)
```

- Every admin write calls this. No route purges cache on its own.
- `app/api/revalidate/route.ts` is the webhook entry (secret: `REVALIDATE_SECRET`).
- Supabase DB webhook calls the same endpoint.

## 3. Tags

| Tag | Invalidated by |
|---|---|
| `products` | product create/update/delete, stock change |
| `product:<slug>` | single product update |
| `categories` | category create/update/reorder |
| `settings` | settings save, customizer save |
| `home` | home section / banner / customizer save |
| `reviews` | review approve/reject/reply |
| `orders` (admin only) | order status change |

## 4. Never purge

- Orders are **never** purged at the edge (RULE C15) — checkout is never cached.
- Checkout/cart/account are `no-store` (RULE C17); a `no-store` leak into HTML is a bug.

## 5. Admin save → storefront (acceptance test)

| Action | Expected |
|---|---|
| price / title change | product page + cards fresh instantly |
| stock change | product page + add-to-cart state fresh |
| category change | product page + category listing fresh |
| home banner / section | home fresh |
| global settings (brand, colors) | all pages fresh |
| product image upload | new image visible, old URL still resolves |

Any stale page = FAIL.

## 6. Cloudflare specifics (target)

- HTML cache rules: keep `html-pages` rule semantics from `scripts/lib/cf-cache-rules.js`.
- Purge is **targeted** (URLs + tags), never `purge_everything`.
- Both store and admin hosts share the same brand cache (one Worker per brand).
- Admin host: `Cache-Control: no-store` for `/admin*`, `noindex` header.

## 7. Verification

```bash
npm run check:redirects        # canonical host behaviour
npm run purge:network          # targeted purge for one store
npm run verify:network         # post-deploy verification
```

Snapshot tests (planned `scripts/snapshots/`) compare HTML before/after a refactor;
any diff must be explained and approved.
