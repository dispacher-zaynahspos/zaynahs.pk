# AUDIT PASS 5 — Cache + Purge Trigger Verification

Status: **audit complete; stale-at-edge gap fixed + verified (tsc = 0 errors, incl. a latent pre-existing build error uncovered & fixed).**

## Cache layers (as-built)
1. **Supabase** — source of truth.
2. **Next.js data cache** — `unstable_cache`/fetch tags (`products`, `categories`, `settings`, `homepage`, `collections`, `coupons`, `reviews`, `size_guides`, `social_proof`, `payment_methods`, `shipping_methods`, …) + `revalidatePath`.
3. **Vercel / Cloudflare edge** — full-page HTML cache; invalidated via `purgeCloudflareEverything()` (full-zone `purge_everything`, multi-store aware).
4. **Browser** — normal HTTP caching.

Canonical invalidation lives in `lib/revalidate.ts`. Per-slug domains (`revalidateProduct/Category`) + broad domains (`revalidateBanner/Homepage/Settings/Vertical`) each do tags + paths + **full Cloudflare purge**. `revalidateEntity` is the RULE-C10 shared entry (used by `/api/seo/optimize`; most paths call the specific revalidator directly, which is acceptable).

**Full-zone purge is intentional** (AGENTS.md RULE C9): URL-scoped CF purges silently miss on www/protocol mismatches in this multi-domain setup, so a full-zone purge is the correct, reliable choice here — not over-broad by accident.

## The gap found: tag-only writes skipped the CDN edge
`revalidateTagSafe(tag)` invalidates only the Next.js tag — **no `revalidatePath`, no Cloudflare purge**. Several **storefront-visible admin** domains used it, so after an admin save the edge HTML could stay stale until TTL:

| Domain | Write fns (file) | Was | Now |
|---|---|---|---|
| Collections | `lib/services/collections.ts` (6 writes) | tag-only | **full edge purge** |
| Coupons | `lib/services/coupons.ts` (3) | tag-only | **full edge purge** |
| Badges | `lib/services/badges.ts` (3) | tag-only | **full edge purge** |
| Size guides | `lib/services/sizeGuides.ts` (5) | tag-only | **full edge purge** |
| Social proof | `lib/services/social-proof/mutate.ts` (5) | tag-only | **full edge purge** |
| Payment methods | `lib/services/paymentMethods.ts` (4) | tag-only | **full edge purge** |
| Shipping methods | `lib/services/shipping.ts` (4) | tag-only | **full edge purge** |

### Fix
Added `revalidateStorefrontEdge(...tags)` to `lib/revalidate.ts`: invalidates the given tags + `revalidatePath('/','layout')` + `/shop` + `/admin` + `purgeCloudflareEverything()`. Swapped every `revalidateTagSafe(...)` in the 7 admin domains above for an awaited `revalidateStorefrontEdge(...)`. Now every storefront-visible admin save reaches all cache layers (RULE C10 satisfied).

### Deliberately left tag-only (correct)
- **Public review submission** (`lib/services/public-reviews.ts`, `/api/reviews/submit`) — inserts `approved:false` (hidden until moderation). Full-zone purging on anonymous submissions would let public traffic force repeated purges (cost/DoS). Admin approval (`reviews/admin-reviews.ts`) now goes through the edge purge — that's when the review becomes visible.
- **Admin review moderation** (`lib/services/reviews/admin-reviews.ts` — approve/hide/delete/update/restore/hardDelete/admin-custom, 7 sites) — **migrated** from paired `revalidateTagSafe('reviews')`+`('products')` to a single `revalidateStorefrontEdge('reviews','products')`.
- **Non-storefront domains** (orders, customers, abandoned carts, leads/subscribers, email templates, meta-category mapping, indexing logs) — render in admin/account (dynamic, uncached) — tag-only or none is correct.

### True MISSING (zero invalidation) — low impact, tracked
- `lib/services/media.ts` `restoreMedia`/`hardDeleteMedia`; `/api/media/upload` AI-meta write — media library ops; asset not attached to a product at that point. LOW.
- `lib/services/variantPresets.ts` + `trash.ts` variant-preset ops — admin product-editor tooling, not storefront-rendered. LOW.

## Manual "Purge Cache" button — VERIFIED
`components/admin/shared/PurgeCacheButton.tsx` → `lib/services/cache.ts` `purgeAllCache` → `revalidateSettings/Homepage/Banner` + direct Cloudflare `purge_everything` across all zones + writes `last_*_purge` timestamps. Reaches full-zone purge. Also wired in `SettingsSaveBar.tsx`. Correctly scoped as an emergency fallback (RULE C10: normal saves don't depend on it).

## Customizer autosave — VERIFIED
- Settings autosave → `updateSettings` → `revalidateSettings` (full purge).
- Section autosave → `updateHomepageSection`/`reorderHomepageSections` → `revalidateBanner` (full purge).
- "Save Layout" → `/api/revalidate-customizer` → `revalidateHomepage/Banner/Settings` + `purgeAllCache`.

## Bonus fix
A latent pre-existing type error (`lib/services/products/trash.ts:60`, Supabase multi-relation select inferring a non-`DBProductRow` union) was masked by stale `tsconfig.tsbuildinfo` and surfaced during full recheck. Fixed with the same cast pattern used elsewhere — would otherwise have broken `next build` (no `ignoreBuildErrors` in `next.config.ts`).

## Decisions made
- Canonical storefront-visible admin invalidation = `revalidateStorefrontEdge(...tags)`. No storefront-visible admin write may use bare `revalidateTagSafe`.
- Full-zone Cloudflare purge retained (RULE C9). Public/high-frequency writes stay tag-only by design.
