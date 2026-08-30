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
