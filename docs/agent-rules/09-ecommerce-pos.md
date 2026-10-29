# 09 — E-commerce / POS Specific Rules

- Stock/inventory changes must be atomic + logged (no double-sell).
- Payment flow (JazzCash/EasyPaisa): graceful fallback, silent fail is banned.
- Order/sale data must never be lost — offline queue/sync retry.
- PKR pricing format must be consistent across POS and storefront.

## Multi-project reference table
> **Source of truth = `env-backups/*.env.local`**. Scan that folder before any multi-store operation. Full details + RULE CRED-ENVBACKUP: [26-project-reference-table.md](26-project-reference-table.md).

| Project | Supabase Ref | Cloudflare Zone ID | Site URL |
|---------|-------------|------------|----------|
| TotVogue | ziucrfpebpxijqhwmqre | e4aceeacdc4f6a1677e92823df1651fd | www.totvogue.pk |
| Zaynahs | unfdpfmjqljbjydgsccr | 10d964449186f64d7896f8dcac4e5eff | www.zaynahs.pk |
| MiniMahal | mgwkcumurrllhpjvfezz | 6acd493022cd0f2d5a9c290088b5327a | www.minimahal.com |
| LittleMister | ljknmwianiswkalifueb | 063a3d5c72d44b3654aa60b17ed94863 | www.littlemister.pk |
| Lobo | kixsxgyfiovtaxsuflfy | 645e99188d3241324e154045a4c9a8db | www.lobo.pk |


(Full credential map: [26-project-reference-table.md](26-project-reference-table.md).)

## No customer accounts (also see RULE A2 in autonomy/architecture context)
Customers do NOT register or log in. Cart is stored in `localStorage` via Zustand `persist`. Orders go via WhatsApp only — see [10-whatsapp-order-flow.md](10-whatsapp-order-flow.md).

## RULE E1 — Inventory must be deducted exactly once (STRICT)

Migration `20261023000000_stock_deduction_on_order_creation.sql` added
`orders.stock_deducted_at` and `public.deduct_stock_for_order(uuid)`.

- Deduction happens **once** per order (idempotent marker), inside the order-creation
  path, via `adjust_item_stock()` (clamped at 0, variant stock recomputes product stock).
- `restore_stock_on_cancel()` restores **only** orders that were actually deducted
  (`stock_deducted_at IS NOT NULL`). Legacy/manual-stock orders return 0 — restoring them
  would invent inventory. Un-cancel (negative quantities) re-arms the marker.
- `adjust_stock_on_order_edit()` is a no-op for orders that were never deducted.
- **Opt-in:** `AUTO_DEDUCT_STOCK=true` in the store's Vercel env. Default **false** because a
  store that decrements stock by hand would otherwise be counted twice (auto + manual).
  Never enable it on a store whose staff edits stock after every order.
- Failures must never block checkout: the call is awaited but only logged; reconcile with
  the order timeline entry "Inventory deducted for N item line(s)".

## RULE E2 — Multi-Platform Catalog Sync & Data Feed Architecture (Meta, TikTok, Google)
Applies universally across all current stores (TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo) and ALL future clones:

1. **Zero Hardcoded Domains (Complete Clone & Domain Independence)**:
   - Every store/clone operates its own independent catalog feed and sync endpoints (`/api/meta/catalog.xml`, `/catalog.xml`, `/api/meta-sync/bulk`).
   - Domain resolution is STRICTLY dynamic via `getSiteUrl(settings)` (server-side) and `window.location.origin` (client-side). Hardcoding any store domain (e.g. totvogue.pk, zaynahs.pk) in catalog feeds or mappers is strictly forbidden.
   - Each clone feeds its own separate Meta / TikTok Commerce Manager catalog.

2. **Variant Clustering vs Standalone Products (Duplicate ID Invariant)**:
   - **Products with Variants**: Only active variants are emitted as catalog items (`id = variant.id`, `item_group_id = parent.id`). The parent product itself MUST NEVER be emitted as a standalone item alongside its variants.
   - **Simple Products (No Variants)**: Emitted with `id = product.id` and `item_group_id` MUST be completely omitted.
   - Violation causes Meta's fatal `"18 products have duplicate product and group IDs"` clustering error.

3. **Dual-Sync Strategy (Real-time Graph API + Scheduled Feed URL)**:
   - **Instant Layer**: Admin CRUD actions (save, update, delete) trigger immediate Graph API sync and cache revalidations within 2-3 seconds.
   - **Self-Healing Layer**: Standard RSS 2.0 / Google & Meta compliant XML Data Feed (`/api/meta/catalog.xml`) is scheduled hourly in Meta Commerce Manager. It auto-heals any missed items, price updates, stock changes, and deleted items without manual intervention.
   - Batch `DELETE` calls to Meta Graph API MUST include `{ data: { id: retailer_id } }`.

4. **Extensibility for Future Platforms (TikTok, Google Merchant, Pinterest)**:
   - All catalog mappers and feed generators live in modular folders (`lib/meta/`, `lib/catalog-feeds/`).
   - TikTok Catalog and Google Merchant feeds MUST reuse the same single source of truth product mapping logic to ensure price, inventory, and variant clustering consistency across all ad platforms.

5. **Self-Reconciling Ghost Variant & Stale Image Purge Invariant**:
   - In Meta Graph API, when variants are updated, regenerated, or an article image is replaced, Meta NEVER deletes old variants automatically.
   - `syncProductToMeta` MUST query existing Meta items under `retailer_product_group_id` and explicitly emit `DELETE` for any ghost variant IDs or legacy standalone parent IDs that no longer exist in the current DB product.
   - Every store and clone MUST register its `/api/meta/catalog.xml` Data Feed in Meta Commerce Manager (`update_type: REPLACE`, interval: `HOURLY`) to ensure the catalog continuously self-heals and prevents ghost variants or wrong images from lingering.

## RULE E3 — Trashed Data Isolation & Reporting Integrity (STRICT)
1. **Zero Trash Leakage in Reporting & Dashboards**:
   - Trashed orders (soft-deleted with `deleted_at IS NOT NULL` or `status = 'trash' | 'deleted'`) must **never** appear or be counted anywhere across Admin Dashboard, Financial/Sales Reporting, Live Feeds, Revenue Charts, Top Products, Status Breakdown, or Payment Ledgers.
   - All queries, filters, and calculation utilities (`getOrders()`, `filterOrders()`, `computeMetrics()`, `ReportingDashboard.tsx`, `DashboardClient.tsx`) must strictly filter out `deleted_at` and `trash`/`deleted` status rows defense-in-depth.
2. **Revenue Calculation Purity**:
   - Sales, revenue, profit, and AOV calculations must strictly exclude cancelled, refunded (`status = 'cancelled' | 'refunded'` OR `payment_status = 'refunded'`), and trashed orders.
3. **Customer History & Public Tracking Defense**:
   - Customer profile order lists (`getCustomerOrders()`, `getOrdersByCustomerId()`), lifetime customer spend (`getAdminCustomers()`), social proof ticker (`getRecentBuyersPublic()`), and guest order tracking (`trackOrder()`) must strictly exclude trashed and cancelled/refunded orders so public trackers and customer metrics are never corrupted.


