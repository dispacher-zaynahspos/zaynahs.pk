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
