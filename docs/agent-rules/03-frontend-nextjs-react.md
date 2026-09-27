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

