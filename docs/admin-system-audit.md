# Admin System — Phase 0 Deep Audit

Scope: Orders, Customers, Leads, Abandoned Carts, Contact Messages, Reviews/Badges/Custom content, Shop Settings (Premium, Coupons, Shipping, Courier, Flash Sale, Footer, Purge).
Stack: Next.js App Router + React/TS + Tailwind + Supabase (Vercel + Cloudflare).
Status: **READ-ONLY AUDIT. No code changed.** Awaiting approval before Phase 1.
Design constraints for all later phases: follow `docs/UI_RULES.md` (§9 popup scroll, §10 card interaction, PRICE1), `docs/agent-rules/14` (maroon/pink theme, tokens), `15` (shared components — one DataTable/PageHeader/EmptyState/StatusBadge/MoneyText/DateText), `17` (mobile cards), `23` (300–400 line files), `27` (SSOT1), `05`/`CLONE2` (UUID + snake_case + RLS on every table, master schema + setup MD stay current). Money = numeric via one `money` util; timezone Asia/Karachi; PKR.

---

## 0. Executive summary — the 3 root diseases

1. **Structured data stored as free text.** Order address/phone/contact/coordinates/payment/discount are jammed into `orders.notes` as newline strings and re-parsed by fragile `substring`/regex in ~6 places. No `order_items`, `order_addresses`, or `order_events` tables. Editing silently drops labels not in a hardcoded allow-list.
2. **No single source of truth for money, status, aggregates, or feature surfaces.** Order totals computed client-side in 3 places; "paid" derived by string-sniffing `notes`; ratings computed 3 different ways; leads rendered on 2 pages; footer/social + purge duplicated; flash sale configured in 4 UIs across 3 tables.
3. **Fake/hardcoded UI state.** Order-detail "No orders" is a literal string (never queried) while the customer actually has orders; Reviews "Approve" tick shows on already-approved rows and silently un-approves; "Unknown Product" conflates deleted-product orphans with intentional store reviews; abandoned-carts skeleton never resolves on fetch failure.

Plus security: `customers` and `abandoned_carts` have `SELECT USING(true)` RLS → **anon can read all customer PII incl. `password_hash`/`reset_token`** (critical).

---

## 1. Data model map (ERD) + relation issues

### Core tables (from `supabase/schema/SUPER_MASTER_SCHEMA.sql`)
- `orders` (721-749): `customer_id → customers(id) ON DELETE SET NULL`; `items JSONB` (no `order_items` table); address in `notes TEXT`; `status TEXT` free-text (no enum); `status_logs JSONB`; money cols `subtotal/total/discount_amount/shipping_amount NUMERIC(10,2)`. **No `payment_status`, no `fulfillment_status`, no `order_addresses`, no `order_events` table, no `tax`, no `cod_fee`, no `tags`.**
- `customers` (708-719): `email UNIQUE`, `phone UNIQUE`, `password_hash`, `reset_token`, soft-delete. Guest vs registered distinguished only by `password_hash IS NULL` (no `is_guest`).
- `whatsapp_subscribers` (1080), `email_subscribers` (1428): leads. No `converted_customer_id`, no `status`, no `consent`.
- `abandoned_carts` (1584): `session_id` (NOT unique despite upsert-by-session), `order_id → orders ON DELETE SET NULL`, has structured address cols (unlike orders!). No `deleted_at`.
- `contact_messages` (2055): clean (public INSERT only, service_role read). `status new|read|archived` (`archived` unused).
- `reviews` (248): `product_id → products(id) ON DELETE SET NULL` (nullable), no `status` enum (booleans `approved`/`hidden` + `deleted_at`), no `verified_purchase`/`order_id`, media in `images TEXT[]` (no `review_media` table).
- `social_proof` (272) + `social_proof_products` (295): custom posts, multi-product join.
- `badges` (113): label + colors only; `products.custom_badge_id`.
- `coupons` (988): `code/discount_type/value/min_cart_amount/active` — **no usage_limit, per_user_limit, expires_at, usage_count, scope**.
- `shipping_methods` (918), `payment_methods` (938): single source ✓.

### Relation / integrity issues
| Issue | Evidence | Impact |
|---|---|---|
| Orders address = free text | `useCartContainerState.ts:169-200` builds notes string; parsed at `OrderCustomerCard.tsx:214-257`, `useOrderDetailState.ts:79-101`, `useOrderCustomerEditing.ts:40-135` | Fragile; edit drops non-allowlisted labels |
| No `order_items` table | `orders.items JSONB` | No line-item queries/reporting/partial fulfillment |
| `customer_email` never written to order row | `create.ts:185-198` omits it (col exists) | Email only in notes text |
| Guest w/o phone+email → `customer_id NULL` | `create.ts:29` | Orphan orders, no customer link |
| Hard delete customer → orders `customer_id NULL` | FK `ON DELETE SET NULL` | Orders vanish from customer views |
| `status` untyped free text; code uses `placed`/`out_for_delivery` not in enum comment | schema:735, `OrderDetailCanvas.tsx:110` | Invalid states writable |
| `getOrderById` vs `mapOrder` divergent mappers | `read.ts:69-95` drops `customer_email`/`deleted_at` | SSOT violation |
| `reviews.product_id` nullable + SET NULL | schema:249 | "Unknown Product" orphans |
| review stats trigger omits `deleted_at IS NULL` | schema:1039/1045 | soft-deleted reviews still counted on cards |
| `abandoned_carts.session_id` not UNIQUE | schema:1584 | upsert-by-session unreliable |
| Missing indexes | orders(`customer_id`,`status`,`created_at`), reviews(`product_id`,`approved`) — verify | list/filter perf |

---

## 2. Duplicates / overlaps matrix (+ canonical)

| Duplicate | A | B | Canonical / action |
|---|---|---|---|
| **WhatsApp Leads** | `/admin/customers?tab=leads` (`CustomerLeadsTable`) | `/admin/leads` (`WhatsAppLeadsTab`) — both call `getWhatsAppSubscribers()` | **Keep `/admin/leads`** (richer: source/opt-in). Customers page → show count + link only. |
| **Footer & Social** | Settings `FooterTab` (superset + sanitize) | Customizer `GlobalSettings.tsx:102-198` (subset) → same columns, last-writer drift | **Canonical = Settings FooterTab**; customizer links to it. |
| **Purge Cache** | Header `PurgeCacheButton`→`purgeAllCache()` (full zone) | Save bar `/api/revalidate{tag:'settings'}` (tag only) | **Canonical full purge = header**; save bar shows only "Save & Publish" (auto-revalidate on save). |
| **Coupons** | Coupons tab (CRUD) | Premium "Store Coupon Discount Field" (`coupon_codes_enabled` gate) | Not dup — complementary. Keep both, label clearly. |
| **Courier Manager** | Sidebar link | Settings tab | Benign — 2 nav links → 1 page. Keep one entry point. |
| **Orders count** | Sidebar badge | Header "1 Orders" pill | **Single live source** (unfulfilled count from DB), both read it. |
| **Flash Sale** | 4 UIs / 3 tables (see §5) | | Unify into one model. |
| **Product Sale (per-product)** | `ProductFormFlashSaleSection` | customizer `ProductSaleSubTab` | One editor; other links to it. |

---

## 3. Calculation audit

- **Order totals**: 3 client-side implementations — `useCartContainerState.ts:120`, `OrderEditor.tsx:41-43`, `useOrderCreateCanvasState.ts:161`. Server stores client values verbatim (`create.ts:189-194`), **no server recompute/validation**. → Central `calculateOrder()` pure fn (server) used by cart + admin edit + create. Money via `money` util (integer/numeric, no float).
- **Shipping "200 vs 299"**: no `299` in code (only a preview mock price `StyleGuide.tsx:208`). Real defaults: storefront/fallback/seed = **200** (`useCartContainerState.ts:92`, `useCartMethods.ts:41`, seed migration), admin-create default = **0** (`useOrderCreateCanvasState.ts:35`). Any `299` seen live = a `shipping_methods.cost` DB row. → Single shipping resolver; admin-create must read same source (not `0`).
- **Customer LTV**: `ordersCount` counts cancelled but `totalSpent` excludes cancelled (`admin.ts:22-33`) — inconsistent. Aggregate avg is client math (`page.tsx:132-138`). → DB view/RPC single source.
- **Review aggregates**: 3 sources — trigger `products.rating` (defaults 5.0, counts soft-deleted), live `getAverageRating` (excludes soft-deleted, used by product page + JSON-LD), `/reviews` page pads social proof as 5★. → one trigger/RPC, `deleted_at`-aware, used everywhere.
- **"Paid" status**: derived by sniffing `notes` payment text (`useOrderDetailState.ts:92-101`). → real `payment_status` column.

---

## 4. Broken / fragile spots (confirmed)

1. Order detail shows only Total; subtotal/shipping/discount exist but not rendered (`OrderDetailCanvas.tsx:245-250`) — breakdown only in edit mode.
2. Order "No orders" is a hardcoded literal (`OrderCustomerCard.tsx:159-164`) — never queries; customer actually has orders.
3. Reviews Approve tick shows on approved rows + silently un-approves on re-tap (`ReviewsTable.tsx:107-117,199-212`); no reject/spam; approving force-unhides.
4. "Unknown Product" conflates deleted-product orphans with intentional store reviews (`is_manual` stored but unused for labelling).
5. Abandoned-carts skeleton never resolves if fetch fails/hangs (single `loading` flag, no error state) (`AbandonedCartTable.tsx:39`); stats read 0 meanwhile.
6. Default `'today'` filter hides history: `leads/page.tsx:22`, `useAbandonedCartsData.ts:16` (email-subs tab NOT filtered → inconsistent).
7. Cut-off search placeholder on `sm:max-w-md` (`abandoned-carts/page.tsx:77`).
8. Duplicate page title (header `<h2>` + page `<h1>`) on Messages (`AdminHeader.tsx:36` + `messages/page.tsx:75`) and Abandoned Carts.
9. Notes round-trip data loss on customer edit (allow-list only) (`useOrderCustomerEditing.ts:104-116`).
10. Dedupe inconsistency: order path normalizes phone, signup path doesn't (`auth.ts:87-91`).
11. No audit trail, no order state machine, no inventory restock on cancel, refund column exists but no refund action.

---

## 5. Flash Sale — 4-piece map (unify target)
Compute already unified in `lib/services/products/mappers/flashSaleDiscounts.ts` (precedence: global → section-product → per-product → section-category). Config fragmented:
- (a) master gate `flash_sale_enabled` (Premium checklist)
- (b) storewide `flash_sale_start/end_date` + `global_flash_sale_discount_*` (`store_settings`)
- (c) homepage `flash_sale` section (`homepage_sections` JSON)
- (d) per-product `products.flash_sale_*` (edited in 2 UIs)
→ **Target**: one `flash_sale` settings model + schedule (end>start, PKT), targeting (product/collection/store), one editor; storefront banner/countdown/grid all read it.

---

## 6. Premium toggles — wired vs dead
Wired ✅: Recent Buyers, Cookie Consent, Free Shipping Bar, Low Stock Urgency, Flash Sale Countdown, Social Feeds, Cart Expiry, Size Guide, Coupon Field, Live Viewer, Volume Discounts, Related Products, Premium Themes.
**DEAD ❌: Frequently Bought Bundles** (`frequently_bought_together_enabled`) — saved + in flag map (`premium.ts:42`) but **no `isFeatureEnabled` consumer**; bundle renders on per-product ids only (`ProductDetail.tsx:233`). → wire or remove.

---

## 7. Security / RLS (critical)
| Table | Policy | Risk |
|---|---|---|
| `customers` | `Public read customers USING(true)` (schema:864) | **CRITICAL — anon reads all PII incl. `password_hash`, `reset_token`, email, phone.** Must restrict to service_role. |
| `abandoned_carts` | `Admin read ... USING(true)` (schema:1623) | **HIGH — anon reads cart PII (name/email/phone/address).** Restrict to service_role. |
| `reviews` | `Public read USING(approved=true)` only | soft-deleted/hidden-but-approved readable by anon (masked by app filters). Add `hidden=false AND deleted_at IS NULL`. |
| `contact_messages`, `whatsapp_subscribers`, `email_subscribers` | public INSERT only ✓ | correct. |

(These RLS fixes are additive `CREATE OR REPLACE POLICY` — reviewable migration, apply after verifying admin uses `supabaseAdmin`/service_role which it does.)

---

## 8. Recommended target schema (Phase 1)
New/changed (all additive + backfill, backward-compatible; nothing dropped without approval):
- `order_items` (order_id FK, product_id, variant_id, name/sku/image snapshot, unit_price, qty, item_discount, line_total) — backfill from `orders.items` JSONB.
- `order_addresses` (order_id FK, type shipping/billing, name, phone, address1/2, city, postal, country, lat, lng) — **backfill by parsing `orders.notes`** (dry-run report first; keep notes as fallback).
- `order_events` (order_id FK, type, actor, payload JSONB, created_at) — timeline.
- `orders`: add `payment_status`, `fulfillment_status` (enums w/ CHECK), `tax_amount`, `cod_fee`, `tags TEXT[]`, `customer_email` populated.
- `coupons`: add `usage_limit`, `per_user_limit`, `usage_count`, `starts_at`, `expires_at`, `scope`, `stackable` + `coupon_redemptions` table.
- `reviews`: add `status` enum (pending/approved/rejected/spam) mapped from booleans (keep booleans during transition), `verified_purchase`, `order_id`.
- `leads`: add `source`, `status`, `consent`, `converted_customer_id`.
- DB views/RPC: `customer_stats` (order_count, lifetime_spent, aov, first/last order), review aggregates (deleted_at-aware).
- `audit_log` table (actor, action, entity, before/after, at).
- Order number: keep DB trigger (already race-safe); drop unused `order_number_seq`.
- Fix RLS (§7). Add missing indexes.

Order state machine (typed, one module): payment_status × fulfillment_status × status with allowed transitions; invalid rejected.

---

## 9. Migration & risk plan
- **Before Phase 1: Supabase snapshot/backup of live data (orders, customers)** — user action or staging project. Flagged per prompt.
- Every migration: additive + `IF NOT EXISTS`, backward-compatible, reversible (down script), backfill as separate dry-run script with report. No drop/rename/data-delete without explicit approval.
- Apply order: (1) RLS PII fix (critical, low-risk), (2) new tables + backfill dry-run, (3) columns + enums, (4) views/RPC, (5) audit_log. Each applied to all 4 stores via `scripts/apply-migration-all-stores.mjs` + verify, master schema + setup MD updated (CLONE2).
- Highest risk: `order_addresses` backfill (free-text parse) — must keep `notes` intact as fallback, dry-run + manual spot-check before switching UI to structured fields.

**Phase risk order (low→high):** RLS fix → duplicates/UX cleanup (leads, titles, filters, skeleton) → reviews state machine → customer stats view → order_items/addresses backfill → order state machine + payment/fulfillment → coupon engine v2 → flash-sale unification.

---

## 10. Open decisions (need your call before Phase 1)
1. **DB backup/staging** taken before migrations? (strongly recommended)
2. `order_addresses` backfill: parse legacy `notes` now, or only structure NEW orders and leave old ones as notes-fallback?
3. Customers with orders: **block delete** (archive/anonymize only) — confirm.
4. Reviews: migrate booleans→`status` enum (keep both during transition) — confirm.
5. Fix `customers`/`abandoned_carts` public-read RLS immediately (critical) — confirm I can ship that migration first.

**STOP — awaiting approval / "next" to begin Phase 1 (Foundation).**
