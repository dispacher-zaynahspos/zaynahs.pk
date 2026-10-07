# 03 — Frontend Rules (Next.js / React)

- Follow App Router conventions — correctly separate server vs client components.
- Every page/component must have loading states, error boundaries, and empty states.
- Env vars (`NEXT_PUBLIC_*`) properly prefixed + `.env.example` kept up to date.
- Optimize images, fonts, and SEO metadata per Next.js best practices.

## CRITICAL SAFE ACCESS RULE
Always use `product.images?.[0]?.url` and `product.images?.find()`.
NEVER use `product.images[0].url` or bare array methods without `?.`.
Supabase relationships can be empty, and unsafe access crashes the entire Next.js page (causes "This page couldn't load"). Same rule applies to `variants`.

## Centralized Icons Rule
- Single source of truth: `components/common/Icons.tsx`.
- Always `import { ShoppingCart, User } from '@/components/common/Icons'`.
- NEVER import directly from `lucide-react` (or any icon library) in pages/components.

## Component Baseline Rules
- Every product card: image top, name, price, "Add to Cart" button.
- Bottom sticky cart bar on mobile — always visible when cart has items, with responsive dark-mode backgrounds.
- Skeleton loaders on every data fetch. No page without a loading state.
- Toast notifications (sonner) for all actions.
- **Category links**: always `/shop?category=slug` — never a dedicated `/category/[slug]` route unless it redirects to the shop page.
- **Scroll & focus restoration**: every product card click saves scroll position via `saveScrollPosition(product.id)`; every listing/grid page calls `useScrollRestoration()` on back-navigation. Full detail: [19-navigation-state-restoration.md](19-navigation-state-restoration.md) RULE N1.
- **Modal/popup performance**: never use CPU-heavy blurs (`backdrop-blur*`) on overlays — use solid/opacity overlays (`bg-black/60`). Add `will-change-transform` + `transform-gpu` to scrollable/modal containers. Apply `overscroll-contain` + smooth touch config.

## Pagination Rule — Never Load Everything at Once
- Any place rendering a list or table of data (products, orders, customers, admin tables, logs, etc.) MUST NOT fetch or render the entire dataset in one go.
- Load the **first 20 items** only initially.
- Show a **"Load More"** button (or infinite scroll trigger) to fetch or render the next 20 items when clicked or reached.
- Applies **everywhere** — storefront listing pages, admin pages, dashboards, search results, dropdowns, tables, and grids.
- For server queries, fetch batches via paginated API queries (`limit`/`offset` or cursor) rather than fetching all rows and slicing client-side.
- Reuse a single shared pagination hook or component (`hooks/use-paginated-list.ts` or `components/shared/LoadMoreButton.tsx`) across all pages instead of writing custom pagination logic per page.

## RULE C1 — Never `headers()`/`cookies()` in store pages
See [08-caching-isr-ssr.md](08-caching-isr-ssr.md) — calling these in any store Server Component (especially `generateMetadata`) kills ISR for the whole page (or app, if in root layout). Allowed ONLY in `app/robots.ts`, `app/sitemap.ts`, `app/admin/**`, `app/api/**`.

## RULE H1 — Hydration-Safe Rendering (prevents React #418/#423)
Server-rendered HTML aur client ka pehla (hydration) render **bilkul identical** hone chahiye. Mismatch → `Minified React error #418` (page toot sakta hai / "This page couldn't load").

- ❌ NEVER read `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `performance`, `Date.now()`, `new Date()`, `Math.random()`, ya locale/timezone formatting **render phase** mein — isme `useState`/`useMemo`/`useReducer` ke **lazy initializer** bhi shamil hain (woh render par chalte hain).
- ✅ Initial state hamesha server-safe constant rakho (`{}`, `[]`, `0`, `false`, fixed string). Browser-dependent value `useEffect` (post-mount) mein set karo.
- ✅ "Mounted ke baad hi sahi" cheezein (live counts, countdowns/timers, random social-proof "X from Karachi bought…", recently-viewed from storage, viewer counts) ko `const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[])` se gate karo, ya `suppressHydrationWarning` lagao. Initial render mein in par branch mat karo.
- 📝 Precedent: `components/store/StoreFront.tsx` ka `loadMoreLimits` pehle `useState` initializer mein `sessionStorage` parh raha tha → #418 on back/forward nav. Fix: initial `{}`, restore in `useEffect`. (See `docs/LESSONS_LEARNED.md`.)


## RULE F1 — Instant Navigation & Latency Elimination (0ms perceived load — MANDATORY)
Applies universally across **ALL tab scopes & functional areas** (Categories, Products, Reviews, Specs, Cart, Admin Settings, Bottom Nav) and across all store surfaces (Current and Future):

### 1. Mandatory Architecture for Every Route & Tab
1. **Server Deduplication**: Wrap all SSR query functions in `React.cache()` (`lib/services/products/queries.ts`) so `generateMetadata` and `Page` share identical query results with 0ms second fetch.
2. **Parallel Server Execution**: Run all independent secondary server queries concurrently via `Promise.all([q1, q2, ...])` — never sequential `await` waterfalls.
3. **0ms Skeleton Feedback**: Every route MUST have a dedicated `loading.tsx` rendering an instant shimmer skeleton (zero frozen screen).
4. **Link Pre-fetching**: Viewport navigation links and catalog cards must have `<Link prefetch={true}>`.
5. **Scoped Client Hydration**: Client components must fetch only needed IDs (`getProductsByIdsClient`), never the full store catalog.
6. **Tabs & Category Chips (0ms Instant Switch)**:
   - **Storefront Category Chips**: Use shallow URL updates (`router.replace(`${pathname}?category=${id}`, { scroll: false })`) with client in-memory filtering — **zero full page reload, 0ms switch**.
   - **Mobile Bottom Navigation Tabs**: Prefetched `<Link>` + `loading.tsx` skeletons for app-like tab switches.
   - **Product Info Tabs (Description/Reviews/Specs)**: Pure client-side state on pre-loaded props — zero network wait on tab tap.
   - **Admin Tabs (`/admin/settings?tab=...`)**: URL-persisted `useAdminTab` + React `<Suspense fallback={<TabSkeleton />}>` + form memory preservation.

### 2. Forbidden Anti-Patterns
- ❌ NEVER leave a route without `loading.tsx` (frozen screen on tap is banned).
- ❌ NEVER run sequential `await` DB calls when queries are independent.
- ❌ NEVER download full catalog JSON on client components.
- ❌ NEVER trigger a full page/layout reload on category chip or tab clicks.
Full guide with Before/After code snippets: see `docs/UI_PERFORMANCE_GUIDE.md` Section 8.

## Fully unpacked design/system rules live in dedicated files
- Colors, tokens, radii, shadows → [14-design-system.md](14-design-system.md)
- Shared component map → [15-shared-components-ui-modules.md](15-shared-components-ui-modules.md)
- Mobile/native-app card & touch rules → [17-mobile-native-app-style.md](17-mobile-native-app-style.md)
- Navigation & state restoration → [19-navigation-state-restoration.md](19-navigation-state-restoration.md)


## RULE F2 — Draft-until-Save (NO auto-save in Settings or Customizer)
Verified 2026-10. Applies to EVERY Shop Settings tab and EVERY Customizer page (Home, Shop, Product Details, Product Cards, Global, Appearance/Presets), both brands, all devices.
- **No auto-save anywhere.** Edits (add / duplicate / delete / reorder / hide / rename / per-device override / any field change) update LOCAL draft state only.
- **Only the Save button** (`Save Layout` / `Save Settings`) writes to the DB, triggers cache revalidate/purge, and updates the live store. Forbidden: `useEffect`/debounce timers that persist on change, server-action DB writes inside add/duplicate/delete/reorder/toggle handlers, `onBlur`/`onChange` saves, edit-triggered `revalidate`/purge.
- **Preview** renders from the draft instantly (Customizer iframe is fed local state via postMessage); the live store changes only after Save.
- **Dirty UX (required):** Save shows an unsaved indicator when draft ≠ saved baseline, is disabled when clean, shows a loading spinner on save, and a success/error toast. Provide a **Discard** action that resets to the last-saved baseline, and a **beforeunload guard** that warns while dirty.
- **Shared state hook:** customizer draft lives in `components/admin/customizer-editor/hooks/useCustomizerState.ts` (`isDirty`, `handleDiscard`, `handleSaveLayout`, snapshot baseline via `savedSnapshotRef`). Settings form draft lives in `useSettingsFormState` (explicit `handleSubmit`). New tabs/pages MUST reuse these — no per-page save copies.
- **Section persistence model:** `handleAddSection`/`handleDuplicateSection`/`handleDeleteSection` are LOCAL only (client `crypto.randomUUID()`); `saveHomepageSections(draft)` reconciles the DB on Save (insert new, update changed, delete removed, write sort_order) and purges cache ONCE. `buildSectionDefaults(type)` is the SSOT for new-section defaults (used by both local-add and the server insert).
- **Verify:** add section → nothing saved; reload without Save → change gone; press Save → persists + live store updates + cache purged.

## RULE F3 — Instant admin navigation + skeleton loading (every route)
Verified 2026-10. Every admin tab click must respond INSTANTLY and show a skeleton while data streams — never a blank/frozen wait.
- **Prefetch**: all admin nav links use `<Link href=... prefetch>` (desktop sidebar `components/admin/layout/AdminDesktopSidebar.tsx`, `AdminMobileDrawer.tsx`, `AdminMobileBottomBar.tsx`). Never navigate heavy pages with `router.push` without prefetch.
- **Skeleton per route**: every admin route segment has a `loading.tsx` (Next.js App Router renders it instantly on navigation via the Suspense boundary). Examples: `app/admin/inventory/loading.tsx`, `app/admin/variants/loading.tsx`, `app/admin/media/loading.tsx`, `app/admin/customers/loading.tsx`, `app/admin/reviews/loading.tsx`, `app/admin/collections/loading.tsx`, `app/admin/traffic/loading.tsx`, plus the shared fallback `app/admin/loading.tsx`. Reuse shared skeleton primitives from `components/common/LoadingSkeleton.tsx` (`AdminTableSkeleton`, `AdminStatsSkeleton`, `AdminSettingsSkeleton`, `GridSkeleton`, `DetailSkeleton`).
- **Any NEW admin route MUST ship a `loading.tsx`** matching the page shape (table vs grid vs detail).

## RULE F4 — Lean list queries (no over-fetch, DB-friendly)
Verified 2026-10. List/table views must fetch only what they render.
- Do NOT `select('*')` + every nested relation for a list that only needs a few fields. Example: admin Inventory (`lib/services/products/queries.ts` `getAllProductsAdmin`) selects `product_images, product_variants, categories, product_categories` only — it dropped `product_modifiers, badges, size_guides` because `InventoryManager.tsx` / `inventory-manager/InventoryTable.tsx` never read them.
- `mapProduct` (`lib/services/products/mappers/dbToProductMapper.ts`) tolerates missing relations (`?? []` / `? :`), so trimming a list query is safe — detail pages still fetch the full relation set.
- Pair every list filter/sort with an index (see RULE C11 + migration `20261007130000_add_product_listing_indexes.sql`). Reuse the singleton `staticSupabase`/`supabaseAdmin` client — never create a client per request.

## RULE F5 — Instant tab switching (`useAdminTab`: local state + `history.replaceState`, NEVER `router.replace`)
Verified 2026-10. Admin tab bars (Settings: General/Header/Footer/Navigation/Products/Trust/Customizer/WhatsApp/Shipping/Courier/Coupons/Policies/Profile/Premium/Pixels/AI/Email/Meta Sync; Media; Customers; Leads; Reviews) MUST switch **instantly** (0ms, pure client render) — no server round-trip, no "stuck"/frozen feeling.

### Root cause of the old lag (do not reintroduce)
`useAdminTab` previously called `router.replace(`${pathname}?tab=...`)` on every tab click. On admin pages that are dynamic (`export const revalidate = 0` / `force-dynamic`), `router.replace()` triggers a **full RSC refetch of the route** → the server re-runs the page's data fetch (e.g. Inventory = whole catalog) before the tab visually changes → multi-second "stuck" switch with no feedback.

### The required mechanism (SSOT: `lib/hooks/useAdminTab.ts`)
- Tab lives in **local React state**, seeded once from the URL `?tab=` param.
- Switching updates state **instantly** (synchronous client render) and writes the URL via **`window.history.replaceState(...)`** — this changes the address bar for refresh/back persistence (RULE NAV1) WITHOUT any Next.js navigation or server refetch.
- A `useEffect` keeps local state in sync if the URL changes externally (back/forward, deep link).

```ts
// lib/hooks/useAdminTab.ts  (the ONE shared hook — every admin tab bar uses it)
const [activeTab, setActiveTab] = useState<T>(
  () => (searchParams.get(paramName) as T) || defaultTab
);
useEffect(() => {               // external URL change (back/forward/deep link) → sync
  const urlTab = (searchParams.get(paramName) as T) || defaultTab;
  setActiveTab((prev) => (prev !== urlTab ? urlTab : prev));
}, [searchParams, paramName, defaultTab]);

const setTab = useCallback((tab: T) => {
  setActiveTab(tab);            // ✅ instant client switch
  const params = new URLSearchParams(window.location.search);
  tab === defaultTab ? params.delete(paramName) : params.set(paramName, tab);
  const query = params.toString();
  window.history.replaceState(window.history.state, '', `${pathname}${query ? `?${query}` : ''}`); // ✅ URL only, no RSC refetch
}, [pathname, paramName, defaultTab]);
```

### Rules
- ❌ NEVER use `router.replace()`/`router.push()` purely to change a tab query param on a dynamic admin page.
- ✅ Tab content panels render conditionally from already-loaded client state (`useSettingsFormState`, etc.) — switching tabs must not fetch.
- ✅ Combine with RULE F3 (`loading.tsx` skeleton) for the initial route load, and RULE F4 (lean queries) so the first data arrival is fast too.
- Callers (reuse, do not re-implement): `components/admin/SettingsForm.tsx`, `components/admin/MediaManager.tsx`, `app/admin/customers/page.tsx`, `app/admin/leads/page.tsx`, `app/admin/reviews/page.tsx`.

### Verify
Click between Settings tabs → each switch is instant (no spinner, no blank); URL `?tab=` updates; refresh keeps the tab; browser Back restores the previous tab.
