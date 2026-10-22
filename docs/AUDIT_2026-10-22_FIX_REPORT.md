# 🔒 Audit & Fix Report — 2026-10-22 / 2026-10-23

Scope: codebase · Supabase (5 projects) · Vercel (5 projects) · Cloudflare (5 zones) · `env-backups/`
Method: live probes with the **public anon key**, live page loads, `tsc`, production build,
migration/schema sync check, per-store post-deploy smoke tests.

Stores: zaynahs.pk · totvogue.pk · minimahal.com · littlemister.pk · lobo.pk

---

## 1. What was actually broken (verified, not theoretical)

| # | Finding | Severity | Evidence |
|---|---------|----------|----------|
| 1 | Anyone with the public anon key could `SELECT * FROM orders` — customer name, phone, email, address, items and the `access_token` that unlocks `/order/<token>` | 🔴 Critical | REST `GET /orders` returned rows on 5/5 stores |
| 2 | `store_settings` secrets readable by anon (`ai_model_credentials`, `smtp_app_password`, `postex_api_token`, `content_keys`, `vision_keys`) — stores stored them in plaintext | 🔴 Critical | REST `GET /store_settings?select=ai_model_credentials` → 200 |
| 3 | Any visitor could `INSERT` an order directly into PostgREST, bypassing the honeypot / speed / phone shield in `createOrder()` | 🔴 Critical | `POST /orders` → 201 (test row created and deleted) |
| 4 | Every admin policy used `auth.role() = 'authenticated'` while **public signup was enabled** → self-signup = full DB admin | 🔴 Critical | `disable_signup:false` on 5/5, 79 policies inspected |
| 5 | `reviews` exposed `customer_email` / `customer_phone` to anon | 🟠 High | REST `GET /reviews?select=customer_email` → 200 |
| 6 | Cron auth bypass: `/api/cron/review-requests?secret=local-bypass` returned 200 **in production** | 🟠 High | live request |
| 7 | `/api/indexing`, `/api/indexing/batch`, `/api/indexnow`, `email-templates/*/send-test` had **no auth** (quota drain + open mail relay) | 🟠 High | code review + live 200 |
| 8 | Cloudflare `html-pages` rule forced a **30-day** edge TTL, so `private, no-store` `/shop` and `/product/*` were served from cache up to a month → stale prices, stock, sold-out badges, admin edits | 🟠 High | `cf-cache-status: HIT`, `age > 2600s` on a no-store page |
| 9 | Stock was **never deducted** on order creation, while cancel/edit paths already restored/adjusted it → inventory never went down, cancelling inflated it | 🟠 High | `create.ts` had no deduction call |
| 10 | `/api/search/products` returned **500** (invalid PostgREST relation `modifiers`, table is `product_modifiers`) | 🟡 Medium | live 500 + PostgREST `PGRST200` |
| 11 | Lobo's Vercel project had **no GitHub link**; production was 16 commits / 7 days behind | 🟡 Medium | `link: null`, deploy SHA `8604383` vs local `114c56f` |
| 12 | The earlier "secret column revoke" (`20260926180000`) was a **no-op**: a table-level `GRANT SELECT` covers every column, so `REVOKE SELECT (col)` did nothing | 🟡 Medium | grants inspection |

---

## 2. What was fixed

### Database (migrations, applied to 4/5 stores)
`20261022000000_security_lock_public_pii.sql`
- `orders`: dropped `Public select orders` + `Public insert orders`, revoked anon grants.
- `order_items`, `order_addresses`: anon INSERT revoked (service-role only).
- `reviews`: table SELECT revoked from anon, re-granted on public columns only.
- `store_settings`: anon table SELECT revoked (view `store_settings_public` stays the public path).
- **NEW** `public.admin_users` (email allow-list) + `public.is_admin()`
  (`app_metadata.role='admin'` **or** email in `admin_users`).
- Every policy that matched `auth.role() = 'authenticated'` rewritten to `public.is_admin()`
  (INSERT handled separately: `WITH CHECK` only).
- `disable_signup = true` on zaynahs, totvogue, minimahal, littlemister.
- Admin auth users tagged `app_metadata.role='admin'` → **no admin lockout** (existing sessions keep working).

`20261023000000_stock_deduction_on_order_creation.sql`
- `orders.stock_deducted_at` (idempotency marker).
- `deduct_stock_for_order(uuid)` — deducts once, clamped at 0, variant → product roll-up.
- `restore_stock_on_cancel()` — restores **only** orders that were deducted (legacy/manual-stock orders return 0); negative quantities (un-cancel) re-deduct.
- `adjust_stock_on_order_edit()` — no-op for orders that were never deducted.

### Code
- **NEW** `lib/services/orders/recent.ts` — `getRecentBuyersPublic()` server action (masked name + city + product only). Replaces the browser anon read of the whole orders table.
- `lib/services/customers/orders.ts` — customer history via `supabaseAdmin`, scoped by the signed customer session.
- `lib/services/reviews/public-reviews.ts` — explicit `PUBLIC_REVIEW_COLUMNS` instead of `select('*')`.
- `lib/services/product-search/server-search.ts` — `modifiers()` → `product_modifiers()` (500 fixed).
- `app/api/cron/review-requests/route.ts` — `local-bypass` is dev-only.
- `app/api/indexing/route.ts`, `app/api/indexing/batch/route.ts`, `app/api/indexnow/route.ts`,
  `app/api/email-templates/[type]/send-test/route.ts` — `requireAdmin()` guard.
- `lib/services/orders/create.ts` — calls `deduct_stock_for_order` **only** when `AUTO_DEDUCT_STOCK=true`.
- `lib/services/orders-client.ts` — deleted (unused).
- **NEW** `scripts/apply-security-lock.mjs` + `npm run security:lock` / `npm run security:verify`.
- **NEW** `scripts/lib/cf-cache-rules.js` — ONE shared CF rule source (both deployers import it);
  `html-pages` edge TTL hard-capped at **300s**.
- `scripts/clone-setup.mjs` — new `db:security` phase (clone setup stays in sync).

### Documentation / permanent rules
- `docs/agent-rules/32-security-public-data-lock.md` (SEC1–SEC9) + `AGENTS.md` index row 32.
- `docs/agent-rules/05-database-supabase.md` → RULE D19.
- `docs/agent-rules/07-deployment-vercel-cloudflare.md` → RULE CF-MANDATORY #6/#7 (300s ceiling + SSOT).
- `docs/agent-rules/09-ecommerce-pos.md` → RULE E1 (inventory deducted exactly once).
- `docs/SCHEMA_CHANGE_LOG.md`, `.env.example` (`AUTO_DEDUCT_STOCK`), `SUPER_MASTER_SCHEMA.sql`.

---

## 3. Verification results (final commit `0338b7d`, all 5 deployments READY)

```
tsc --noEmit ............................ 0 errors
next build .............................. ✓ compiled successfully
npm run check:setup ..................... ✓ 163/163 migrations reflected, triggers + env docs in sync

store          pages  auth  cron  anon-DB  cf-ttl
zaynahs         OK     OK    OK     OK      300s
totvogue        OK     OK    OK     OK      300s
minimahal       OK     OK    OK     OK      300s
littlemister    OK     OK    OK     OK      300s
lobo            OK     OK    OK    OPEN*    300s   (*DB lock blocked — see §4)
```

Per store: `/` `/shop` `/product/<slug>` `/reviews` `/cart` = 200 · `/admin/dashboard` = 307 → `/admin/login` ·
`/api/search/products` = 200 · `/api/reviews/global` = 200 · `/api/settings` = 200 · `/order/<token>` = 200 ·
login with bad credentials = 401 (no 500).

Anon probes (4 stores): `orders` 401 · `store_settings` secrets 401 · `reviews.customer_email` 401 ·
public review columns 200 · `store_settings_public` 200.

Guard probes (all 5): `/api/indexnow` 401 · `/api/indexing` 401 · `/api/indexing/batch` 401 ·
`email-templates/order_placed/send-test` 401 · `/api/cron/review-requests?secret=local-bypass` 401.

Stock function (zaynahs, inside a rolled-back transaction): stock **600 → 599** for qty 1,
second call returns **0** (idempotent), marker set — no live data changed.

---

## 4. Blocked — requires owner action (not doable via API from here)

| Item | Why blocked | Action |
|------|-------------|--------|
| **Lobo DB still open** (`orders`, `store_settings` secrets, `reviews` PII readable by anon) | Lobo's `SUPABASE_MGMT_TOKEN` returns **401 Invalid access token**, and the other stores' tokens get **403** (different Supabase org) | Create a fresh Personal Access Token (supabase.com → Account → Access Tokens) for Lobo's org → `env-backups/lobo.env.local` → then run `npm run security:lock -- --store=lobo` and apply `20261023000000_stock_deduction_on_order_creation.sql` |
| **Lobo redeploys** | Its Vercel project has no GitHub integration (`link: null`) → no auto-deploy on push | Install the Vercel GitHub app on `infolobopk-lgtm/lobo.pk`, **or** deploy with `npx vercel deploy --prod` (a `.vercel/project.json` for `lobo-pk` is present locally and gitignored) |
| **Secret rotation** | Keys were exposed in plaintext and are visible in DB/history | Rotate: zaynahs AI key · minimahal SMTP password + AI keys · littlemister AI/vision keys (totvogue was encrypted-only). Update in admin → Settings, never in code |
| **GitHub PAT in `.git/config`** | Remotes embed `https://<token>@github.com/...`; it appears in shell history/logs | Rotate the PAT on GitHub and switch remotes to SSH or the OS credential helper |

---

## 5. Enabling automatic stock deduction (per store, when ready)

Default is **OFF** — enabling it on a store whose staff edits stock by hand would double-count every sale.

1. Confirm the store does not manually decrement stock after each order.
2. Add `AUTO_DEDUCT_STOCK=true` to that store's Vercel env and redeploy.
3. Place one test order → the order timeline shows *"Inventory deducted for N item line(s)"* and the
   variant stock drops by the ordered quantity.
4. Cancel a **new** order → stock returns. Cancel an **old (pre-fix)** order → nothing moves
   (by design — it was never deducted).

---

## 6. Re-verify anytime

```bash
npm run security:verify     # plan for all stores
npm run security:lock       # apply (idempotent)
npm run check:setup         # migrations ↔ master schema ↔ clone docs
npx tsc --noEmit && npm run build
```
