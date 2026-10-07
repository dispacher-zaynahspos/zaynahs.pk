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




