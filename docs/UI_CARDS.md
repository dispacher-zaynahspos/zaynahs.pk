# UI CARDS — Master Multi-Theme Product Card Architecture, System Rules & Complete Controls Guide

> **Single Source of Truth (SSOT)** for all product card styles, layout architecture, CSS conventions, modules, controls, and elements across TotVogue, Zaynahs, MiniMahal, LittleMister, and Lobo.  
> Governs shared behavior across **Theme Customizer (`ProductCardSettings`)**, **Shop Settings (`/admin/settings?tab=products`)**, and all **Storefront Catalog Grids** (`/shop`, `/`, `/collection/*`, `/category/*`, `/search`, `/wishlist`).  
> Aligned with `docs/agent-rules/14-design-system.md` (RULE DS2 & RULE BASE-CARDS), `docs/agent-rules/17-mobile-native-app-style.md`, and `docs/prompts/add_card_style_prompt.md`.

---

## 1. Absolute Prime Directives & Protections

### ⛔ RULE BASE-CARDS — Base Store Themes (Protected — NEVER TOUCH)
The 5 original foundation themes (`style1`, `showcase_1`, `showcase_8`, `showcase_11`, `showcase_13`) mapped as **Base Card 01 to 05** are the foundational anchor themes of this e-store:
1. **Never Touch or Alter**: Under NO circumstances should any agent, refactor, or script modify, strip down, or overwrite these 5 base themes. They are protected baseline designs.
2. **New Themes & Layouts**: All new theme collections (such as the 10 Elessi Theme styles `card_01` through `card_10`) must be implemented as distinct archetypes and must strictly honor the core store capabilities established by the base themes.

### 🚫 STRICT BAN: Compare Arrow Icon `[ 🔄 ]` Is Prohibited
- There is **no product comparison feature** in the store. A compare arrow button creates user confusion and serves no business purpose.
- `CardCompareIcon` is **permanently prohibited and removed** from all product card designs.

### 🔄 UNIFIED ACTION RAILS: Wishlist Spawn Synchronization
- The wishlist heart button must **NOT** sit permanently sticky in the top-right corner while other action buttons (Quick View, Add to Cart) spawn separately below it.
- **Rule**: Wishlist, Quick View, and Cart action buttons must reside in the **same action container** (side rail, seam pill, or bottom action row) and **spawn together** on desktop hover and on mobile scroll focus.

### 🎯 1000% REACTIVE CONTROLS: Zero Dummy Data
- **No Hardcoded Sizes**: Hardcoding fake dummy sizes like `['L', 'M', 'S']` or fake color dots is **strictly forbidden**.
- Real variant attributes (Color, Size, Material, Custom) must render **only** when enabled in settings AND present on the product's actual active variants.
- Swatches must leverage `finalRenderedGroups` (from `ProductCardSwatches.tsx`) as the Single Source of Truth for variant swatches.

---

## 2. Shared Multi-Screen Architecture (Admin vs Storefront)

Both administrative interfaces update the single canonical record in `store_settings`. All storefront listing grids inherit these exact settings in real-time:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     ADMIN SHOP SETTINGS         │       │        THEME CUSTOMIZER         │
│  /admin/settings?tab=products   │       │   /admin/settings/customizer    │
│  (Variant Swatch Display &      │       │  (5 Accordions: Style, View,    │
│   Design Catalog Layout)        │       │   Swatches, Look, Order)        │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └──────────────────┬──────────────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │    store_settings (DB)    │
                      │  Single Source of Truth   │
                      └─────────────┬─────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  /shop Grid  │             │   Homepage   │             │  Categories  │
│  All Filters │             │ New Arrivals │             │ Collections  │
└──────────────┘             └──────────────┘             └──────────────┘
```

---

## 3. Core Architectural Foundation & CSS System Conventions

Every card follows a unified CSS foundation to guarantee bulletproof rendering, zero CLS (Cumulative Layout Shift), and 60fps hardware-accelerated animations:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CARD CSS ANATOMY & ENGINE                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Reset          ──► box-sizing: border-box, m/p: 0, link/btn resets  │
│ 2. Grid           ──► .pc-grid: repeat(var(--cols), 1fr) [4-5/3/2/1]   │
│ 3. Media Box      ──► .pc-media: aspect-ratio, grey placeholder, fit   │
│ 4. Hover Helper   ──► .hov: composite opacity/transform (@media hover) │
│ 5. Semantic Title ──► .ttl: line-clamp-1/2/none, link scroll anchor    │
│ 6. Price Engine   ──► .sale FIRST, .old (strike) SECOND, .from, -XX%   │
│ 7. Swatches SSOT  ──► .sws & .sw: circle/square, active ring, .more +N │
│ 8. Action Rail    ──► Wishlist + Eye + Cart spawn together at z-[25]   │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Reset Standard (`.pc-reset`)
All card components, buttons, and links adhere to clean normalization:
- **Box-Sizing**: `*, *::before, *::after { box-sizing: border-box; }`
- **Margin & Padding**: Reset to `0` by default; spacing applied exclusively via disciplined utility padding (`p-2 sm:p-2.5`).
- **Links (`<a>`, `<Link>`)**: `text-decoration: none; color: inherit; display: block;`
- **Buttons (`<button>`)**: `background: none; border: none; padding: 0; cursor: pointer; font: inherit; outline: none;` with explicit `type="button"`.

### 3.2 Responsive Layout Grid (`.pc-grid`)
Grids dynamically distribute cards across viewport breakpoints:
```css
.pc-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
  gap: var(--grid-gap, 16px);
}
```
- **Desktop (≥ 1024px)**: 4 columns standard (or 5 columns on high-density ultra-wide screens, governed by customizer / layout settings).
- **Tablet (640px – 1023px)**: 3 columns (`grid-cols-3`).
- **Mobile (< 640px)**: 2 columns standard (`grid-cols-2`, ~160px–180px per card) or 1 column (`grid-cols-1`) when `card_mobile_columns === 1`.

### 3.3 Media Container & Placeholder (`.pc-media`)
- **Container**: Sits inside a dedicated relative box with strict aspect ratio:
  ```tsx
  <div className={`pc-media relative ${aspectClass} w-full overflow-hidden bg-gray-100 dark:bg-[#16162a]`}>
  ```
- **Grey Placeholder**: Background (`bg-gray-100 dark:bg-gray-800/60`) prevents white flash and layout reflow before image loads.
- **Images**: Primary and secondary images render with `w-full h-full object-fit` (`object-contain` or `object-cover` bound to `card_image_fit`).
- **Secondary Image**: Injected via `ProductCardMedia` and controlled by the active hover animation style.

### 3.4 Hover Transition Helper (`.hov`)
- **Hardware Acceleration**: Only composite GPU properties (`opacity`, `transform`) animate:
  ```css
  .hov {
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  ```
- **Desktop (@media (hover: hover) and (pointer: fine))**: Action rails and secondary images start hidden (`opacity: 0; pointer-events: none;`) and reveal smoothly on `.group:hover` / `:focus-within` (`opacity: 1; pointer-events: auto;`).
- **Touch Devices (@media (hover: none))**:
  - Controlled by `card_mobile_activation` (`scroll` | `touch` | `off`).
  - In `scroll` mode, the ONE card in reading-band focal proximity holds `.is-in-focus` / `.active-card` via `lib/hooks/useMobileCardFocus.ts`, revealing secondary image and action icons seamlessly without manual tapping.

### 3.5 Semantic Title (`.ttl`)
- Rendered as `<Link>` with `saveScrollPosition(product.id)`.
- Line clamping governed by `title_line_limit`:
  - `'1'` → `line-clamp-1`
  - `'2'` → `line-clamp-2` (default)
  - `'none'` → `line-clamp-none`
- Typography: `text-xs sm:text-[13px] font-semibold leading-snug tracking-tight text-gray-900 dark:text-white`.

### 3.6 Price Architecture & Helpers
- **Standard Order (RULE PRICE1)**: **Sale price FIRST (prominent), original strikethrough price SECOND.**
- **`.sale`**: Highlighted sale price formatted via `formatPrice()`, colored via `card_sale_price_color` (or fallback `--color-price`).
- **`.old`**: Original strikethrough price rendered with `line-through text-gray-400 text-[11px]`, colored via `card_compare_color` (default `#ef4444`).
- **`.from`**: Prepends "From" prefix when multi-variant items have variant price ranges.
- **Discount Chip**: Inline `-XX%` badge next to price (`Math.round(((compare - price) / compare) * 100)% OFF`).

### 3.7 Swatches System (`.sws` & `.sw`)
- **`.sws` (Container)**: Flex container with `flex-wrap gap-1.5`, aligned via `archive_swatch_align` (`justify-start`, `justify-center`, `justify-end`).
- **`.sw` (Swatch Item)**:
  - Shape: Bound to `swatch_shape` (`circle` = `rounded-full`, `square` = `rounded-xs`).
  - Sizing: Bound to `archive_swatch_size` (`xxs` to `xxl`, `h-1.5 w-1.5` up to `h-4.5 w-4.5`).
  - Active State: Selected swatch gets active outline ring (`border-[var(--color-accent)] ring-1.5 ring-[var(--color-accent)] scale-110`).
  - Hover: Changes card image dynamically to variant's photo via `onMouseEnter`.
- **`.more` (Overflow Count)**: If variants > `swatch_limit`, renders `+N` label (`text-[10px] text-gray-400 font-bold`).
- **SSOT**: Swatches MUST render via `{finalRenderedGroups}`. No fake hardcoded dummy values.

### 3.8 Action Rail Architecture (`.pc-actions`)
- All action triggers (Wishlist, Quick View, Cart/Quick Shop) live in a unified container.
- Sits at `z-[25]` with `pointer-events-auto`, `e.preventDefault()`, and `e.stopPropagation()`.
- Shopify single-tap overlay link sits behind at `z-[1]`.
- All buttons spawn together on interaction.
- Strict ban on compare arrow `[ 🔄 ]`.

---

## 4. Complete Inventory of All Customizable Controls

Below is the exhaustive mapping of every control present in **Theme Customizer (`ProductCardSettings`)** and **Admin Shop Settings (`/admin/settings?tab=products`)**:

### 4.1 Accordion 1: STYLE & TEMPLATE (Customizer)

| Control Label | Key / Token | Options / Values | Function & CSS Implementation |
|---|---|---|---|
| **Product Card Style Template** | `card_style` | Base Themes (`style1`, `showcase_1`, `showcase_8`, `showcase_11`, `showcase_13`)<br>Elessi Themes (`card_01` to `card_10`) | Activates the card DOM silhouette and layout. |
| **Action Icons Style Preset** | `card_icon_style` | 1. **Preset 1 — Modern Filled Pill** (`pill`)<br>2. **Preset 2 — Minimal Line** (`minimal`)<br>3. **Preset 3 — Luxury Metallic** (`luxe`)<br>4. **Preset 4 — Neo-Brutalist Sharp** (`brutalist`)<br>5. **Preset 5 — Floating Frost Glass** (`glass`) | Changes visual aesthetic, border weights, shadows, and glyphs of action icons (Wishlist, Quickview, Cart). |
| **Image Hover / Scroll Animation Style** | `image_hover_style` | 1. **Second Image (Fade Swap)** (`second_image`)<br>2. **Zara Slide** (`slide_left`)<br>3. **Zoom & Swap** (`zoom_swap`)<br>4. **Upward Drift** (`fade_up`)<br>5. **Apple Blur** (`blur_crossfade`)<br>6. **3D Flip** (`flip_3d`)<br>7. **Zoom Only** (`zoom`)<br>8. **Static (None)** (`none`) | Dictates the composite CSS transform/opacity animation applied to secondary images on desktop hover or mobile scroll. |
| **Mobile Activation Mode** | `card_mobile_activation` | `scroll` \| `touch` \| `off` | **Scroll Focus**: Single card nearest screen centre auto-reveals hover image & action icons.<br>**Touch**: Only tapped card reveals.<br>**Off**: No mobile hover animations (desktop hover unaffected). |
| **Live Animation & Hover Studio** | *Interactive Preview Studio* | 8 live preview buttons (`Fade Swap`, `Zara Slide`, `Zoom & Swap`, `Upward Drift`, `Apple Blur`, `3D Flip`, `Zoom Only`, `Static`) | Real-time simulator in admin panel for testing desktop hover and mobile focus interactions. |
| **Image Aspect Ratio** | `image_aspect_ratio` | `3:4` (Portrait)<br>`1:1` (Square)<br>`4:3` (Landscape)<br>`16:9` (Wide)<br>`auto` (Natural) | Sets image aspect ratio container via `getSharedAspectClass()`. |
| **Archive Title Line Limit** | `title_line_limit` | `1` (1 Line)<br>`2` (2 Lines Limit Default)<br>`none` (Full Title) | Clamps title text via `getSharedTitleClampClass()`. |

---

### 4.2 Accordion 2: ELEMENT VISIBILITY (Customizer)

| Control Label | Key | Type | Card Function & Logic |
|---|---|---|---|
| **Show Rating Stars** | `card_show_stars` | `boolean` | Toggles star ratings row and review count `(N)`. If `false`, stars are completely hidden. |
| **Show Wishlist Button** | `card_show_wishlist` | `boolean` | Toggles heart action icon inside the action rail. |
| **Show Quick View Button** | `card_show_quickview` | `boolean` | Toggles eye action icon and activates `<QuickViewModal>` portal. |
| **Show Quick Cart Button** | `card_show_quickcart` | `boolean` | Toggles bag/cart action button or quick add trigger. |
| **Show Short Description** | `card_show_description` | `boolean` | Displays short catalog description snippet below the title. |
| **Show Variation 1 Swatches** | `card_show_swatches` | `boolean` | Toggles slot 1 variation swatches (typically Color). |
| **Show Variation 2 Swatches** | `card_show_sizes` | `boolean` | Toggles slot 2 variation swatches (typically Size). |
| **Show Variation 3 Swatches** | `card_show_materials` | `boolean` | Toggles slot 3 variation swatches (typically Material). |
| **Show Variation 4 Swatches** | `card_show_custom` | `boolean` | Toggles slot 4 variation swatches (Custom Option 1). |
| **Show Variation 5 Swatches** | `card_show_custom_2` | `boolean` | Toggles slot 5 variation swatches (Custom Option 2). |
| **Enable Color Swatches** | `card_show_type_color` | `boolean` | Type filter: Hides all color attribute swatches across all slots if `false`. |
| **Enable Size Swatches** | `card_show_type_size` | `boolean` | Type filter: Hides all size attribute swatches across all slots if `false`. |
| **Enable Material Swatches** | `card_show_type_material` | `boolean` | Type filter: Hides all material attribute swatches across all slots if `false`. |
| **Enable Custom Swatches** | `card_show_type_custom` | `boolean` | Type filter: Hides all custom attribute swatches across all slots if `false`. |

---

### 4.3 Accordion 3: SWATCHES / SWATCH STYLE & SETTINGS (Customizer & Shop Settings)

| Control Label | Key | Values | Card Function & CSS Behavior |
|---|---|---|---|
| **Enable Variant Swatches** | `enable_variant_swatches` | `boolean` | **Master Toggle**: If `false`, NO swatches or size pills render anywhere on cards. |
| **Swatch Shape** | `swatch_shape` | `Circle` \| `Square` | `Circle` → `rounded-full`<br>`Square` → `rounded-xs` (`border-radius: 2px`). |
| **Swatch Limit on Cards** | `swatch_limit` | `1` to `20` (e.g. `3 swatches`) | Maximum number of swatches rendered before showing `+N` overflow pill. |
| **Archive Swatch Size** | `archive_swatch_size` | `XXS`, `XS`, `SM`, `MD`, `LG`, `XL`, `XXL` | Sets dimensions of swatches on catalog cards:<br>`xxs` = 6px, `xs` = 8px, `sm` = 10px, `md` = 12px, `lg` = 14px, `xl` = 16px, `xxl` = 18px. |
| **Archive Swatch Alignment** | `archive_swatch_align` | `Left` \| `Center` \| `Right` | Flex justify alignment: `justify-start`, `justify-center`, or `justify-end`. |
| **Product Swatch Size** | `product_swatch_size` | `XXS` to `XXL` | Swatch sizing scale on Product Details Page (PDP). |
| **Default Variant on Catalog** | `default_variant_index` | `1` to `5` | Which variant index (1st to 5th) determines initial catalog price and thumbnail. |

---

### 4.4 Accordion 4: CARD APPEARANCE (Customizer)

| Control Label | Key | Values | Card Function & CSS Behavior |
|---|---|---|---|
| **Card Shadow** | `card_shadow` | `None` \| `Small` \| `Medium` \| `Large` | Outer card elevation: `shadow-none`, `shadow-sm`, `shadow-md`, `shadow-lg`. |
| **Hover Lift** | `card_hover_lift` | `boolean` | When `true`, card subtly translates upward on desktop hover (`transform: translateY(-3px)`). |
| **Card Border** | `card_border_enabled` | `boolean` | When `true`, renders crisp border (`border border-gray-200 dark:border-gray-800`). |
| **Image Fit** | `card_image_fit` | `Contain` \| `Cover` | Sets image object fit: `object-contain` (letterbox) vs `object-cover` (bleed). |
| **Compare-at Strike Color** | `card_compare_color` | Hex Color (default: `#ef4444`) | Color of the strikethrough original price line and text. |
| **Sale Price Color** | `card_sale_price_color` | Hex Color (optional) | Custom override color for the discounted sale price (falls back to `--color-price`). |

---

### 4.5 Accordion 5: ALIGNMENT & ORDERING (Customizer)

| Control Label | Key | Values | Card Function & Layout Behavior |
|---|---|---|---|
| **Content Alignment** | `card_alignment` | `LEFT` \| `CENTER` \| `RIGHT` | Alignment of text, prices, and swatches (`items-start text-left`, `items-center text-center`, `items-end text-right`). |
| **Vertical Elements Sorting** | `card_elements_order` | Ordered array of element keys:<br>`['rating', 'price', 'title', 'swatches']` | Drag-and-drop reordering that controls the exact DOM sequence of elements in the card body: Star Rating, Price Tag, Product Title, Color Swatches. |

---

### 4.6 Design & Catalog Layout (Admin Shop Settings: `/admin/settings?tab=products`)

| Control Label | Key | Values | Storefront Catalog Behavior |
|---|---|---|---|
| **Image Hover Style** | `image_hover_style` | 8 styles (Fade Swap, Zara Slide, etc.) | Visual hover/scroll animation across catalog cards. |
| **Image Aspect Ratio** | `image_aspect_ratio` | `1:1 Square`, `3:4 Portrait`, `4:3`, `16:9`, `Auto` | Aspect ratio box applied across all catalog grid cards. |
| **Archive Title Line Limit** | `title_line_limit` | `2 Lines Limit (Default)`, `1 Line`, `None` | Title line clamp behavior across all catalog grid cards. |
| **Mobile Grid Columns** | `card_mobile_columns` | `2 Columns (Standard Grid)` \| `1 Column (Large Cards)` | Number of columns rendered on smartphone screens (< 640px). |
| **Show Catalog Descriptions** | `card_show_description` | `boolean` | Checkbox toggling short descriptions below titles on catalog lists. |

---

## 5. Theme Catalog: Base Themes & Elessi Themes

### Group 1: Base Store Themes (Protected — NEVER TOUCH)

| Base ID | Canonical Key | Theme Name | Silhouette & Action Format |
|---|---|---|---|
| **Base Card 01** | `style1` | **Classic Standard** | Clean default e-store card. Image top, stacked badges, title, star rating, price, swatches. 3 circular action buttons top-right. |
| **Base Card 02** | `showcase_1` | **Neumorphic Soft Grey** | Soft inner/outer shadows, subtle bevels, pill badges. 3 circular action buttons top-right. |
| **Base Card 03** | `showcase_8` | **Geometric Mondrian** | High-contrast black outlines, architectural geometric blocks. Square outlined buttons. |
| **Base Card 04** | `showcase_11` | **Luxe Noir** | Black and gold luxury dark mode aesthetic, warm glow. Gold bordered dark buttons. |
| **Base Card 05** | `showcase_13` | **Soft Pastel Glow** | Beauty & cosmetics aesthetic, blush pastel tones. Rose-accented circular buttons. |

---

### Group 2: Elessi Theme Collection (10 Styles)

| Elessi ID | Canonical Key | Layout Silhouette | Action Container & Interaction Flow |
|---|---|---|---|
| **Card 01** | `card_01` | **Standard Clean** | Dark square overlay at image bottom. Minimal clean styling. Unified bottom action bar: Wishlist + Eye + Bag. |
| **Card 02** | `card_02` | **Between Seams** | Floating horizontal action pill placed directly across the image/body seam. Wishlist, Quickview, and Cart spawn together. |
| **Card 03** | `card_03` | **Quick Shop Hover Drawer** | Slide-up options drawer over image revealing live attribute swatches + Add to Cart. Side buttons for Wishlist + Quickview. |
| **Card 04** | `card_04` | **Corner Angle Minimalist** | Clean bordered minimal card with corner vertical action rail. Wishlist + Quickview + Cart spawn synchronously. |
| **Card 05** | `card_05` | **Clean Classic Minimal** | White square action bar floating at bottom of image housing Wishlist, Eye, and Bag buttons. |
| **Card 06** | `card_06` | **Vertical Right Action Rail** | High-density vertical action rail sliding in from the right edge with Wishlist, Quickview, and Cart. |
| **Card 07** | `card_07` | **Side Pop Action Rail** | Smooth sliding action chips expanding on hover with Wishlist, Quickview, and Cart. |
| **Card 08** | `card_08` | **Dark Border Minimal** | Elegant dark border with centered bottom action pill containing Wishlist, Quickview, and Cart. |
| **Card 09** | `card_09` | **Centered Floating Pill** | Luxe minimal presentation with center-hover floating action pill containing Wishlist, Quickview, and Cart. |
| **Card 10** | `card_10` | **Full Quick-Shop Slide Drawer** | Full interactive slide drawer with live variant selectors, quantity stepper, and Add to Bag button. Mobile layout uses compact stacked buttons so "Add to Bag" never truncates. |

### Group 3: Ella Theme Collection (8 Styles)

| Ella ID | Canonical Key | Layout Silhouette | Action Container & Interaction Flow |
|---|---|---|---|
| **Ella 01** | `card_ella_01` | **Standard Clean** | Unified bottom action bar: Wishlist + Quick View + Add to Cart spawn together. |
| **Ella 02** | `card_ella_02` | **Persistent Bottom Add-to-Cart** | Always-visible bordered `Add to Cart`, center quick-view strip. Wishlist + Quick View spawn together on the chrome. |
| **Ella 03** | `card_ella_03` | **Centered Action Cluster** | Unified center cluster with wishlist + cart, quick-view strip at bottom, hover stars. |
| **Ella 04** | `card_ella_04` | **White Action Panel** | Unified white panel with quick-view top-right, bordered add-to-cart, and text wishlist. |
| **Ella 05** | `card_ella_05` | **Gold Classic** | Unified gold-accented rail with wishlist + quick-view + white cart bar. |
| **Ella 06** | `card_ella_06` | **Right Square Rail** | Slide-in right-side rail with Wishlist + Quick View + Add to Cart. |
| **Ella 07** | `card_ella_07` | **Floating Bottom-Right Row** | Unified bottom-right row with Wishlist + Quick View + Add to Cart (clean aesthetic, zero arrow clutter). |
| **Ella 08** | `card_ella_08` | **Vertical Bottom-Right Rail** | Unified vertical rail with Wishlist + Quick View + Add to Cart. |

> New module: `components/product-cards/` (`ProductGrid.tsx`, `ProductCard.tsx`, `product-cards.css`, `card-variants.json`, `types.ts`, `toCardProduct.ts`). Registered as `card_ella_01`–`card_ella_08` in `lib/utils/cardStyles.ts`, `lib/types/settings.ts`, and the Theme Customizer selector. Base themes and Elessi `card_01`–`card_10` are untouched.

---

## 6. Performance, Touch & Mobile Quality Directives

1. **Zero `backdrop-filter: blur(...)` (RULE M10b)**: Absolutely forbidden across all cards, overlays, and buttons to eliminate mobile compositor stutter and scroll lag.
2. **Hardware-Accelerated 60fps Transitions**: Animations strictly use `transform: translate3d(...)`, `scale(...)`, and `opacity`. Layout properties (`height`, `width`, `margin`, `padding`) must never be animated.
3. **Single Mobile Focus (`useMobileCardFocus`)**: Exactly one card holds focus during mobile scrolling. Touch scrolling never flickers or animates multiple cards simultaneously.
4. **Shopify Single-Tap Overlay**: Full-card overlay `Link` sits at `z-[1]`. Action buttons and swatches sit at `z-[25]` with `stopPropagation()`. Tapping the card opens the PDP; tapping an action executes its specific action without navigating.
5. **Narrow Mobile 2-Column Protection (< 640px)**: All button and stepper labels must be tested against 160px width 2-column mobile feeds without text clipping.

---

## 7. Card Controls Compatibility & Exemption Matrix (RULE CARD-COMPAT-MATRIX)

> 💡 **Architectural Principle**: While core store capabilities (Swatches, Pricing, Images, Badges, Wishlist, Quickview, Add to Cart) are **100% universal**, each distinct card archetype possesses a unique spatial silhouette.  
> When an archetype uses a dedicated geometric layout (e.g. a horizontal parallel price/title row or a centered seam trigger), certain generic customization controls (such as vertical drag-and-drop reordering or arbitrary text alignment) are **intentionally locked or superseded** to preserve the intended brand aesthetic.  
> When a control does not apply to the active style, the Customizer UI must display an English informational tooltip explaining why.

### 7.1 Master Controls Support & Exemption Matrix

| Style Key | Friendly Name | Visibility Toggles (Stars, Wishlist, Eye, Cart) | Variant Swatches (Color, Size, Materials) | Action Icons Preset (`card_icon_style`) | Image Controls (Hover, Aspect, Fit, Clamp) | Card Appearance (Shadow, Border, Lift, Colors) | Content Alignment (`card_alignment`) | Vertical Elements Order (`card_elements_order`) | Architectural Reason / Customizer Tooltip (English) |
|---|---|---|---|---|---|---|---|---|---|
| `style1` | **Base 01 — Classic Standard** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | **Fully Customizable**: All controls, reordering, and alignments apply directly. |
| `showcase_1` | **Base 02 — Neumorphic Soft Grey** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | **Fully Customizable**: Neumorphic soft bevels blend with custom shadows. |
| `showcase_8` | **Base 03 — Geometric Mondrian** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Border Locked | ✅ 100% Dynamic | ✅ 100% Dynamic | **Border Locked**: *"Mondrian style always maintains high-contrast architectural grid borders by design."* |
| `showcase_11` | **Base 04 — Luxe Noir** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | **Luxury Theme**: Default price color falls back to champagne gold when blank. |
| `showcase_13` | **Base 05 — Soft Pastel Glow** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | **Fully Customizable**: Rose blush beauty aesthetic with full dynamic controls. |
| `card_01` | **Elessi 01 — Standard Clean** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Justified Row | ⚠️ Partial Order | **Parallel Footer Layout**: *"Price and swatches sit on a justified horizontal row to maintain Elessi compact geometry. Drag-and-drop vertical ordering is overridden for the footer row."* |
| `card_02` | **Elessi 02 — Between Seams** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Centered | ⚠️ Fixed Stack | **Centered Seam Silhouette**: *"Archetype requires centered alignment to anchor neatly under the floating between-seam action pill."* |
| `card_03` | **Elessi 03 — Quick Shop Floating Pill** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Parallel Row | **Parallel Options Row**: *"Price and flat swatches share a single justified row to prevent card height jitter during hover."* |
| `card_04` | **Elessi 04 — Split Options Drawer** | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Built-in Drawer | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Centered | ⚠️ Fixed Stack | **Dual Split Button Layout**: *"Actions are integrated directly into a bottom split drawer (`Choose options` / `Add to cart` + `Quickview`). Text is centered to match the split symmetry."* |
| `card_05` | **Elessi 05 — 4-Icon Vertical Right Rail** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Left Aligned | ⚠️ Fixed Stack | **Asymmetric Right Rail**: *"Content is left-aligned to visually counterbalance the high-density vertical action rail anchored on the right."* |
| `card_06` | **Elessi 06 — Seam Full-Width Black Cart Bar** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Centered | ⚠️ Fixed Stack | **Full-Bleed Action Bar**: *"Text is centered to anchor directly beneath the full-width edge-to-edge cart bar at the base of the image."* |
| `card_07` | **Elessi 07 — Floating 3-Bubble Center Row** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Centered | ⚠️ Fixed Stack | **Centered Bubble Geometry**: *"Text is centered to align with the triad of floating circular action bubbles positioned at the image bottom."* |
| `card_08` | **Elessi 08 — Bottom Sticky Add to Cart Bar** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Centered | ⚠️ Sticky Button | **Baseline Locked Button**: *"The full-width Add to Cart button is permanently anchored to the bottom baseline (`mt-auto`) to guarantee uniform horizontal alignment across grid rows."* |
| `card_09` | **Elessi 09 — In-Between Seam Add to Cart Bar** | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Centered | ⚠️ Seam Anchor | **Seam Junction Button**: *"The action button sits specifically at the physical seam between the image and card body. Ordering relative to title is fixed."* |
| `card_10` | **Elessi 10 — Full Quick-Shop Slide Drawer** | ✅ 100% Dynamic | ✅ Drawer Integrated | ⚠️ In-Drawer Controls | ✅ 100% Dynamic | ✅ 100% Dynamic | ✅ 100% Dynamic | ⚠️ Drawer Priority | **Interactive Slide Drawer**: *"Swatches, sizes, quantity stepper, and Add to Bag are integrated into the slide-up drawer. If swatches are disabled in settings, the drawer simplifies to a direct quantity + Add to Bag drawer."* |

---

### 7.2 Customizer UI Behavior When a Control Is Exempt / Overridden

When the merchant selects an archetype with a locked or specialized layout in the Theme Customizer:
1. **Visual Feedback**: The specific control (such as `Alignment` or `Vertical Sorting`) does not show a broken state; instead, it displays an informative, non-intrusive badge or tooltip:
   ```
   [ℹ️ Locked by Selected Style]
   This archetype uses a dedicated geometric layout: [Specific Reason]
   ```
2. **Non-Destructive Persistence**: The merchant's saved settings for `card_alignment` and `card_elements_order` remain saved in the database. If the merchant switches back to a standard Base Theme (`style1`, `showcase_1`, etc.), their custom ordering and alignment instantly re-apply without any data loss.
3. **Core Functionality Never Disabled**:
   - Variation toggles (`enable_variant_swatches`, `card_show_sizes`, `card_show_swatches`, etc.) always control real data rendering across **ALL** styles.
   - Price order (Sale price first, compare price second) is **NEVER** overridden.
   - Visibility toggles (`card_show_stars`, `card_show_wishlist`, `card_show_quickview`, `card_show_quickcart`) always hide or reveal the respective buttons on **ALL** styles.

---

## 8. Zero Duplicate Swatches & Real-Data Standard (RULE SWATCH-DEDUPLICATION & RULE DS14)

1. **Zero Duplicate Swatches Across Entire Card**:
   - A card must never render double/duplicate variation swatches.
   - If an archetype has an interactive in-card drawer or quick-shop sheet (such as `card_10` / `sc_style10`), the single canonical instance of swatches (`finalRenderedGroups` from `ProductCardSwatches.tsx`) lives directly **inside the drawer/sheet** above the quantity/Add to Cart controls.
   - Under no circumstances may swatches be duplicated below the product title/price in the card footer if they are already rendered inside the interactive drawer.
2. **Canvas Containment & Alignment**:
   - Drawers, sheets, and action rails must remain strictly aligned within the card canvas boundaries (`inset-x-2 bottom-2` or designated container) without overflowing past card boundaries or causing horizontal scrollbars.
3. **100% Real Linked Elements**:
   - Title (`product.name`), category (`product.category?.name`), short description (`product.short_description`), star ratings, live sale & compare prices (`formatPrice`), and variation swatches must always link to real database records.
   - Zero fake dummy fallbacks (`['L', 'M', 'S']`, fake color circles, static 5-star ratings).

---

## 9. Real Variant Swatches Standard — 100% Admin Fidelity (RULE REAL-PRODUCT-SWATCHES & RULE DS15)

1. **Absolute Fidelity with Admin Edit Product**:
   - Every product card variation swatch (color, size, material, image) must strictly reflect the exact real configuration defined on the Admin Product Edit screen (`VariantAxisCard.tsx` / `VariantTableRow.tsx`).
   - If the merchant configures a specific color hex code (e.g. `#1f2937`) or a multi-color split gradient (e.g. `#ef4444,#ffffff`), the swatch MUST render using `getSwatchStyle(color_hex)`.
   - If the merchant leaves `color_hex` empty but names the color (e.g. "Light Grey", "Olive", "Navy", "Black"), the hex MUST be resolved automatically via `extractColorsFromName(color)` from `lib/utils/swatch.ts`. Never render transparent, blank, or arbitrary dark blue (`#2b3f56`) fallback dots.

2. **Real Variant Image Swatches**:
   - If a variant has a linked image URL and `show_image_swatch === true` (or settings are set to image swatches, or image is present without a custom color hex), the card swatch MUST render the real variant thumbnail via `getPresetImageUrl(image_url, 'card')` with `object-cover`.
   - Hovering or selecting the swatch immediately updates the active product card media to that variant's real image.

3. **Richest Variant Merge (No Attribute Loss)**:
   - When grouping variant rows by color, the reducer MUST merge attributes across all rows of that color. If row 1 (Size S) has `color: 'Red'` without an image while row 2 (Size M) has `color: 'Red'` with an image and hex, the merged swatch must retain the real image and hex. Never discard merchant data due to sparse variant rows.

4. **Zero Dummy/Fallback Data**:
   - Hardcoded arrays like `['L', 'M', 'S']`, fake blue `#2b3f56` dots, or static placeholder badges are strictly forbidden. If a product does not have variants or images, swatches cleanly collapse and do not render.

---

## 10. Universal Customizer Controls Enforcement Standard (RULE CARD-ALL-CONTROLS & RULE DS16)

Every single Theme Customizer control configured by the merchant in `ProductCardSettings.tsx` MUST remain 100% active, dynamic, and respected across ALL product card styles and archetypes without exception:

1. **Title Line Limit (`settings.title_line_limit`)**:
   - Must strictly apply `getSharedTitleClampClass(settings?.title_line_limit)`:
     - `'1'`: `line-clamp-1` with single-line minimum height
     - `'2'`: `line-clamp-2` with double-line minimum height for uniform catalog baselines
     - `'none'`: `line-clamp-none` full unwrapped title
   - **Banned**: Raw `truncate` or `white-space: nowrap` on `card-title` is strictly forbidden because it forces text to 1 line, breaking merchant customizer settings.

2. **Card & Body Alignment (`settings.card_alignment`)**:
   - Controls text and content justification (`alignClass`):
     - `'left'`: `items-start text-left`
     - `'center'`: `items-center text-center`
     - `'right'`: `items-end text-right`

3. **Star Ratings Visibility (`settings.card_show_stars`)**:
   - Toggles visibility of customer star ratings. When disabled, the entire rating row collapses. When enabled, only real database ratings (`product.rating > 0`) are shown with real review counts. Zero fake fallback ratings.

4. **Product Description Visibility (`settings.card_show_description`)**:
   - Dynamically toggles `product.short_description`. Renders with clamped styling when enabled, completely collapses when disabled.

5. **Action Buttons Visibility (`card_show_wishlist`, `card_show_quickview`, `card_show_quickcart`)**:
   - Each action button (Wishlist heart, Quick View eye, Add to Cart/Bag) MUST respect its independent visibility toggle across all 10 Elessi styles, Ella styles, and Base styles.

6. **Badges & Discount Visibility (`card_show_badge`, `show_sale_badge`)**:
   - Toggles custom badges (e.g. "Featured", "New") and auto sale percentage badges (`-{pct}%`).

7. **Swatches Configuration Controls**:
   - `enable_variant_swatches`: Master toggle for variation swatches across all cards.
   - `card_show_swatches` (Slot 1 / Colors), `card_show_sizes` (Slot 2 / Sizes), `card_show_materials` (Slot 3 / Materials), `card_show_custom` (Slot 4): Individual slot toggles.
   - `swatch_shape`: Toggles `'circle'` (`rounded-full`) vs `'square'` (`rounded-sm`).
   - `archive_swatch_size` / `swatch_size`: Sizing scale (`'sm'`, `'md'`, `'lg'`).
   - `swatch_limit`: Caps maximum visible swatches with a dynamic `+{remaining}` counter for the rest.
   - `archive_swatch_align`: Dynamic swatch row alignment (`'left'`, `'center'`, `'right'`).

8. **Aspect Ratio & Image Fit (`image_aspect_ratio`, `card_image_fit`)**:
   - Sizing dynamically derives from `getSharedAspectClass(settings?.image_aspect_ratio)` (`3:4`, `1:1`, `4:3`, `16:9`, `auto`).
   - Fit mode dynamically toggles `object-cover` vs `object-contain`.

---

## 11. RULE SWATCH-CLICK-IMAGE-SWAP & RULE DS17: Universal Swatch Interaction Image Swap Standard (MANDATORY)

Verified 2026-10. Across all storefront grids, catalog listings, search results, and quick-shop drawers, EVERY product card must adhere to the universal swatch interaction image swapping standard:

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

---

## 12. RULE NO-CARD-ARROWS: Card Clean Media Standard (Zero Carousel Arrows Over Cards) (MANDATORY)

Verified 2026-10. Across all card themes and archetypes (Base cards 01–05, Elessi styles 01–10, Ella variants 01–08, and Showcases):

1. **Zero Carousel Arrow Clutter on Product Cards**:
   - Product cards must NOT render floating chevron or navigation arrow buttons (`<` and `>`) over the product image area.
   - Arrow buttons clutter the card artwork, interfere with touch scroll ergonomics, and create unwanted DOM overlay layers.

2. **Clean Image Exploration Paradigm**:
   - Storefront card image exploration is exclusively driven by:
     - **Hover Secondary Preview**: Clean secondary photo swap/fade on desktop cursor hover (`image_hover_style` / `.i2`).
     - **Dynamic Swatch Linking**: Instant image update upon hovering or tapping color/material swatches (`RULE SWATCH-CLICK-IMAGE-SWAP`).
   - Deep multi-image gallery exploration belongs strictly inside the full PDP gallery (`ProductDetailGallery`) and the Quick View drawer/modal (`QuickViewModal`), where customers have full space and dedicated carousel controls.

---

## 13. RULE CARD-ACTION-WIRING: Universal Action Buttons Wiring Standard (Quick View & Quick Add) (MANDATORY)

Verified 2026-10. Across all card themes and archetypes (Base cards 01–05, Elessi styles 01–10, Ella variants 01–08, and Showcases):

1. **Quick View Action Wiring**:
   - The Quick View (Eye icon) button MUST reliably trigger `QuickViewModal` with the full product object and store settings.
   - Any wrapper or child card component (such as `EllaProductCard` / `EllaProductGrid`) must receive `onQuickView` callback and `originalSettings={settings}`, and ensure `QuickViewModal` is rendered in its JSX tree.

2. **Quick Add / Buy Icon Action Wiring**:
   - On products **without variants**: Clicking the cart/buy icon immediately adds 1 item to the cart, triggers a toast notification, and runs the fly-to-cart animation.
   - On products **with variants** (`product.has_variants === true`): Clicking the cart/buy icon MUST open `QuickViewModal` so the customer can select their desired size, color, and options before adding to cart. It must NEVER silently fail or do nothing.

3. **Wishlist Action Wiring**:
   - Must use the shared `useWishlist` hook with safe optional event handling (`toggleWishlist(e?: React.MouseEvent)`) ensuring compatibility whether called directly or via callbacks.

---

## 14. RULE MOBILE-CARD-DENSITY: Mobile Card Rating Margins & Swatch Elevation Standard (MANDATORY)

Verified 2026-10. Across all card themes and archetypes (Base cards 01–05, Elessi styles 01–10, Ella variants 01–08, and Showcases):

1. **Tight Mobile Rating Spacing**:
   - On mobile screens (`@media (max-width: 639px)`), star ratings (`.rating`, `.rat`) must use compact vertical margins: `margin-top: -2px` (or `0px`), `margin-bottom: -1px` (or `1px`), with `line-height: 1.15`.
   - Prevents bloated gaps between price, stars, and titles on compact mobile 2-column grids.

2. **Swatch Elevation & Bottom Margin Lift**:
   - Swatch containers (`.swatches`, `ProductCardSwatches`) must sit elevated above card bottom borders using responsive spacing `mt-1 sm:mt-2 mb-1 sm:mb-2` with `gap-1 sm:gap-1.5`.
   - On Ella cards, `.pc-body` gap on mobile must be `3.5px`, `padding-top: 8px`, and `padding-bottom: 6px` so swatch circles do not touch or collide with the card's bottom container boundary.
   - Across all Showcases and Standard/List cards, ratings use `my-0.5 sm:my-1` and swatches use `my-0.5 sm:my-1.5` with `mt-1 sm:mt-1.5` for prices.

3. **Strict Customizer Control Preservation**:
   - These spacing optimizations MUST NEVER break or bypass:
     - Rating toggle (`card_show_stars`),
     - Swatch toggles (`enable_variant_swatches`, `card_show_type_*`),
     - Customizer element ordering (`card_elements_order` up/down),
     - Title clamp limits (`title_line_limit`),
     - Card alignment (`card_alignment`).

---

## 15. RULE NEW-CARDS-ELLA-ENGINE: Future Card Expansion Standard (MANDATORY)

Verified 2026-10. Across all stores (TotVogue, Zaynahs, MiniMahal, LittleMister, Lobo):

1. **All New Cards MUST Use the Ella Engine Architecture**:
   - Whenever any new product card design, preset, or variation is created in the project, it MUST be built using the **Ella architecture** (`components/product-cards/`):
     - Add the new variant ID and layout configuration into `card-variants.json`.
     - Add the scoped variant CSS into `product-cards.css` (`.pc-grid[data-card="NN"]`).
     - Register the new style key in `lib/utils/cardStyles.ts` and `lib/types/settings.ts`.
     - Do NOT create bespoke standalone card files or append ad-hoc styles into legacy CSS files.

2. **Existing Live Cards Protection**:
   - Existing Base cards (01–05), Elessi styles (01–10), and Showcase cards remain protected and untouched to preserve active merchant stores and database settings without breaking production (`RULE BASE-CARDS`).



