# AUDIT PASS 1 — Navigation, Links, Tab Wiring, Admin↔Store Flow

Status: **audit complete; fixes applied where non-destructive**. Method: static trace of `components/admin/layout/adminNavSections.ts`, `SettingsTabBar.tsx`, route existence under `app/admin/**`, and link/`router.push` references. Not yet verified against a running server.

## Result summary
- **Sidebar links: 100% resolve.** No DEAD or WRONG hrefs. Every item in `getNavSections` (`components/admin/layout/adminNavSections.ts:44-114`) maps to an existing route.
- **Settings tabs: all 18 map to real components** (`SettingsTabBar.tsx:21-40` → `SettingsTabRendererCore/Advanced`). `profile`, `courier`, `customizer` intentionally hit `default: null` because they are full routes navigated via `router.push`, not in-page tab switches — correct by design.
- No `coming soon` / stub / placeholder admin screens found (searched all of `app/admin`).

## Findings + fixes

### ✅ F1-1 (FIXED) — Orphan route `/admin/seo/bulk` + fake progress bar
`app/admin/seo/bulk/page.tsx` (renders the full `BulkConsoleClient` — live per-type progress, logs, stop control) had **no link/`router.push` anywhere** — completely unreachable. Meanwhile the SEO hub used `components/admin/BulkOptimizeCard.tsx`, a **second, duplicate** bulk implementation that fired `/api/seo/bulk` in one shot behind a **progress bar whose `current` counter never incremented** (fake/demo progress) — an SSOT violation + demo-look.
**Fix:** rewrote `BulkOptimizeCard.tsx` to navigate to the canonical `/admin/seo/bulk` console (`<Link href="/admin/seo/bulk">`), deleting the duplicate one-shot logic and the fake progress bar. The rich console is now the single reachable bulk experience. `tsc --noEmit` = 0 errors.

### 🔶 F1-2 (FLAGGED → Pass 6) — Contact form violates Rule #6 (email-only, no DB persistence)
`app/(store)/contact/page.tsx:19` → `/api/contact` → `lib/email/triggers/other-triggers.ts:22` `onContactForm` sends an **admin email** and **persists nothing**. This breaks Prime Directive #6 (WhatsApp-only, no email) and captures no lead. Correct permanent fix requires a `contact_messages` table + admin surface (so it isn't a partial/fake fix) → scheduled with the DB foundation work in **Pass 6** (additive numbered migration) and an admin list view under CUSTOMERS. Deferred deliberately rather than half-implemented.

### 🔶 F1-3 (noted) — `/product` slug-less route is dead-but-safe
`app/(store)/product/page.tsx` = `redirect('/')`, referenced by nothing (`href="/product"` exact = 0 matches). Harmless fallback guard; left in place. If a future cleanup wants zero dead code, it can be removed — negligible impact either way.

### Minor (→ Pass 10 polish, cosmetic, not broken)
- Label drift: sidebar "Premium" vs tab bar "Premium Features"; sidebar "Trust & Badges" uses `Shield` icon while tab bar uses `Zap`.
- No breadcrumbs in `AdminHeader.tsx` (only page title + "View Store" → `/` `target=_blank`, correct). Add breadcrumbs in Pass 10 if desired.
- `Reporting` is a standalone top-level nav section (`adminNavSections.ts:82`), not nested under REVIEWS as the reference spec listed — reachable, just placed differently. Left as-is (functional).

## Decisions made
- Bulk SEO: the `/admin/seo/bulk` console is canonical; the hub card is now just its entry point. One bulk code path, no fake progress.
- Contact-form fix intentionally deferred to Pass 6 to avoid shipping a half-wired capture with no admin visibility.
