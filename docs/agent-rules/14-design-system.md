# 14 — Design System Rules (NON-NEGOTIABLE)

## Aesthetic: "Modern Pakistani E-Commerce — Premium Mobile"
- **Mobile-first**: 375px base, scale up to tablet/desktop.
- **Touch targets**: minimum 44px for all interactive elements.
- **Fonts**: Geist (headings) + Inter (body) — loaded via `next/font`.
- **Colors**:
  ```css
  --primary: #1a1a2e        /* Deep Navy */
  --accent: #e94560         /* Bold Red */
  --surface: #ffffff
  --surface-2: #f8f8f8
  --text: #1a1a1a
  --text-muted: #6b7280
  --border: #e5e7eb
  --success: #10b981
  --warning: #f59e0b
  ```
- **Border radius**: `rounded-2xl` for cards, `rounded-xl` for buttons.
- **Shadows**: soft elevation system — never hard box-shadows.
- **Animations**: subtle — fade-in on load, scale on tap, slide-up for modals.
- **Theme switching**: full class-based switcher via `next-themes` + standard client `<ThemeToggle />`. Declare class-based dark mode in Tailwind v4 with `@variant dark (&:where(.dark, .dark *))` in `globals.css`.
- **Text & cart contrast integrity**: always apply proper dark-mode classes directly on elements (`dark:bg-[#16162a]`, `dark:border-gray-800`, `dark:text-white`, `dark:text-gray-300`). Never use broad global overrides (e.g. `.dark .bg-white` in `globals.css`) — causes specificity/contrast bugs.
- **Color scale standardization**: never use non-standard Tailwind numbers (`gray-250`, `gray-205`, `gray-955`, `gray-755`, `gray-55`, `gray-350`, `gray-550`, `red-550`). Only standard weights: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.

## Centralized icons rule
All icons import ONLY from `components/common/Icons.tsx` (e.g. `import { ShoppingCart, User } from '@/components/common/Icons'`). Never import `lucide-react` (or any icon library) directly in a page or component.

## Component baseline rules
- Every product card: image top, name, price, "Add to Cart" button.
- Bottom sticky cart bar on mobile — always visible when cart has items, with responsive dark backgrounds.
- Skeleton loaders on every data fetch. No page without a loading state.
- Toast notifications (sonner) for all actions.
- **Category links**: always `/shop?category=slug` — never a dedicated `/category/[slug]` route unless it redirects to shop.
- **Scroll & focus restoration**: every product card click saves scroll position (`saveScrollPosition(product.id)`); every listing/grid page (Homepage, Shop, Wishlist) calls `useScrollRestoration()`. Full rule: [19-navigation-state-restoration.md](19-navigation-state-restoration.md) RULE N1.
- **Modal/popup performance & jitter prevention**:
  - **Banned blurs**: never `backdrop-blur-sm`/`backdrop-blur-xs`/`backdrop-blur` on modal backdrops/overlays. Use high-contrast solid/opacity overlays (`bg-black/60`).
  - **GPU acceleration**: add `will-change-transform` + `transform-gpu` to scrollable containers/modal cards to delegate paint to the GPU (60fps scrolling on all screens).
  - Apply `overscroll-contain` and smooth touch configs for layout integrity.

## RULE DS1 — Dynamic theming & contrast visibility (MANDATORY)
- **Always theme-bound**: never hardcode static dark/light backgrounds (solid charcoal `#111827`, dark navy `#1a1a2e`) in custom elements/panels/floating controls. Map them to dynamic theme classes (e.g. `bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white`) so they adapt to any theme preset (green/orange/navy) and dark/light mode.
- **Accents & buttons**: interactive buttons, highlight badges, links must inherit theme variables (`bg-primary`, `bg-accent`, `text-primary`, `text-accent`) rather than static colors.
- **Resolve input double borders**: for inline form groups/inputs inside border-bound containers, apply `style={{ borderWidth: 0 }}` inline on number/text inputs — suppresses native borders forced by global `globals.css` overrides, giving clean single-bordered inputs.
- **Responsive/mobile card layouts**: all bulk editors, detail panels, settings forms use a responsive grid (`grid grid-cols-1 md:grid-cols-3` or similar) — side-by-side on desktop/tablet, stacked touch-cards on mobile.

## RULE DS2 — Dynamic product card style templates & settings linking (MANDATORY)
- Whenever adding/implementing/modifying any product card layout/template, it MUST fully link to all dynamic customizer settings: Image Aspect Ratio (`aspectClass`), Image Hover Style (`imageHoverStyle`), vertical element ordering (`elementsOrder`, `renderShowcaseContent`/`renderElement`), text alignment classes (`alignClass`), star rating visibility (`showStars`), swatches, quick view, wishlist, cart action overlays.
- The card template MUST support dynamic multi-badge vertical stacking via the unified `<div className="bdg-container"> {renderCardBadge()} </div>` flexbox, matching the default `style1` layout.
- Strictly follow the step-by-step checklist in `docs/prompts/add_card_style_prompt.md` and keep all templates fully synchronized.

## RULE DS3 — Skeleton loaders (MANDATORY)
Never use a global `app/loading.tsx` — it blocks the ENTIRE UI (hides Navbar, Footer, etc.) and ruins perceived performance. ALWAYS use component-level skeletons (map `<ProductCardSkeleton />` / `<LoadingSkeleton />` inside the page layout) so the app layout stays visible while data fetches, rendering instantly.

## RULE DS4 — Navigation progress bar on all route changes (MANDATORY)
Duplicate/reinforced with RULE C7 in [08-caching-isr-ssr.md](08-caching-isr-ssr.md):
- Visible red progress bar MUST appear on EVERY internal navigation (menu, category, product clicks, back/forward, "View All", "Shop Now", etc.).
- `NextTopLoader` alone does not catch `<Link>` clicks — `components/common/NavigationProgress.tsx` intercepts `<a>` clicks and calls `NProgress.start()`.
- Both `<NextTopLoader>` and `<NavigationProgress>` MUST be in `app/layout.tsx`. Keep `showSpinner={false}`, `height={5}`.
- NEVER remove `NavigationProgress` from the layout.

## Skeleton color standardization (RULE K1, extends DS3)
- `app/(store)/loading.tsx` → `GridSkeleton` from `@/components/common/LoadingSkeleton` for product-card grids.
- `app/(store)/product/[slug]/loading.tsx` → `DetailSkeleton` (two-column product-detail layout).
- `app/admin/loading.tsx` → generic loader with stat cards + list-table skeletons.
- Skeleton backgrounds use ONLY standard Tailwind weights (`bg-gray-100`, `dark:bg-gray-800`) — never non-standard (`bg-gray-150`, `bg-gray-155`).
- Skeletons must support both light and dark mode (`dark:bg-[#16162a]`, `dark:border-gray-800/80`, `bg-gray-100`, `dark:bg-gray-800`).

## Desktop/mobile jitter prevention (RULE M5, extends the modal/popup rules above)
CPU-heavy blur styles on modals/filter overlays (`backdrop-blur-sm`, `backdrop-blur-xs`) are forbidden — only high-contrast solid options (`bg-black/60`). GPU acceleration triggers `will-change-transform` + `transform-gpu` are mandatory on scrollable layers.

## OG Meta Rule (multi-domain)
totvogue.pk and zaynahs.pk are separate brands. Every page with `generateMetadata()` MUST follow:
```ts
import { getDomainBrand } from '@/lib/utils/getDomainBrand'

export async function generateMetadata() {
  const brand = await getDomainBrand()
  return {
    title: '[Page Name] - ' + brand.name,
    description: '[Page description] at ' + brand.name,
    openGraph: {
      siteName: brand.name,
      title: '[Page Name] - ' + brand.name,
      description: '[Page description] at ' + brand.name,
    },
    twitter: {
      title: '[Page Name] - ' + brand.name,
      description: '[Page description] at ' + brand.name,
    }
  }
}
```
**NEVER**: hardcode "TotVogue"/"Zaynahs" in `generateMetadata()`; use `settings.storeName`/`settings.tagline` there; skip `generateMetadata()` on a new page.
**ALWAYS**: import `getDomainBrand` from `@/lib/utils/getDomainBrand`; call it at the top of every `generateMetadata()`; use `brand.name` for all title/OG fields, `brand.tagline` for descriptions when no specific one exists.
New page/category/route: copy the `generateMetadata()` pattern from an existing working page; never write the brand name as a string literal — `getDomainBrand()` handles it automatically.
(Full multi-domain rules: [18-multi-domain-rules.md](18-multi-domain-rules.md).)

## RULE DS5 — Theme Token Binding & Anti-Bloat Proportions (MANDATORY)
1. **Theme Tokens Binding (Always 100% Customizable via Admin Customizer)**:
   - All storefront fonts, buttons, headings, accents, borders, prices, badges, and card styles MUST dynamically inherit from the active Theme Customizer tokens (`var(--color-primary)`, `var(--color-secondary)`, `var(--color-accent)`, `var(--color-price)`, `var(--font-heading)`, `var(--font-body)`, `var(--border-radius-btn)`, `var(--border-radius-card)`, `var(--btn-primary-bg)`, `var(--btn-primary-text)`, `var(--btn-primary-hover)`).
   - NEVER hardcode arbitrary colors (such as `#e94560`, `#1a1a2e`, etc.) or static font-families in storefront components or pages. Every element must adapt immediately when an admin switches presets (Pink/Magenta, Royal Navy, Emerald, Luxury Gold, etc.) or customizes colors/fonts in `/admin/settings/customizer`.
2. **Anti-Bloat & Smart Proportions (Never 'Over-Zoomed')**:
   - Storefront UI must be sleek, compact, and balanced like high-end luxury fashion stores (Sapphire, Zara, Mango) — never bloated, oversized, or 'over-zoomed'.
   - **PDP Gallery**: Main image container must be capped at clean, proportional heights (`max-h-[520px]` or `max-h-[560px]` on desktop, and proportional viewport height on mobile) so the image never blows up to 800px+ height or forces excessive scrolling.
   - **Product Cards**: Cards must maintain smart compact spacing (`p-2.5` to `p-3`), crisp font sizes (`text-xs` to `text-[13px]`), and disciplined image heights so products look sharp, high-density, and well-aligned.
   - **Header Clearance**: Sticky navbar and announcement bars must have proper backdrop opacity and spacing so page headings (e.g. 'Featured Products') never overlap or clip behind the navbar.

## RULE DS6 — Unified Sticky Action & Save Bars across Admin (Mobile & Desktop) (MANDATORY)
Whenever creating, modifying, or refactoring ANY form, editor, modal, or management screen across the Admin Console (`/admin/*`):
1. **Never Buried Action Buttons**: Primary actions (Save, Update, Create, Discard, Cancel) MUST NOT be buried inside scrollable content or placed at the bottom of long columns/sidebars where users are forced to scroll down to reach them.
2. **Mobile & Desktop Sticky Standard**:
   - Save and Cancel actions must live in a unified, floating, sticky bottom bar pinned cleanly above the mobile bottom nav bar (`bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0`) so it NEVER gets buried behind `AdminMobileBottomBar` on mobile screens.
   - **Exact Tailwind positioning class**:
     ```tsx
     className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-2xl rounded-t-2xl transition-all"
     ```
   - **Bottom alignment**: On mobile (`< md`), sticks at `4rem + safe-area` above the bottom, resting smoothly right above the mobile navigation bar without any overlap. On desktop (`md:`), sticks at `0px` (`bottom: 0`).
   - **Form scroll clearance (`pb-36 sm:pb-20`)**: Any form or table hosting a sticky bottom bar MUST provide generous bottom padding (`pb-36 sm:pb-20`) so the final form inputs, checkboxes, variants, and fields can always be scrolled completely into clear, unobstructed view well above the bar and bottom navigation.
3. **Bar Structure & Visual Polish**:
   - **Left side**: Context and item state (animated pulse dot, active/inactive pill, title of product/setting, or unsaved item count).
   - **Right side**: Responsive button group with min 40px/44px touch targets (`active:scale-95`, `Loader2` spin on save, `Save` icon when idle).
4. **Modal Form Footers**:
   - All admin modals/dialogs with forms (`CategoryFormModal`, `CollectionFormModal`, `EditSEOModal`) must place action buttons in a pinned sticky footer (`<div className="p-6 pt-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-[#11111e] shrink-0">`) outside the `<div className="flex-1 overflow-y-auto ...">` scroll body. Action buttons must NEVER scroll out of view inside a modal.
5. **Canonical Reference Implementations**:
   - Product Form: `components/admin/product-form/ProductSaveBar.tsx`
   - Inventory Table: `components/admin/inventory-manager/InventorySaveBar.tsx`
   - Store Settings: `components/admin/settings-form/SettingsSaveBar.tsx`
   - Courier Manager: `components/admin/CourierManager.tsx`
   - Category Reordering: `components/admin/category-detail/CategoryBulkActionFooter.tsx`
   - Admin Modals: `components/admin/category-manager/CategoryFormModal.tsx` & `CollectionFormModal.tsx`


## RULE DS7 — Storefront section + icon standards (verified 2026-10)
- **Add-instance behavior**: clicking a type in "Add Layout Section" MUST insert exactly one new DB row every click (same type allowed many times — no unique constraint on `section_type`), given a unique UUID + de-duplicated title (`resolveDefaultTitle`), auto-selected and scrolled into view, present in preview + saved layout.
- **Per-device controls**: every section exposes columns/visibility/spacing per device via `ResponsiveGridColumnsControl` + `SectionSpacingControls` (padding top/bottom + background). `SectionSpacingControls` must appear in EVERY section editor.
- **Reorder**: up/down arrow buttons only (`moveItemInArray`). `GripVertical` is decorative — never wire real HTML drag-drop for section/list reorder.
- **No UI emojis**: all chrome/labels/placeholders/fallback glyphs use SVG from `@/components/common/Icons` (never a literal emoji in JSX for UI). Exception: user-editable free-text data fields (e.g. `value_props.icon`) may hold emoji the merchant typed — do not force-migrate those without an icon-key picker.

## RULE DS8 — Icon-key system for data-driven icons (NO emoji, ever)
Verified 2026-10. UI/UX hard rule: the storefront and admin UI NEVER render raw emoji.
- Any user-selectable "icon" field (e.g. `value_props` items) stores an **icon KEY** (string like `truck`, `cash`, `sparkles`) — never an emoji glyph.
- Render via the shared `components/common/SectionIcon.tsx` (`<SectionIcon icon={key} />`), which maps keys → SVG from `@/components/common/Icons`. Editors pick keys from `SECTION_ICON_KEYS` with a live `<SectionIcon>` preview.
- Legacy emoji values auto-migrate at render via `resolveIconKey()` (emoji → closest key) so old saved data keeps working — no destructive migration needed.
- All chrome glyphs (lock badges, section-type icons, empty-state icons, delete/announcement/tag markers) use SVG icons from the shared set — no inline emoji in JSX.

## RULE DS9 — Interactive States (content must never disappear)
Verified 2026-10. Applies to EVERY clickable element (icons, buttons, links, cards, chips) on storefront + admin, both brands, all devices.
- Define all four states explicitly: **default · hover · focus-visible · active/pressed** — each with guaranteed icon/text contrast vs its background (WCAG AA). No state may hide content (never white-on-white, never `currentColor` collapsing into the background).
- SVG icons use `currentColor` for stroke/fill; the element sets `color` per state. Give icons an **explicit size** (e.g. `h-5 w-5`) — never rely on undefined Tailwind sizes like `h-4.5` (not in the scale → icon can collapse).
- Hover styling ONLY under `@media (hover: hover)` so touch devices don't get stuck-hover; always provide `:active` pressed feedback for touch; `-webkit-tap-highlight-color: transparent`; min 44px touch target; `focus-visible` outline for keyboard.
- Hover icon color and hover background are **separate editable, shared keys** between Settings and Customizer (e.g. footer social: `footer_social_icon_color`, `footer_social_icon_bg`, `footer_social_hover_color`, `footer_social_hover_bg`) with contrast-safe defaults.
- Hide controls whose target is empty (e.g. social icon with no link). Keep `aria-label`/`title` on every icon-only control.

## RULE DS10 — Overlay, Popup & Tooltip Safe-Positioning Standard (MANDATORY)
Verified 2026-10. Applies to all maps, charts, data-viz canvases, tables, and custom UI components across storefront + admin:
1. **Container-Relative vs Viewport Coordinates (SSOT)**:
   - **Banned**: NEVER use raw `e.clientX` / `e.clientY` directly as CSS `left`/`top` inside a `position: relative` or constrained container. Doing so adds the parent's viewport offset (e.g. admin sidebar width + top header + scroll), causing popups to drift far to the right/bottom and clip instantly.
   - **Mandatory**: ALWAYS subtract the container's bounding rectangle: `anchorX = e.clientX - containerRect.left`, or anchor directly to the target element's center: `anchorX = targetRect.left + targetRect.width / 2 - containerRect.left`.
2. **Boundary Collision & Auto-Flipping**:
   - Inside `overflow-hidden` or dimensionally bounded containers, popups MUST dynamically test container bounds (`containerWidth`, `containerHeight` via `ResizeObserver` / measured rect):
     * **Near right edge**: auto-flip placement to the **LEFT** of the anchor (`anchorX - gap - cardWidth`).
     * **Near left edge**: place to the **RIGHT** of the anchor (`anchorX + gap`).
     * **Near top edge**: auto-flip to the **BOTTOM** (`anchorY + gap`).
     * **Near bottom edge**: auto-flip to the **TOP** (`anchorY - gap - cardHeight`).
     * **Corner cases**: auto-flip both axes simultaneously.
     * **Hard clamping**: strictly clamp coordinates with safe padding (minimum 8–12px from every edge): `clampedX = Math.max(SAFE_PAD, Math.min(containerWidth - cardWidth - SAFE_PAD, targetX))`.
     * If rendered outside the container, use a portal (`createPortal(..., document.body)`) or standard popper primitive.
3. **Pointer Arrow Continuity**:
   - The pointer arrow must accurately indicate the anchor point regardless of flip direction, sliding along the card edge within clamped bounds (`Math.max(12, Math.min(cardDim - 12, ...))`) without breaking off card corners.
4. **Touch Hit Targets & Mobile Bottom Sheets**:
   - Minimum 44px touch targets on all interactive map markers/pins/nodes (using invisible transparent hit overlays: `<circle r={Math.max(22, ...)} fill="transparent" pointerEvents="all" />`) even if the visible dot is 6–12px.
   - On narrow mobile viewports (< 520px / < 640px), map popups must render as a pinned bottom sheet/card with explicit close ('✕') and tap-outside dismiss, preventing cramped off-screen tooltips.
5. **Interactive Grace Period & Keyboard Dismissal**:
   - Popups containing interactive or inspectable details (cluster lists, copyable values, links) must keep `pointer-events-auto` with a 150ms hover-leave grace period so cursors can smoothly enter the card.
   - Desktop clicks pin the card; pressing `Escape` or clicking outside dismisses immediately.

