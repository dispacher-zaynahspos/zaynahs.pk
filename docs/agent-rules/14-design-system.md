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

## RULE BASE-CARDS — Base Store Themes (Protected — NEVER TOUCH) (MANDATORY)
The 5 original foundation themes (`style1`, `showcase_1`, `showcase_8`, `showcase_11`, `showcase_13`) mapped as **Base Card 01 to 05** are the core foundational pillars of this e-store.
1. **Never Touch or Alter**: Under NO circumstances should any agent, refactor, or script modify, strip down, or overwrite these 5 base themes. They are protected baseline designs.
2. **New Themes & Layouts**: All new theme collections (such as the 10 Elessi Theme styles `card_01` through `card_10`) must be implemented as distinct archetypes and must strictly honor the core store capabilities established by the base themes.

## RULE DS2 — Dynamic product card style templates & settings linking (MANDATORY)
- **Single Source of Truth for Card Controls**: Every product card style across the store (Base Themes & Elessi Themes) MUST be 1000% reactive to all settings in both the **Admin Products Tab** (`/admin/settings?tab=products`) and the **Theme Customizer** (`ELEMENT VISIBILITY`, `SWATCHES`, `STYLE & TEMPLATE`, `APPEARANCE`, `ALIGNMENT & ORDERING`):
  1. **Variation & Swatch Controls**:
     - Master toggle: `enable_variant_swatches`. If false, NO swatches or size pills may ever render.
     - Slot toggles: Variation 1 (`card_show_swatches`), Variation 2 (`card_show_sizes`), Variation 3 (`card_show_materials`), Variation 4 (`card_show_custom`), Variation 5 (`card_show_custom_2`).
     - Attribute type toggles: `card_show_type_color`, `card_show_type_size`, `card_show_type_material`, `card_show_type_custom`.
     - Styling: `swatch_shape` ('circle' | 'square'), `swatch_limit` (1–20), `archive_swatch_size` ('xxs' to 'xxl'), `archive_swatch_align` ('left' | 'center' | 'right').
     - **Strict Ban on Hardcoded Sizes & Fake Dots**: NEVER hardcode fake dummy sizes `['L', 'M', 'S']` or fake color dots. Swatches MUST use `finalRenderedGroups` (from `ProductCardSwatches.tsx`) or only render real attributes if enabled in settings AND present on the product.
  2. **Action Icons & Wishlist Spawn Synchronization**:
     - **No Compare Arrow**: The dummy compare arrow icon (`CardCompareIcon` `[ 🔄 ]`) has zero function and is STRICTLY BANNED from all cards.
     - **Wishlist Spawn Rule**: The wishlist heart icon must NOT sit isolated/sticky in the top-right corner while other action icons spawn below it. All action buttons (Wishlist, Quick View, Add to Cart/Quick Shop) must be grouped inside the action rail/row and spawn TOGETHER on hover or mobile focus.
     - Action visibility: `card_show_wishlist`, `card_show_quickview`, `card_show_quickcart`.
  3. **Visual & Layout Controls**:
     - `image_hover_style` ('second_image', 'zoom', 'slide_left', 'zoom_swap', 'fade_up', 'blur_crossfade', 'flip_3d', 'none').
     - `image_aspect_ratio` ('3:4', '1:1', '4:3', '16:9', 'auto') via `getSharedAspectClass()`.
     - `title_line_limit` ('1', '2', 'none') via `getSharedTitleClampClass()`.
     - `card_show_stars` (toggle star rating and review count).
     - `card_show_description` (toggle catalog short description).
     - `card_mobile_columns` (1 column large vs 2 columns standard).
     - Vertical element ordering via `card_elements_order`.
     - Content alignment via `card_alignment` ('left', 'center', 'right').
  4. **Mobile Responsiveness & Quick Shop Layout**:
     - On mobile 2-column grids (~160px card width), all buttons and drawers (such as Style 10 Quick Shop) must be compact and responsive without text clipping (e.g. quantity stepper stacked with full-width "Add to Bag" button).
  - Multi-badge vertical stacking via the unified `<div className="bdg-container"> {renderCardBadge()} </div>` flexbox.
  - Complete master reference lives in `docs/UI_CARDS.md`.

## RULE CARD-COMPAT-MATRIX — Card Controls Compatibility & Exemption Rules (MANDATORY)
1. **Universal Store DNA**: Variations (`enable_variant_swatches`, `card_show_sizes`, etc.), Pricing (`formatPrice`, Sale first, Strikethrough second), Images (`image_aspect_ratio`, `image_hover_style`), Badges, and Action Visibility (`card_show_wishlist`, `card_show_quickview`, `card_show_quickcart`) apply 100% dynamically across ALL card styles without exception.
2. **Dedicated Silhouette Exemptions**: When an archetype employs a dedicated architectural silhouette (e.g. `card_01` parallel justified footer row, `card_02` centered seam pill, `card_08` bottom baseline locked button), layout-specific generic controls (arbitrary `card_alignment` or `card_elements_order`) are superseded to protect the brand silhouette.
3. **Informative Customizer Feedback**: When a control does not apply to the active style, the Customizer UI must display an English explanatory badge or tooltip (e.g., *"This archetype uses a dedicated geometric layout: [Reason in English]"*). The merchant's saved preferences are preserved non-destructively and re-apply whenever they switch to a Base Theme. Full matrix lives in `docs/UI_CARDS.md` Section 7.

## RULE DS-BADGES — Universal Badges SSOT across Cards & Product Detail (MANDATORY)
1. **Single Source of Truth**: All promotional, sale, featured, and custom badges across ALL product cards (Standard, Showcases 01–16, Ella 01–08), QuickView modals, and Product Detail Pages (PDP) MUST be rendered through ONE shared component: `components/store/product-card/ProductCardBadges.tsx`. Zero duplicate badge markup or ad-hoc badge spans are permitted anywhere in the codebase.
2. **Admin Badges Tab Synchronization**: Badges strictly synchronize with the Admin Badges Tab (`/admin/badges`), honoring system badge defaults (Sale `#10b981`, Featured `#e94560`, HOT `#ea580c`, New/Limited `#d97706`) as well as merchant-configured custom badges (`bg_color` & `text_color` from the `badges` table).
3. **Smart Geometric Styling**:
   - Placement: Top-left clearance (`top: 8px, left: 8px` on desktop; `top: 6px, left: 6px` on mobile), vertically stacked via `.bdg-container` with `gap: 3px` (mobile `2.5px`).
   - Dimensions & Typography: Smart rounded corners (`border-radius: 4px` desktop; `3.5px` mobile), bold uppercase text (`font-weight: 800`, `letter-spacing: 0.5px`, uppercase), compact mobile sizing (`8px` font, `2px 5.5px` padding) and balanced desktop sizing (`9.5px` font, `2.5px 7px` padding).
   - Collision clearance: `max-width: calc(100% - 46px)` so badges never collide with top-right quick action rails.

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

## RULE DS11 — Form Feature Toggle & Accordion Auto-Expand Synchronization (MANDATORY)
Verified 2026-10. Applies to all admin forms (Product Form, Settings, Customizer, Modifiers):
1. **Auto-Expand on Toggle Enable**:
   - Whenever a section/feature has both an activation toggle switch and an accordion/collapsible area (e.g. Product Variants, Flash Sale, Custom Badges):
   - When the user turns the toggle switch ON (`checked = true`), the collapsible section MUST automatically expand (`collapsed = false`) immediately. The user must NEVER be forced to perform a redundant second click on "Expand All".
2. **Auto-Collapse on Toggle Disable**:
   - When the user turns the toggle switch OFF (`checked = false`), the collapsible section MUST automatically collapse (`collapsed = true`) so the form remains clean and focused.
3. **Smart Intent on Manual Expand**:
   - If the user clicks "Expand All" while the master toggle is OFF, the master toggle MUST automatically flip ON (`hasVariants = true`), honoring user intent directly without requiring a separate toggle click.
4. **Edit Mode Initialization**:
   - When editing an existing entity where the feature is already active (`initialProduct.has_variants === true`), the section MUST initialize in the EXPANDED state (`collapsed = false`) so existing variants/settings are immediately visible.

## RULE DS12 — Multi-Archetype Product Card Layouts & Dynamic Action Formats (MANDATORY)
Verified 2026-10. All product card designs across storefront and admin must adhere to the multi-archetype design framework documented in `docs/UI_CARDS.md`:
1. **Diverse Element Placements**: Different archetypes must exhibit genuinely distinct DOM hierarchies (e.g. Zara slide-drawer 1-line title/price, Daraz rating-pill + price-first + urgency bar, Nike category kicker + corner FAB, Amazon split dual-action bar). Never restrict cards to a single uniform layout structure.
2. **Distinct Action Formats**: Action triggers (Wishlist, Quick View, Cart) must not default to the same 3 top-right circular buttons across all styles. Supported formats include:
   - `'action-btn'` / `'floating-stack'`: Classic 3 circular buttons
   - `'slide-drawer'`: Full-width slide-up action bar anchored to image bottom (Zara / ASOS)
   - `'direct-button'`: Full-width or pill action button placed below the price (Daraz / Amazon)
   - `'corner-fab'`: Floating Action Button overlapping image/body seam (Nike / Streetwear)
   - `'split-bar'`: Dual 50/50 action buttons (`Quick View` + `Add to Bag`)
   - `'center-pill'`: Centered floating pill revealing on image hover (Sephora)
3. **100% System Hook Continuity**: Every action format MUST bind to standard shared handlers:
   - `onToggleWishlist` for live wishlist state (`isInWishlist`)
   - `onOpenQuickView` for the quick view modal
   - `onAddToCart` with intelligent variant detection (`has_variants` → "Choose Options" vs "Add to Cart")
   - Full-card navigation link at `z-[1]` with `saveScrollPosition(product.id)`
4. **Zero Blurs & GPU Performance**: Strictly avoid CPU-intensive `backdrop-filter: blur(...)`. Use solid high-contrast backgrounds with hardware-accelerated CSS `translate3d` and `scale` transitions.
5. **Mobile 2-Column Grid Compliance**: Every archetype MUST supply scoped responsive rules under `@media (max-width: 640px) .grid-cols-2 .z-card-container .[STYLE_CLASS]` to ensure compact padding (6–8px), clamped fonts (0.72–0.78rem), and scaled action buttons.
6. **Core DNA Binding Contract (Universal Store DNA)**: Every card archetype MUST remain 100% wired to the complete store feature set:
   - Live variant swatches (`finalRenderedGroups`) with live price/stock reactivity and variant drawer/modal trigger.
   - Dynamic price formatting (`formatPrice`) with compare-at strikethrough, discount percentage badge, and stock urgency.
   - Primary & secondary hover/focus media swap supporting all aspect ratios (`3:4`, `1:1`, `auto`) and fit modes (`cover`, `contain`).
   - Wishlist toggle (`useWishlist`), Quick View modal (`onOpenQuickView`), and Quick Cart (`onAddToCart`).
   - Line clamp setting enforcement (`title-clamp-1`, `2`, `none`) via semantic Link with scroll restoration (`saveScrollPosition`).
   - No archetype may omit, mock, or fake any of these core capabilities. Full specifications in `docs/UI_CARDS.md`.
7. **Strict Ban on Reskinning (Mandatory Spatial & Visual Look Differentiation)**:
   - Changing ONLY colors, background tint, or border-radius while keeping the DOM layout and element placements identical is **STRICTLY FORBIDDEN**.
   - Every card archetype must feature genuinely different element placements (icons, buttons, title, price, variations, badges, ratings in different physical locations) AND different visual looks/formats (drawers, FABs, split-bars, pill buttons, kicker tags, price-first arrangements).
   - See full architectural breakdown in `docs/UI_CARDS.md` RULE CARD-DIVERSITY.
8. **Elessi Theme (10 Styles)**: Elessi-inspired storefront cards live as canonical entries `card_01`…`card_10` (group `'Elessi Theme'`) in `lib/utils/cardStyles.ts` with classes `sc_style1`…`sc_style10` (CSS in `components/store/product-card/customCss.tsx`, render branches in `ProductCardShowcases.tsx`). They are built matching reference screenshots with exact placements (corner FAB, between-seam row, floating pill, split drawer, vertical rail, black cart bar, 3 floating bubbles, bottom cart bar, seam cart bar, quick shop interactive sheet) and MUST preserve all Core Store DNA (dynamic live pricing, variant reactive swatches, optimistic wishlist, quick view, PKR currency formatting, single-tap navigation).

## RULE DS13 — Collision-Free Card Geometry, Grid Baseline & Icon Presets Standard (MANDATORY)
1. **Absolute Badges vs Action Icons Separation (Zero Overlap)**:
   - Badges Zone: strictly pinned to `position: absolute !important; top: 8px !important; left: 8px !important; z-index: 10 !important; max-width: calc(100% - 46px) !important; pointer-events: none !important;`. Long badges truncate/stack and NEVER encroach onto the right action buttons.
   - Action Icons Zone: strictly pinned to `position: absolute !important; right: 8px !important; top: 8px !important; z-index: 25 !important;`. Action buttons must NEVER float to the top-left over badges.
   - **No Position Overrides**: `.action-btn` and `.ai` CSS rules must NEVER declare `position: relative` without specificity clearance, as this broke Tailwind's `.absolute` positioning.
2. **Grid Baseline Action Button Alignment (`mt-auto`)**:
   - In 2-column mobile feeds and desktop catalog grids, card contents must expand with `flex flex-col flex-1 justify-between`.
   - All bottom action button wrappers (`direct-btn-wrap`, `split-action-bar`, `marketplace-bottom-wrap`) must have `mt-auto w-full`.
   - Adjacent cards with varying title line counts (1 line vs 2 lines) or presence/absence of variant swatches must ALWAYS align their action buttons along the exact same horizontal baseline across the catalog row.
3. **Single-Line Button Typography & No-Wrap Standard**:
   - Card buttons must include `whitespace-nowrap truncate` to prevent word-splitting onto two lines (e.g. `SELECT` \n `SHADE`) in narrow 2-column mobile cards (~160px width).
   - Typography scale: `text-[10px]`–`text-[11px] font-bold`, compact padding `py-1.5 px-2.5`, scaled icons `h-3.5 w-3.5 shrink-0`.
4. **5 Action Icon Style Presets (`StoreSettings.card_icon_style`)**:
   - Merchants can configure action icon aesthetics across all cards via 5 distinct presets:
     - `pill`: Modern Filled Pill (solid high-contrast circular badges, classic icons)
     - `minimal`: Minimal Line (featherweight strokes, borderless floating elegance)
     - `luxe`: Luxury Metallic (champagne gold fine micro-accents, designer tote & star charm)
     - `brutalist`: Neo-Brutalist Sharp (crisp 2px black geometric squircle border, hard offset shadow)
     - `glass`: Floating Frost Glass (translucent tactile bubble, subtle depth)
   - Every card action trigger must support these presets and render matching SVG glyph variants.
5. **Multi-Aspect Ratio Standard across all Cards (`3:4`, `1:1`, `4:3`, `16:9`, `auto`)**:
   - All card archetypes and catalog feeds must dynamically respect the chosen admin aspect ratio (`StoreSettings.image_aspect_ratio`).
   - Sizing logic MUST ONLY be fetched from `getSharedAspectClass(settings?.image_aspect_ratio)` in `lib/utils/styles.ts`.
   - Supported canonical options: `3:4` (`aspect-[3/4]`), `1:1` (`aspect-square`), `4:3` (`aspect-[4/3]`), `16:9` (`aspect-[16/9] aspect-video`), and `auto` (`aspect-auto min-h-[220px] sm:min-h-[280px]`).
   - No card archetype or custom CSS may hardcode `aspect-ratio: 1`, `height: ...px`, or `padding-bottom: ...%` on `.ib` or `.img-box`. All sizing must be dynamically derived via the single source of truth `getSharedAspectClass`.
   - `tailwind.config.ts` content array MUST include `./lib/**/*.{js,ts,jsx,tsx}` so dynamic aspect classes compile reliably in production builds.
## RULE DS14 — Universal Real-Data Binding & Zero Duplication Standard (MANDATORY)
1. **Single Source of Truth for Swatches (Zero Duplicate Sets)**:
   - Under NO circumstances may any product card render duplicate or double sets of variation swatches (e.g., rendering swatches inside an interactive in-card drawer or quick-shop sheet AND simultaneously rendering swatches below the product title/price in the card footer).
   - In styles with an in-card interactive sheet or drawer (such as Elessi Style 10 `card_10` / `sc_style10`), the single canonical instance of swatches (`finalRenderedGroups` from `ProductCardSwatches.tsx`) must be placed directly INSIDE the interactive sheet/drawer where the customer makes their selection. It must NEVER be duplicated in the card body below the price.
   - The interactive sheet and swatches must remain neatly aligned and contained within the card canvas boundaries (`inset-x-2 bottom-2` or designated container) without clipping or horizontal overflow.
2. **100% Real-Data Linking Across All Elements (Zero Fake Dummy Data)**:
   - **Variations & Swatches**: Real variants only (`product.variants`). Never hardcode fake fallback sizes (`['L', 'M', 'S']`) or fake fallback color hexes. Respect merchant settings: `enable_variant_swatches`, `card_show_swatches` (Slot 1), `card_show_sizes` (Slot 2), `card_show_materials` (Slot 3), `card_show_type_color`, `card_show_type_size`, `swatch_shape`, `swatch_limit`, and `archive_swatch_size`.
   - **Title**: Render real `product.name`, clamped strictly via `getSharedTitleClampClass(settings?.title_line_limit)`.
   - **Category**: Render real `product.category?.name` or breadcrumb only when present; never dummy text.
   - **Price**: Render real live prices with PKR currency formatting (`formatPrice(currentPrice, currencySymbol)`). Sale price FIRST, strikethrough compare price SECOND (`RULE PRICE1`).
   - **Description**: Render real `product.short_description` only when `settings?.card_show_description !== false`; never placeholder copy.
   - **Ratings**: Render real review counts and star averages only when `settings?.card_show_stars !== false` and data exists; never hardcoded static 5-star ratings.
   - **Action Buttons**: Wishlist, Quick View, and Quick Cart must trigger their real respective stores and modals (`useWishlist`, `onOpenQuickView`, `onAddToCart`).

## RULE DS15 — Real Variant Swatches Standard: 100% Admin Edit Product Fidelity (MANDATORY)
Verified 2026-10. All product card variations and swatches across storefront, catalog, and quick-shop drawers must adhere to absolute fidelity with the Admin Edit Product screen:
1. **100% Match with Admin Product Configuration**:
   - Product card swatches must reflect the real colors and images configured by the merchant on the Admin Product Edit page (`VariantAxisCard.tsx` / `VariantTableRow.tsx`).
   - Custom hex codes and multi-color split gradients (e.g. `#ef4444,#ffffff`) MUST render using `getSwatchStyle(color_hex)`.
   - Named colors where `color_hex` was omitted by the merchant MUST be dynamically resolved using `extractColorsFromName(color)` from `lib/utils/swatch.ts`. Arbitrary fallback colors (such as dark blue `#2b3f56`) or blank transparent circles are strictly banned.
2. **Real Variant Image Swatches**:
   - When a variant has a linked image URL and `show_image_swatch === true` (or settings specify image swatches, or image is present without a custom color hex), the card swatch MUST render the real variant thumbnail via `getPresetImageUrl(image_url, 'card')` with `object-cover`.
   - Hovering or selecting the swatch immediately swaps the active product card media to that variant's real image.
3. **Richest Variant Attribute Merge**:
   - Reducers that group variants by color must merge attributes across all rows of that color so that if one row has the image or custom hex while another row lacks it, the richest data is preserved. Never discard real merchant data.
4. **Zero Fake/Placeholder Data**:
   - Hardcoded arrays like `['L', 'M', 'S']`, fake blue `#2b3f56` dots, or static placeholder badges are strictly forbidden. If a product does not have variants or images, swatches cleanly collapse and do not render.

## RULE DS16 — Universal Customizer Controls Enforcement Standard (MANDATORY)
Verified 2026-10. Every single Theme Customizer control configured by the merchant in `ProductCardSettings.tsx` MUST remain 100% active, dynamic, and respected across ALL product card styles and archetypes without exception:
1. **Title Line Limit (`settings.title_line_limit`)**: Must apply `getSharedTitleClampClass(settings?.title_line_limit)` (`line-clamp-1`, `line-clamp-2`, or `line-clamp-none`). Raw `truncate` or `white-space: nowrap` on `card-title` is strictly banned.
2. **Card & Body Alignment (`settings.card_alignment`)**: Controls text and content justification via `alignClass` (`items-start text-left`, `items-center text-center`, `items-end text-right`).
3. **Star Ratings Visibility (`settings.card_show_stars`)**: Toggles visibility of customer star ratings. When disabled, collapses. When enabled, only real database ratings (`product.rating > 0`) are shown; zero fake fallback ratings.
4. **Product Description Visibility (`settings.card_show_description`)**: Dynamically toggles `product.short_description`.
5. **Action Buttons Visibility (`card_show_wishlist`, `card_show_quickview`, `card_show_quickcart`)**: Each action button respects its independent toggle.
6. **Badges Visibility (`card_show_badge`, `show_sale_badge`)**: Dynamically toggles badges and discount tags.
7. **Swatches Configuration**: Respects `enable_variant_swatches`, slot toggles (`card_show_swatches`, `card_show_sizes`), shape (`swatch_shape`), size (`archive_swatch_size`), limit (`swatch_limit` with `+N`), and alignment (`archive_swatch_align`).
8. **Aspect Ratio & Fit**: Dynamically derives from `getSharedAspectClass(settings?.image_aspect_ratio)` and toggles `object-cover` vs `object-contain`.

## RULE DS17 — Universal Swatch Interaction Image Swap Standard (MANDATORY)
Verified 2026-10. Across all storefront grids, catalog listings, search feeds, and quick-shop drawers:
1. **Instant Linked Image Swap on Hover & Click/Tap**:
   - On **ALL product cards** (Base cards 01–05, Elessi styles 01–10, Ella variants 01–08, and Showcases), whenever the cursor (arrow pointer) hovers over or a user clicks/taps any variation swatch (color, size, material, or custom option):
   - The main product image above MUST immediately swap to the specific variant's linked image (`v.image_url`).
   - **Hover (`onMouseEnter`)**: Instantly previews the variant's linked photo via `hoveredImage` / `onHoverImage`.
   - **Unhover (`onMouseLeave`)**: Instantly restores the active/selected image without modal jitter or flicker.
   - **Click/Tap (`onClick`)**: Permanently locks the card to the clicked variant's photo (`selectedImage`), updates the current price and compare-at price, and activates the swatch highlight ring.
2. **Hover Secondary Image Override Protection (`isVariantSelected`)**:
   - When a specific variant swatch has been clicked/selected by the customer, or while hovering over a swatch, the generic product second image (`image_hover_style` / `.hover-fade-in` / `.i2`) MUST NEVER override, fade in over, or conceal the variant's photo when the card itself is hovered or mobile-scroll-focused.
   - `showSecond` must strictly check `!hoveredImage && !isVariantSelected`.
3. **Card Component SSOT Fidelity**:
   - All card archetypes (including Ella and Showcases) MUST prioritize the active/hovered/selected variant image passed from the parent state (`activeImage` / `p.image`).
   - Cards must NEVER discard `p.image` in favor of a hardcoded first swatch index (e.g. `img1 = p.swatches[0]?.image`).
4. **Graceful Fallback & Attribute Merging**:
   - If a clicked variant row lacks a dedicated image, it falls back to the product's primary image or resolves the photo from any matching variant attribute row.
   - Attribute reducers must preserve `image_url` across all active variant rows so variant photos are never lost.

## RULE DS18 — Card Clean Media Standard: Zero In-Card Carousel Arrows (MANDATORY)
Verified 2026-10. Across all storefront grids, catalog listings, search feeds, and category collections:
1. **Zero Arrow Overlay Clutter**: Product cards across all themes and archetypes (including Ella 07 & 08) must NOT render floating chevron or navigation arrow buttons (`<` and `>`) over the product card media area.
2. **Clean Image Exploration Paradigm**: Storefront card image exploration is exclusively driven by:
   - **Hover Secondary Preview**: Clean secondary photo swap/fade on desktop cursor hover (`image_hover_style` / `.i2`).
   - **Dynamic Swatch Linking**: Instant image update upon hovering or tapping color/material swatches (`RULE DS17`).
3. **Dedicated Gallery Modals**: Deep multi-image carousel exploration is strictly reserved for the full Product Detail Page (`ProductDetailGallery`) and the Quick View drawer/modal (`QuickViewModal`).

## RULE DS19 — Footer Social Icons & Grid View All Visibility Standard (MANDATORY)
Verified 2026-10. Across all stores (TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo):
1. **Footer Social Hover Contrast**: Every social link in `FooterSocialLinks.tsx` has branded hover background colors (`#1877F2` for Facebook, `#E1306C` for Instagram, `#25D366` for WhatsApp, `#FF0000` for YouTube, `#000000` for TikTok/Twitter, `#FFFC00` for Snapchat) with guaranteed high-contrast icon color (`#ffffff` / `#000000`), smooth lift, and dark mode compatibility. Resting icon color defaults to visible slate (`#334155`).
2. **Grid 'View All' Button Contrast**: Center/bottom 'View All' action buttons (`StoreFrontProductGridSection`, `FlashSaleSection`, `StoreFrontSections`) must default text color to `#ffffff`. If a merchant or DB config accidentally sets the text color identical to the button background color, the runtime safely falls back to `#ffffff` to guarantee WCAG-AA legibility.

## RULE DS20 — Universal Card Action Buttons Wiring Standard (Quick View & Quick Add) (MANDATORY)
Verified 2026-10. Across all stores (TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo):
1. **Quick View (Eye Icon)**: Must reliably trigger `QuickViewModal` across all card variants (Base, Elessi, Ella 01–08). Card delegates must receive `onQuickView`, pass `originalSettings`, and mount `QuickViewModal`.
2. **Quick Add / Buy (Bag Icon)**: If `product.has_variants` is true, clicking Cart/Bag opens `QuickViewModal` for option selection; if non-variant, adds directly to cart with fly-to-cart animation. It must never silently fail on variant products.
3. **Wishlist (Heart Icon)**: Uses canonical `useWishlist` with optional mouse event.

## RULE DS21 — Mobile Card Vertical Density & Swatch Elevation Standard (MANDATORY)
Verified 2026-10. Across all stores (TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo) and all card styles (Base cards, Elessi styles, Ella 01–08, and Showcases):
1. **Mobile Star Rating Vertical Margins**:
   - On mobile screens (`@media (max-width: 639px)` / smartphone viewport), star ratings (`.rating`, `.rat`) must use compact vertical spacing: `margin-top: -2px` (or `0px`), `margin-bottom: -1px` (or `1px`), with `line-height: 1.15`.
   - Never allow excessive vertical dead space above or below star rating rows on mobile 2-column grids.
2. **Mobile Swatch Elevation & Breathing Room**:
   - Variation swatches (`.swatches`, `ProductCardSwatches`) must sit elevated above card bottom edges, using responsive spacing `mt-1 sm:mt-2 mb-1 sm:mb-2` with `gap-1 sm:gap-1.5` instead of tall fixed 8px+ outer margins.
   - On Ella cards, `.pc-body` gap on mobile must be `3.5px`, `padding-top: 8px`, and `padding-bottom: 6px` so swatch rows do not collide with or spill over the bottom border of the product card.
   - Across all Showcases and Standard/List cards, ratings use `my-0.5 sm:my-1` and swatches use `my-0.5 sm:my-1.5` with `mt-1 sm:mt-1.5` for prices.
3. **Customizer Control Preservation**:
   - Spacing refinements MUST NEVER bypass, compromise, or break customizer toggles:
     - `card_show_stars` (enable/disable ratings),
     - `enable_variant_swatches` / `card_show_type_*` (enable/disable swatches),
     - `card_elements_order` (drag-and-drop element ordering up/down),
     - `title_line_limit` (1, 2, or none line clamping),
     - `card_alignment` (left, center, right alignment).
   - All customizer controls remain 100% reactive and honored.

## RULE DS22 — New Product Cards Standard: Mandatory Ella JSON Engine Architecture (MANDATORY)
Verified 2026-10. Across all stores (TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo):
1. **Mandatory Ella Engine for All Future Cards**:
   - Any NEW product card variant, theme style, or card archetype added to the project MUST exclusively use the **Ella Card Engine architecture** (`components/product-cards/`):
     - Configured declaratively via `card-variants.json`.
     - Scoped modular CSS rules in `product-cards.css` (`.pc-grid[data-card="XX"]`).
     - Rendered through the unified `components/product-cards/ProductCard.tsx` engine.
   - Do NOT create fragmented standalone card components or append ad-hoc styles into legacy CSS files.
2. **Existing Live Cards Protection**:
   - Existing Base cards (01–05), Elessi styles (01–10), and Showcase cards remain protected and untouched to preserve active merchant stores and database settings without breaking production (`RULE BASE-CARDS`).
3. **SSOT Shared Module Integration**:
   - Every new card added to the Ella engine MUST consume canonical shared modules:
     - Variation swatches via `ProductCardSwatches.tsx`.
     - Wishlist via `useWishlist.ts`.
     - Fly-to-cart animation and `QuickViewModal.tsx`.
     - Title line clamping via `getSharedTitleClampClass`.

### RULE DS23 — Universal Drop/Fly Animation Standard (Cart & Wishlist Across All Devices)
1. **Canonical Engine**: All Add-to-Cart and Wishlist triggers across the entire application MUST invoke the shared SSOT animation engine (`@/lib/utils/flyAnimation.ts::flyToCart` and `flyToWishlist`). Never hand-roll ad-hoc animation scripts or hardcoded element IDs.
2. **Device-Specific Target Routing (MANDATORY)**:
   - **Cart (Mobile & Desktop)**: MUST ALWAYS fly UP into the **TOP HEADER CART ICON** (`header-cart-icon-mobile` on mobile, `header-cart-icon-desktop` on desktop), NEVER into the bottom navigation bar.
   - **Wishlist (Mobile)**: Targets the **BOTTOM NAVIGATION BAR WISHLIST ICON** (`mobile-bottom-wishlist-icon`), falling back to header wishlist if bottom nav is absent.
   - **Wishlist (Desktop)**: Targets the **TOP HEADER WISHLIST ICON** (`header-wishlist-icon-desktop`).
3. **Web Animations API (WAAPI) Parametric Physics & Anticipation Dip**:
   - Single isolated GPU compositor node with zero parent clipping (`contain: paint` strictly forbidden on outer containers).
   - **Cart Upward Arc & Anticipation Dip**: Distance from cards to the top header is traversed with a tactile initial **8px anticipation dip & spring pop** (first 14% of journey) before launching into a majestic upward parabolic rainbow arc directly into the header cart bucket. Calibrated duration: **720ms** on mobile, **760ms–920ms** on desktop.
   - **Mobile Wishlist Gravity Drop**: Drops down into the sticky bottom navigation bar in **660ms** with natural gravity acceleration ($t^{1.35}$).
4. **Bucket & Badge Pop on Arrival**:
   - On landing, the target icon and live count badge pill (`span`, `.nav-count-badge`) MUST trigger `.bucket-animate` (`@keyframes bucket-bounce` spring bounce + `@keyframes badge-pop`), producing a high-delight celebratory bounce (scale 1.3x) without layout shift.
5. **Resilient Target & Source Resolution**:
   - Targets dynamically resolve the visible element with strict viewport boundary clamping (`[25, winW - 25]`, `[15, winH - 15]`) if scrolled. Never flies off-screen into negative coordinates or fails silently.
   - Every card root element (`.pc`, `.z-card-container`, etc.) MUST set both `id={`product-card-${product.id}`}` and `data-product-id={product.id}`. The engine automatically sources the trajectory from the card's thumbnail image when events are synthetic or unmounted.
6. **Universal Coverage**: Enforced on all catalog cards (Ella 01–08, Elessi 01–16, Showcases, Base themes 1–5, Shop list view), collection grids, Related Products, Recently Viewed, Product Detail page buttons, Sticky Quick Buy Bar, Frequently Bought Together bundles, and QuickViewModal. QuickViewModal MUST allow 650ms delay before closing so the flight originates cleanly from the button and completes its journey visibly into the header cart. Single-variant products on cards directly add to cart and trigger the fly animation without modal friction.
7. **Universal Badges Sync (RULE DS-BADGES)**: All cards, modals, and PDP pages must render badges through the SSOT `<ProductCardBadges>`, reflecting real badge colors and labels configured in `/admin/badges`.


