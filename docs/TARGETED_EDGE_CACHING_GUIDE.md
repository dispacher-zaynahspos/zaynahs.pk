# TARGETED EDGE CACHING & CLOUDFLARE PURGE GUIDE

> **Targeted Cache-Tag & URL Purge Architecture**
> Zero-Stale Freshness (< 150ms) · Near-Zero Vercel CPU (< 1% Free Tier) · No Cache Stampedes

---

## 1. Executive Architecture Overview

High-traffic e-commerce systems cannot rely on blanket `purge_everything: true` on every admin save. When a full zone is purged, thousands of pre-rendered pages are erased simultaneously from global CDN edge nodes, causing a **Cache Stampede** (thousands of incoming visits hitting the origin serverless functions at once, spiking Vercel Active CPU and burning monthly invocation limits).

This system implements **Shopify-Grade Targeted Dual-Tier Invalidation**:

```
[ Admin Action / Webhook ]
           │
           ▼
[ Step 1: Next.js Origin Invalidation ]
  • revalidateTag('product-[slug]')
  • revalidateTag('products')
  • revalidatePath('/product/[slug]')
  • revalidatePath('/')
  • revalidatePath('/shop')
           │
           ▼
[ Step 2: Cloudflare Targeted Edge Purge ]
  • tags: ['product', 'products', 'product-[slug]']
  • files: [
      https://domain.pk/product/[slug],
      https://domain.pk/product/[slug]/,
      https://www.domain.pk/product/[slug],
      https://www.domain.pk/product/[slug]/,
      https://domain.pk/,
      https://www.domain.pk/,
      https://domain.pk/shop,
      https://www.domain.pk/shop
    ]
  • 3x Retry Loop with Exponential Backoff
           │
           ▼
[ Result ]
  • Edited product + home/shop cards refresh instantly (< 150ms)
  • ALL OTHER 200+ product pages STAY 100% HOT & CACHED on Cloudflare Edge
  • Vercel Origin CPU consumed: 0ms for all cached visits
```

---

## 2. Cloudflare Purge Capabilities (Confirmed April 2025+)

Cloudflare enabled advanced purge methods across **all plans**:
* `tags: string[]` — Purges every cached object tagged with matching `Cache-Tag` response headers.
* `files: string[]` — Purges exact URLs (with apex/www and trailing-slash permutations).
* `prefixes: string[]` — Purges path trees (e.g. `domain.pk/product/`).
* `hosts: string[]` — Purges entire hostnames without clearing other zones.
* `purge_everything: true` — Full zone wipe (strictly reserved for Global Theme / Settings changes).

Live verified on active store zones via Cloudflare API:
```bash
POST https://api.cloudflare.com/client/v4/zones/:zone_id/purge_cache
{"tags":["test-tag"]} ➔ {"success":true,"result":{"id":"..."}}
```

---

## 3. Strict Order of Operations (RULE C14)

1. **Next.js Cache Refresh FIRST**:
   `revalidateTag()` and `revalidatePath()` MUST execute before calling Cloudflare's purge API.
   * *Why:* If Cloudflare edge is purged before Next.js updates its Data Cache, an immediate incoming visitor request would pull the *old* page from Vercel's stale Data Cache and re-cache the stale version on Cloudflare.
2. **Cloudflare Purge SECOND**:
   Once Next.js internal tags and routes are invalidated, Cloudflare's edge cache is purged. The very next visitor triggers a fresh ISR regeneration, serving the updated data and warming the edge.
3. **Retry Loop with Exponential Backoff**:
   Network blips between Vercel and Cloudflare API are handled automatically with up to 3 retries (0.8s, 1.6s backoff).

---

## 4. Admin Action ➔ Purge Mapping Reference

| Admin Action | Level 1: Next.js Invalidation | Level 2: Cloudflare Invalidation | Unrelated Pages Impact |
| :--- | :--- | :--- | :--- |
| **Product Create / Add** | `revalidateTag('products')`<br>`revalidateTag('homepage')`<br>`revalidatePath('/')`<br>`revalidatePath('/shop')` | `tags: ['products', 'homepage', 'shop']`<br>`urls: ['/', '/shop']` | Other detail pages stay 100% cached. |
| **Product Update / Edit** *(Price, Stock, Images, Title, Variants)* | `revalidateTag('product-[slug]')`<br>`revalidateTag('products')`<br>`revalidateTag('homepage')`<br>`revalidatePath('/product/[slug]')`<br>`revalidatePath('/')`<br>`revalidatePath('/shop')` | `tags: ['product', 'products', 'product-[slug]']`<br>`urls: ['/product/[slug]', '/', '/shop']` | All other 200+ products stay cached at the edge. |
| **Product Toggle Active/Inactive** | Same as Product Edit | Same as Product Edit | Instant catalog visibility sync. |
| **Product Soft Delete (Trash)** | Same as Product Edit | Same as Product Edit | Trashed product instantly 404s/disappears. |
| **Product Restore from Trash** | Same as Product Edit | Same as Product Edit | Restored product instantly returns. |
| **Product Hard Delete (Permanent)** | Resolves slug first, then same as Product Edit with action `DELETED` | Same as Product Edit | No orphaned 404 cache keys left on edge. |
| **Category Edit / Reorder** | `revalidateTag('category-[slug]')`<br>`revalidateTag('categories')`<br>`revalidatePath('/category/[slug]')`<br>`revalidatePath('/shop')`<br>`revalidatePath('/')` | `tags: ['category', 'categories', 'category-[slug]']`<br>`urls: ['/category/[slug]', '/shop', '/']` | Product detail pages untouched. |
| **Customizer / Banner / Section Edit** | `revalidateTag('banners')`<br>`revalidateTag('homepage')`<br>`revalidateTag('homepage_sections')`<br>`revalidatePath('/')` | `tags: ['homepage', 'banners']`<br>`urls: ['/']` | Product & Shop pages stay 100% cached. |
| **Review Moderation (Approve/Reject)** | `revalidateTag('reviews-[productId]')`<br>`revalidateTag('reviews')`<br>`revalidatePath('/product/[slug]')` | `tags: ['product-[slug]', 'reviews']`<br>`urls: ['/product/[slug]']` | Only that product page refreshes. |
| **Global Theme / Store Settings** | `revalidateTag('settings')`<br>`revalidatePath('/', 'layout')` | `purgeCloudflareEverything()` (`purge_everything: true`) | Root layout (header/footer/colors) refreshed globally. Rare, manual action. |
| **Customer Order Placement** | Local state / tags only | **NO Cloudflare Purge** (Quota Protection) | 0 Cloudflare API calls spent. Zero CPU. |

---

## 5. Safety Net & Cache Headers Discipline

### 5.1 Cloudflare Edge TTL (10 Minutes)
* `html-pages` cache rule has `edge_ttl: { mode: 'override_origin', default: 600 }` (10 minutes).
* *Purpose:* Acts as an automatic self-healing safety net. Even if a niche paginated search URL (`/shop?page=3&sort=price_desc`) was not explicitly tagged, it self-heals within 10 minutes.
* Real-time admin updates never wait for the 10-minute TTL because targeted tag/URL purges bust the edge in < 150ms.

### 5.2 Browser TTL = 0 (Respect Origin)
* Cloudflare `browser_ttl: { mode: 'override_origin', default: 0 }`.
* Visitor mobile/desktop browsers NEVER store HTML on disk. Every visit validates with Cloudflare Edge. This guarantees that once the edge is purged, the customer immediately sees the new content without browser-cache locking.

### 5.3 Dynamic Routes Bypass
* `/cart`, `/checkout`, `/account`, `/admin`, `/api`, `/wishlist`, `/order` MUST have `cache: false` on Cloudflare and `Cache-Control: no-store` on origin.

---

## 6. Server-Side Stock & Price Integrity (RULE C16)

Because storefront pages can be served from edge cache, checkout must NEVER trust client-submitted prices or stock numbers.

In `lib/services/orders/create.ts`:
1. **DB Verification**: Queries live product & variant rows via `supabaseAdmin` for every item in `order.items`.
2. **Active & Deleted Check**: Rejects any product where `is_active === false` or `deleted_at !== null`.
3. **Live Stock Verification**: Rejects any item where `item.quantity > dbProduct.stock` (or `dbVariant.stock`), throwing an informative user-facing error:
   `"Insufficient stock for [Product Name] ([N] available)."`
4. **Zero-Purge Policy on Orders**: Orders deduct stock via DB RPC (`deduct_stock_for_order`). They DO NOT trigger Cloudflare purges, preserving the Cloudflare Free 5-purges/min limit during flash sales or ad campaigns.

---

## 7. No-Store Leak Prevention & SSG Preservation (RULE C17)

In Next.js App Router, if a Server Component executes a `fetch()` with `{ cache: 'no-store' }` or calls an uncached `supabaseAdmin` query, Next.js marks the **entire route dynamic SSR** (`cache-control: private, no-store`). This disables Vercel's ISR CDN and causes `x-vercel-cache: MISS`, forcing Vercel to burn 200–500ms of Fluid CPU on every cache miss.

### Prevention Checklist:
1. Every DB query on storefront pages (`/product/[slug]`, `/category/[slug]`, `/`, `/shop`) MUST be wrapped in `unstable_cache`.
2. Example — `getProductSeoMeta`:
   ```ts
   const fetchProductSeoMeta = async (productId: string) => {
     const { data } = await supabaseAdmin.from('seo_meta').select('*').eq('entity_id', productId).maybeSingle();
     return data;
   };

   const getProductSeoMeta = cache(async (productId: string) => {
     const { unstable_cache } = await import('next/cache');
     return unstable_cache(
       () => fetchProductSeoMeta(productId),
       [`product-seo-meta-${productId}`],
       { revalidate: 2592000, tags: [`product-${productId}`, 'seo_meta'] }
     )();
   });
   ```
3. Verify in `npm run build`:
   `/product/[slug]` MUST display as **`● (SSG)`** (Prerendered as static HTML). It must NEVER be `ƒ (Dynamic)`.
