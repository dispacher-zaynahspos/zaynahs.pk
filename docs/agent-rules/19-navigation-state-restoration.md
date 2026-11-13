# 19 — Navigation & State Restoration Rules (MANDATORY for new pages)

## RULE N1 — Storefront scroll & focus restoration (Single Source of Truth)
- **Engine**: Single canonical module `lib/navigation/navigationMemory.ts` + `<ScrollRestorer />` in `app/(store)/layout.tsx`. Zero duplicate hook files.
- **Card Click**: When a customer clicks any product card link, call `saveScrollPosition(product.id)` from `@/lib/navigation/navigationMemory`. Stores page path, scrollY, active limits, and product ID in navigation snapshots.
- **Back Return**: On browser back, `<ScrollRestorer />` in store layout centers the clicked card into the viewport (`card.scrollIntoView({ block: 'center' })`) and triggers `.scroll-restore-highlight` (Shopify pulse focus ring).
- **Forward Navigation**: Fresh forward navigations (opening a product, clicking nav link) synchronously pin the viewport to `(0, 0)` before paint — zero footer flash, zero bounce.
- **Rule**: Every product card link MUST call `onClick={() => saveScrollPosition(product.id)}` from `@/lib/navigation/navigationMemory`. Never create duplicate restoration hooks.

## RULE N2 — Admin URL-based tab persistence
- **Mechanism**: Any admin page with multiple tabs (settings, reviews, leads, customers, trash, media) must persist the active tab ID in the URL (`?tab=tabId`).
- Use `useAdminTab` from `lib/hooks/useAdminTab` to read/push URL params on tab changes via router replaces with `scroll: false`.
- Pages with search-param-bound tabs MUST wrap the client component in a React `<Suspense>` boundary to avoid static-generation build-time errors.
- **Rule**: Avoid transient tab-index state in local `useState` for key navigation blocks. All future admin sub-dashboards/settings tabs must use this URL-based persistence hook.

## RULE N3 — Scroll reset to top on navigation & tab change (MANDATORY)
- Next.js doesn't auto-scroll nested scrollable layout containers (e.g. `<main id="admin-main-content">`) to top on page/query changes (e.g. changing `?tab=shipping`).
- To prevent pages/tabs loading scrolled down or focused on the footer:
  1. In the admin layout: give the scrollable main container `id="admin-main-content"` and reset `mainEl.scrollTop = 0` inside a `useEffect` listening to `pathname` and `searchParams`.
  2. In the storefront layout/navbar: reset `window.scrollTo({ top: 0, behavior: 'instant' })` inside a `useEffect` on pathname/searchParams changes, EXCEPT when a back/pop navigation scroll restoration is scheduled (`isPopNavigation()` or active navigation snapshot exists in `sessionStorage`).
- **Rule**: all future pages/scrollable layouts must implement these scroll-reset behaviors so the viewport always starts at the top.

## RULE N4 — Storefront Load More & Infinite Scroll Restoration Guarantee (Zero Banner/Footer Landings)
- **Problem**: When a customer clicks "Load More" multiple times (e.g. 4 times), clicks on a product card, and then presses the browser Back button, client-side App Router remounts the listing. If expanded limits are not restored, only initial items render; the clicked card is absent from the DOM, causing scroll restoration to fail and dump the user at the top hero banner or bottom footer.
- **Mechanism**:
  1. **Persistence on Save**: When clicking a product card, `saveScrollPosition(product.id)` bundles active batch limits (`loadMoreLimits`) directly into the navigation snapshot payload in `sessionStorage`.
  2. **Synchronous Client useState Initializer**: Listing pages (`StoreFront.tsx`, `useShopPageFilters.ts`) MUST initialize `loadMoreLimits` synchronously within client-side `useState(() => ...)` initializer callback. Restoring in a post-hydration `useEffect` creates a fatal race condition: `<ScrollRestorer />` fires in `useIsomorphicLayoutEffect` (before `useEffect`), cannot find `#product-card-${productId}` in DOM, times out, and dumps the customer at the top or footer.
  3. **Multi-Signal Back Navigation Detection**: Check both native browser `navigation` entries (`navEntries[0].type === 'back_forward'`), popstate history transition (`isPopNavigation()`), and active snapshot pending target card (`snap.clickedCardId && isSameStorePath(snap.path, currentPath)`).
  4. **Visual Cloak & MutationObserver**: `ScrollRestorer.tsx` holds a lightweight visual cloak while `MutationObserver` waits for the target card `#product-card-${productId}`. The instant the card enters the DOM, it centers the card in viewport center (`card.scrollIntoView({ block: 'center', behavior: 'instant' })`), pulses `scroll-restore-highlight`, and reveals the page smoothly.
  5. **Fresh Arrival Reset**: When a user arrives fresh (clicking the Logo or top navbar "Home" / "Shop", or `!isNavBack`), saved limits in sessionStorage MUST be explicitly removed so fresh visits strictly adhere to the layout per-page limits configured in Customizer.
- **Rule**: Every storefront grid or listing with Load More / Infinite Scroll MUST follow this guarantee so back navigation lands precisely where the customer left off.

## RULE N5 — Universal Navigation Memory & State Restoration Standard (MANDATORY)
- **Single Source of Truth**: All navigation state (scroll coordinates, clicked card IDs, active category/collection tabs, expanded `loadMoreLimits`, and product variant/gallery selections) is governed exclusively by `lib/navigation/navigationMemory.ts` via key `store_navigation_memory_v1` in `sessionStorage`. No ad-hoc, isolated `sessionStorage` keys or duplicate scroll logic allowed across pages.
- **Synchronous First-Paint Restoration**:
  1. Listing pages (`StoreFront.tsx`, `TabbedProductGridSection.tsx`, `useShopPageFilters.ts`) MUST initialize their state synchronously from `getNavigationSnapshot(pathname)` inside `useState(() => getNavigationSnapshot(pathname))`.
  2. This guarantees that on Back navigation, expanded limits (e.g. 32 items instead of 8) and active category tabs are rendered on the very first React paint. This eliminates layout shifts, DOM height collapse, and footer clamping.
- **Card Centering & Visible Focus Ring**:
  1. In `ScrollRestorer.tsx`, when returning via Back/Pop navigation with a saved `cardId`:
     - The target element `#product-card-${cardId}` is centered in the viewport using `card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })`.
     - The element receives `.focus({ preventScroll: true })` and CSS class `.scroll-restore-highlight`.
     - The focus ring styling (`outline: 2.5px solid var(--color-primary, #e94560); outline-offset: 4px; border-radius: 14px;` with subtle pulse animation) visibly marks the exact product the customer was exploring.
- **Forward vs. Back Strict Separation**:
  1. **Forward Navigation (New Page)**: Every forward link click (`!wasPop`) explicitly resets scroll to top (`window.scrollTo({ top: 0, behavior: 'instant' })`).
  2. **Back Navigation (Popstate)**: Registered via global `popstate` listener (`isPopNavigation()`). Retains previous scroll position, restores batch limits, and centers the clicked card without fighting browser restoration or jumping to top.
- **Product Detail Selections Memory**:
  1. In `useProductDetailState.ts`, product option choices (selected size, color variant, active gallery index) are synchronized with `saveProductDetailSnapshot(productId, state)` and restored via `getProductDetailSnapshot(productId)`.
  2. When a customer navigates from Product A to Related Product B and then clicks Back, Product A immediately restores the exact variant and gallery photo they had chosen.
- **Bounded Storage & Lifecycle**:
  - Memory entries are strictly capped at 25 entries (FIFO eviction) and 30-minute expiration to prevent memory leaks and stale cross-session state.

## RULE N6 — Zero False-Positive Back-Nav & Per-Page Limit Integrity (MANDATORY)
- **The Core Flaw**: Never detect "back navigation" by checking if `scroll:${pathname}` or `store_scroll_restore` exists in `sessionStorage`. `<ScrollRestorer />` writes scroll coordinates to `sessionStorage` on EVERY user scroll event during standard browsing. Checking key presence turns EVERY normal reload or fresh link visit into a false-positive back-nav, which restores inflated load-more limits and shows far more products than the Customizer "per page" setting.
- **Mandatory Signal Isolation**:
  1. Back navigation is TRUE ONLY when at least one of these strictly validated signals evaluates true:
     - `navEntries?.[0]?.type === 'back_forward'` (browser navigation history)
     - `isPopNavigation()` (React / App Router popstate listener from `navigationMemory.ts`)
     - `Boolean(snap?.clickedCardId && isSameStorePath(snap?.path, currentPath))` (explicit target card click waiting to be restored on matching path)
  2. If `!isNavBack`:
     - Explicitly purge stored limits: `sessionStorage.removeItem(LOAD_MORE_KEY)` and `sessionStorage.removeItem(SHOP_LIMIT_KEY)`.
     - Immediately fall back to the initial layout limit configured in Admin / Theme Customizer (`initialLimit` / `PAGE_SIZE`).
- **Synchronous vs Asynchronous Lifecycle**:
  - Always read navigation snapshot in `useState(() => ...)` during initial client component mount.
  - Never defer limit restoration to a post-paint `useEffect()`. If target cards are missing on first paint, `<ScrollRestorer />` times out, jumps to stale scroll coordinates, and leaves the user lost on the page.

## RULE N7 — Absolute Navigation Memory & Zero-Regression Guard (NON-NEGOTIABLE)
This rule is permanent and MUST be strictly respected across all existing code, future refactors, and newly created pages/components:

1. **Universal Product Card Click & ID Contract**:
   - **Click Handler**: Every link or card opening a product (whether on Homepage, Shop, Category, Collections, PDP Related Products, PDP Recently Viewed, or Cart upsells) MUST attach `onClick={() => saveScrollPosition(product.id)}` from `@/lib/navigation/navigationMemory`.
   - **Root Element ID**: Every product card archetype or template (Standard, Ella, Showcase, Custom) MUST provide `id={`product-card-${product.id}`}` and `data-product-id={product.id}` on its outer container.
2. **Zero Route Discrimination in `<ScrollRestorer />`**:
   - `ScrollRestorer.tsx` MUST NEVER filter by page type or exclude product pages (e.g. **NEVER add `!isProductPage`** or bypass card restoration on detail routes).
   - If `snap?.clickedCardId` exists upon back/pop navigation, `startCardRestore()` MUST execute regardless of the route, ensuring the clicked card is located via `MutationObserver`, centered in the viewport, and highlighted with `.scroll-restore-highlight`.
3. **Route-Group Loading Skeleton Isolation**:
   - **NEVER** place route-specific mockups (such as Hero Banners, Category Circle Sliders, or Featured Grids) in a higher-level layout loading file like `app/(store)/loading.tsx`.
   - Page-specific skeletons MUST live inside their own isolated route folder or route group:
     - Homepage skeleton: `app/(store)/(home)/loading.tsx`
     - Product detail skeleton: `app/(store)/product/[slug]/loading.tsx`
     - Shop catalog skeleton: `app/(store)/shop/loading.tsx`
     - Cart page skeleton: `app/(store)/cart/loading.tsx`
   - This prevents the homepage skeleton from ever flashing or interjecting when navigating to product pages or other storefront routes.
4. **Dual-Mode Limit Enforcement**:
   - **Browser BACK Navigation**: Always restore expanded limits (`loadMoreLimits` / `shop_limit`) so DOM elements exist and the customer lands exactly on the clicked card.
   - **Hard Refresh / Reload / Fresh Link Visit**: Always PURGE sessionStorage limits and strictly enforce the Customizer Per-Page layout limit.
5. **Pre-Commit Verification Checklist (Zero-Regression Standard)**:
   Any agent or developer modifying storefront navigation or layouts MUST verify:
   - [ ] Clicking a product from Home, Shop, OR PDP Related Products and clicking Back lands cleanly on the clicked card with a centered viewport and focus ring.
   - [ ] Navigating from Home to a product page displays ONLY the product skeleton, never the homepage banner/circles.
   - [ ] Hard reload on Home or Shop displays strictly the Customizer-configured initial card limit.

## RULE N8 — Universal Admin Navigation Memory Standard (MANDATORY)
Navigation memory across the admin dashboard is an integral part of the core UI/UX architecture. When an admin operator manages Orders, Abandoned Carts, Inventory, Products, Categories, Reviews, or Customers, navigating between list tables and detail views (or drawer panels) must NEVER reset pagination, filters, search terms, or scroll position.

1. **Single Source of Truth (`lib/hooks/useAdminNav.ts`)**:
   - The universal navigation memory engine for ALL admin tabular data and list views is `lib/hooks/useAdminNav.ts` (`saveAdminNavContext`, `getAdminNavContext`, `getInitialAdminFilters`, `restoreAdminNavScrollAndHighlight`).
   - Domain-specific helpers (e.g. `lib/hooks/useOrderNav.ts` for `/admin/orders`) must delegate strictly to this shared engine. Zero ad-hoc or duplicate persistence implementations are permitted.
2. **Synchronous State Initialization (Zero Double-Fetch & Zero Filter Wipe)**:
   - All admin list components MUST initialize active filters, tabs, search queries, pagination, and date ranges synchronously inside `useState(() => getInitialAdminFilters(routeKey, defaults))` (or page-specific wrappers like `getInitialOrderFilters(...)`).
   - The initializer merges current URL search parameters with cached `sessionStorage` data.
   - **Strict Prohibition**: NEVER defer filter or page restoration to a post-paint `useEffect()`. Doing so triggers double-fetching, race conditions, hydration mismatches, and visually wipes out filter parameters (e.g. resetting 'all' back to 'today' or page 3 back to page 1).
3. **Scroll Container Restoration (`#admin-main-content`)**:
   - In the admin dashboard layout, the scrollable layout container is `<main id="admin-main-content">`, NOT `window`.
   - On clicking an Order row, Abandoned Cart row, Product edit link, or any list item to open a detail view/drawer:
     - Read `#admin-main-content`'s `scrollTop` (fallback to `window.scrollY`).
     - Save via `saveAdminNavContext('/admin/...', { page, scrollPosition, lastOpenedId, sourceUrl, activeTab })`.
4. **Target Row Centering & Green Pulse Animation**:
   - On return navigation (or when data loads), call `restoreAdminNavScrollAndHighlight(rowIdPrefix, ctx.lastOpenedId, ctx.scrollPosition)`.
   - This smoothly positions `#admin-main-content` back to the exact scroll position, centers the target row (`element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })`), and triggers `@keyframes orderRowPulse` (`.last-opened-order-pulse`).
   - Ensures the admin operator immediately locates the item they were just inspecting without searching or manual scrolling.
5. **Universal Parity Across Admin Modules**:
   - Applies to: Orders Log (`/admin/orders`), Abandoned Carts (`/admin/abandoned-carts`), Products (`/admin/products`), Categories (`/admin/categories`), Inventory (`/admin/inventory`), Customers (`/admin/customers`), and Reviews (`/admin/reviews`).
   - Every list row MUST render with an element ID format `<rowIdPrefix>-<id>` (e.g. `order-row-${order.id}`, `abandoned-cart-row-${cart.id}`, `product-row-${product.id}`) to guarantee immediate DOM matching.



