# 19 — Navigation & State Restoration Rules (MANDATORY for new pages)

## RULE N1 — Storefront scroll & focus restoration
- **Mechanism**: When a customer clicks a product card on a listing page (Homepage/Shop/Wishlist), call `saveScrollPosition(product.id)` — stores current page path, `scrollY`, and the product ID in `sessionStorage`.
- On return, `useScrollRestoration()` checks the path; if matched, restores scroll instantly via double `requestAnimationFrame` (`window.scrollTo({ top, behavior: 'instant' })`) and focuses the active product card.
- The restored card gets a temporary CSS highlight class `scroll-restore-highlight` (subtle pulsing border/glow).
- **Rule**: Never remove `useScrollRestoration` or the `id={product-card-${product.id}}` bindings from product card templates. Any new storefront listing/grid page MUST call `useScrollRestoration()` and bind the click save handlers.

## RULE N2 — Admin URL-based tab persistence
- **Mechanism**: Any admin page with multiple tabs (settings, reviews, leads, customers, trash, media) must persist the active tab ID in the URL (`?tab=tabId`).
- Use `useAdminTab` from `lib/hooks/useAdminTab` to read/push URL params on tab changes via router replaces with `scroll: false`.
- Pages with search-param-bound tabs MUST wrap the client component in a React `<Suspense>` boundary to avoid static-generation build-time errors.
- **Rule**: Avoid transient tab-index state in local `useState` for key navigation blocks. All future admin sub-dashboards/settings tabs must use this URL-based persistence hook.

## RULE N3 — Scroll reset to top on navigation & tab change (MANDATORY)
- Next.js doesn't auto-scroll nested scrollable layout containers (e.g. `<main id="admin-main-content">`) to top on page/query changes (e.g. changing `?tab=shipping`).
- To prevent pages/tabs loading scrolled down or focused on the footer:
  1. In the admin layout: give the scrollable main container `id="admin-main-content"` and reset `mainEl.scrollTop = 0` inside a `useEffect` listening to `pathname` and `searchParams`.
  2. In the storefront layout/navbar: reset `window.scrollTo({ top: 0, behavior: 'instant' })` inside a `useEffect` on pathname/searchParams changes, EXCEPT when a scroll restoration is scheduled (`store_scroll_restore` exists in `sessionStorage`).
- **Rule**: all future pages/scrollable layouts must implement these scroll-reset behaviors so the viewport always starts at the top.

## RULE N4 — Storefront Load More & Infinite Scroll Restoration Guarantee (Zero Banner/Footer Landings)
- **Problem**: When a customer clicks "Load More" multiple times (e.g. 4 times), clicks on a product card, and then presses the browser Back button, client-side App Router remounts the listing. If expanded limits are not restored, only initial items render; the clicked card is absent from the DOM, causing scroll restoration to fail and dump the user at the top hero banner or bottom footer.
- **Mechanism**:
  1. **Persistence on Save**: When clicking a product card, `saveScrollPosition(product.id)` bundles active batch limits (`loadMoreLimits` from `storefront_load_more_limits`) directly into the `store_scroll_restore` payload in `sessionStorage`.
  2. **Hydration-Safe Restoration**: Listing pages (Homepage, Shop) initialize with SSR-safe base limits (`{}`), but immediately restore `loadMoreLimits` in a post-hydration `useEffect` if `store_scroll_restore` matches the current path.
  3. **Zero Reliance on `performance.navigation`**: Never gate restoration on `performance.getEntriesByType('navigation')[0].type === 'back_forward'` alone, because Next.js App Router client-side history transitions never update this document-level entry.
  4. **Visual Cloak & MutationObserver**: `ScrollRestorer.tsx` holds a lightweight visual cloak while `MutationObserver` waits for the target card `#product-card-${productId}`. The instant the card enters the DOM, it centers the card in viewport center (`card.scrollIntoView({ block: 'center', behavior: 'instant' })`), pulses `scroll-restore-highlight`, and reveals the page smoothly.
  5. **Fresh Arrival Reset**: When a user arrives fresh (clicking the Logo or top navbar "Home" / "Shop"), saved limits are cleared so fresh visits always start cleanly at the top.
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

