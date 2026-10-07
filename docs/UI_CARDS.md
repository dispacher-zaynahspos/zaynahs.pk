# UI CARDS — Master Multi-Archetype Product Card System & Core DNA Rules

> **Single Source of Truth** for all product card design archetypes across TotVogue, Zaynahs, MiniMahal, LittleMister, and Lobo.  
> Aligned with `docs/agent-rules/14-design-system.md` (RULE DS2 & RULE DS12) and `docs/prompts/add_card_style_prompt.md`.

---

## 1. Core Architectural Philosophy: The Product Card DNA

Every card in the store—regardless of how unique, experimental, or branded its visual presentation is—**MUST remain 100% connected to the Core Store DNA**. No card style may ever omit, fake, or break any core store capability.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            UNIVERSAL STORE DNA                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. Variations / Swatches  ──► Live color/size swatches, dynamic price & img  │
│ 2. Action Triggers        ──► Wishlist (optimistic), Quick View, Quick Cart │
│ 3. Semantic Title         ──► Accessible Link, admin line-clamp (1, 2, none) │
│ 4. Dynamic Pricing        ──► PKR currency format, compare-at, discount chip│
│ 5. Media & Image Swap     ──► Aspect ratio (3:4, 1:1, auto), hover fade/zoom │
│ 6. Ratings & Social Proof ──► Stars & review counts (or editorial clean)    │
│ 7. Badges & Urgency       ──► Sale, New, Hot, Low Stock progress bar         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### The Anti-Monotony Principle
Traditional e-commerce templates look boring because every card uses the identical layout:
- Image on top
- Three round circular buttons floating in the top-right corner
- Vertical stack: Title → Stars → Price

In this multi-archetype system, **each archetype has a completely distinct DOM layout, element sequence, and action trigger format**, mimicking iconic global platforms like Zara, Daraz, Nike, Amazon, and Sephora.

---

## 1.1 RULE CARD-DIVERSITY: Absolute Ban on Reskinning (Mandatory Spatial & Visual Differentiation)

> ⛔ **CRITICAL PRIME DIRECTIVE**: Card styles me **sirf background colors, borders ya tint badalna aur layout/placements ko same rakhna STRICTLY BANNED hai.**
> Har card archetype ka DOM layout, looks, aur har individual element (icons, buttons, title, price, variations, badges, ratings) ki **PLACEMENT aur VISUAL SILHOUETTE genuinely alag-alag honi chahiye.**

### 1. Element Placements MUST Differ Across Card Archetypes:
- **Action Triggers & Icons Placement**:
  - ❌ *BANNED*: Har card par same top-right ke 3 circular buttons render karna.
  - ✅ *MANDATORY*: Action triggers must occupy radically different physical coordinates:
    - **Bottom Slide-Up Drawer**: Anchored to image bottom, revealing on hover/focus (Zara).
    - **Floating Corner FAB**: Circular bubble overlapping the image/body seam (Nike).
    - **Direct Full-Width Bottom Button**: Placed below price and urgency bar (Daraz).
    - **Split Dual-Action Footer**: 50/50 split buttons at the very bottom (Amazon).
    - **Center-Floating Hover Pill**: Floating over center of image + chic compact bag button below price (Sephora).
    - **Hairline Top Ghost Icon**: Minimalist top-right heart without heavy circular backgrounds.
- **Title Placement**:
  - Parallel with price on a single justified line (`flex justify-between`) (Zara).
  - Positioned beneath a category kicker tag (`BOYS FLEECE • 3 SIZES`) (Nike).
  - Positioned beneath star ratings and sale price (Price-First marketplace hierarchy).
  - Centered beneath shade swatches (Editorial beauty layout).
  - Standard top of card body (Classic).
- **Price Placement**:
  - Lead with price FIRST above the title (Flash deal / marketplace layout).
  - Parallel opposite the title on the same horizontal row (Haute fashion).
  - Centered below the title with large prominent typography (Minimalist boutique).
  - Directly above the direct action button accompanied by a live stock indicator (Urgency layout).
- **Variations & Swatches Placement**:
  - Positioned directly below the primary image before any text/title (Sephora shade strip).
  - Positioned between title and price (Nike size dots).
  - Positioned below price right above the action bar (Marketplace options strip).
  - Integrated inside the slide-up drawer as option selector.
- **Badges & Urgency Placement**:
  - Flame discount chip embedded inline right next to the sale price (`-40%`).
  - Top full-width deal banner ribbon above image (`LIMITED TIME DEAL`).
  - Micro live stock urgency bar above the direct button (`🔥 Only 4 Left In Stock`).
  - Standard top-left floating pill badges.

### 2. Element Looks MUST Differ (Distinct Visual Formats):
- **Typography Look**:
  - Heavy condensed athletic uppercase (Streetwear).
  - Elegant serif italics (Artisan boutique).
  - Crisp geometric sans-serif (Clean modern).
  - Technical micro text with wide letter-spacing (Luxury minimal).
- **Buttons & Triggers Look**:
  - Rounded pills, sharp rectangular blocks, floating round FAB bubbles, full-width slide drawers, split outline tabs.
- **Framing & Geometry**:
  - Zero-border edge-to-edge flush canvas vs `rounded-2xl` soft card vs heavy black framed architectural blocks.

### 3. Core Store DNA Remains 100% Intact Across All Placements:
- Different look and different placement does NOT mean missing functionality.
- Har alag placement ke sath variations (`has_variants`), pricing (`formatPrice`), discounts, wishlist state, quick view modal, cart updates, and 60fps performance 100% live rahenge.

---

## 2. Core DNA Engineering Rules (MANDATORY)

### CARD-DNA-1: Variations & Swatches Binding
- **Live Variant Selection**: When `show_variants` is enabled in settings and product has options (`product.has_variants === true`), swatches MUST render via `finalRenderedGroups`.
- **Intelligent Cart Reaction**:
  - Single-variant products (`has_variants === false`): Direct click fires `onAddToCart(e)` and adds item immediately.
  - Multi-variant products (`has_variants === true`): Button text changes dynamically (e.g. `Choose Options`, `Select Size`, `Select Shade`) and opens the options selection drawer or quick view modal.
- **Stop Propagation**: Swatch interactions must ALWAYS call `e.stopPropagation()` so tapping a swatch never accidentally navigates away to the product detail page.

### CARD-DNA-2: Action Triggers & Icon Formats
Action triggers must **NOT** always be three identical circles in the top-right corner. Each archetype chooses an action format suited to its brand silhouette:
1. **Slide-Up Bottom Drawer (`slide-drawer`)**: Anchored to image bottom; slides up on hover or mobile card focus with `+ QUICK ADD` / `CHOOSE OPTIONS` (Zara).
2. **Direct Action Button (`direct-button`)**: High-conversion full-width button sitting directly underneath the price/urgency bar (Daraz).
3. **Corner FAB Bubble (`corner-fab`)**: Floating circular action button overlapping the seam between image and card body (Nike).
4. **Split Dual-Action Footer (`split-bar`)**: 50/50 split buttons: `[ 👁 Quick View ]` (outline) and `[ 🛒 Add ]` (solid primary) (Amazon).
5. **Center-Hover Floating Pill (`center-pill`)**: Chic centered pill popping up on image hover: `[ Quick View 👁 ]` + chic outlined bag button below price (Sephora).
6. **Classic Floating Stack (`action-btn` / `floating`)**: 3 circular buttons on top-right (Classic & Showcase 1–16).

*All action buttons must sit at `z-[25]` with `pointer-events-auto`, `e.stopPropagation()`, and `e.preventDefault()`, ensuring they register cleanly above the background navigation link.*

### CARD-DNA-3: Semantic Title & Line-Clamping
- Titles must render as semantic `next/link` components wrapped with `saveScrollPosition(product.id)`.
- Respect merchant admin setting `settings?.title_max_lines`:
  - `1` → `.title-clamp-1` (`-webkit-line-clamp: 1`)
  - `2` → `.title-clamp-2` (`-webkit-line-clamp: 2`)
  - `none` → `.title-clamp-none`
- Must maintain disciplined typography: `0.72rem–0.78rem` on mobile, `0.82rem–0.90rem` on desktop with `line-height: 1.25` so titles never cause height imbalances.

### CARD-DNA-4: Dynamic Pricing & Discount Formatting
- Formatted via standard `formatPrice(currentPrice, currencySymbol)`.
- When `currentComparePrice > currentPrice`:
  - Strikethrough compare price renders with `.pold line-through text-gray-400`.
  - Discount percentage chip displays dynamically: `Math.round(((compare - price) / compare) * 100)% OFF`.
  - On deal-focused archetypes (Daraz `sc21`, Amazon `sc23`), price appears **before** the title to maximize conversion.

### CARD-DNA-5: Media, Aspect Ratios & Fit Modes
- Respect merchant settings:
  - Aspect Ratio: `3:4` (`aspect-[3/4]`), `1:1` (`aspect-square`), or `auto` (`aspect-auto`).
  - Fit Mode: `cover` (`object-cover`) or `contain` (`object-contain`).
- Image hover secondary swap via `ProductCardMedia` using hardware-accelerated CSS opacity transitions.
- Zero layout shift (CLS = 0): Image container must maintain rigid aspect geometry before and after image load.

### CARD-DNA-6: Ratings, Reviews & Social Proof
- Dynamic review stars and counts render when `show_reviews` is true and `showStars` is active.
- Visual format adapts to archetype:
  - Daraz: Amber pill `★ 4.8 (18 Sold)`
  - Amazon: Gold star string `★★★★★ (128)`
  - Sephora: Minimalist star dot `★ 5.0`
  - Zara: Purposefully hidden to preserve haute editorial luxury aesthetic.

---

## 3. Performance & Smooth Rendering Rules (Anti-Lag, Anti-Blur)

### ⛔ CARD-PERF-1: Absolute Ban on `backdrop-filter: blur(...)`
- **Why**: CSS backdrop blur causes severe compositor thread stall and frame drops (often dipping below 20fps) when scrolling fast on mobile devices (iOS Safari, Android Chrome).
- **Rule**: Product cards, badges, and card action buttons must **NEVER** use `backdrop-filter: blur(...)`.
- **Allowed Solution**: Use high-contrast solid backgrounds with clean opacity (e.g. `rgba(255, 255, 255, 0.95)`, `rgba(20, 20, 35, 0.95)`) or crisp hairline borders (`border border-black/5 dark:border-white/10`).

### ⚡ CARD-PERF-2: Hardware-Accelerated 60fps Transitions
- All hover and focus animations must animate **ONLY** composite properties:
  - `transform: translate3d(...)` / `scale(...)`
  - `opacity`
- **Banned in hover transitions**: Animating `height`, `width`, `top`, `bottom`, `left`, `right`, `margin`, or `padding`. Animating layout properties triggers costly synchronous reflows.

### 📱 CARD-PERF-3: Mobile-Native 2-Column Grid Discipline (< 640px)
Smartphones render product feeds in 2-column grids (~160px–180px per card).
1. **Container Padding**: Body padding strictly `6px–8px` (never `16px–24px`).
2. **Typography**: Titles clamped to `0.72rem` with `line-height: 1.25`.
3. **Action Button Scaling**:
   - Slide-up drawers: height `30px`, font size `9.5px`.
   - Corner FABs: `32px × 32px`, icon `13px`, positioned `bottom: -8px; right: 8px`.
   - Direct buttons: padding `5px 8px`, font size `10.5px`.
   - Split bars: padding `4px 4px`, font size `9.5px`.
4. **Touch Target Isolation**: Whole card background overlay `Link` sits at `z-[1]`. Action buttons and swatches sit at `z-[25]` with `stopPropagation()`. Tapping the card opens the product detail page; tapping an action button or swatch NEVER triggers page navigation.
5. **Single Mobile Focus (`useMobileCardFocus`)**: Only the card currently intersected or tapped by the user enters `.is-in-focus` state. Touch scrolling does NOT cause noisy flickering or simultaneous animations across all visible cards.

---

## 4. Element Placement, Collision Prevention & Icon Presets Standard

### 🛡️ CARD-COLLISION-1: Absolute Badges vs Action Icons Separation
1. **Badges Zone (Strictly Top-Left)**:
   - Sits at `position: absolute !important; top: 8px !important; left: 8px !important; z-index: 10 !important;`.
   - Must have `pointer-events: none !important;` so badges never block overlay links.
   - Must have `max-width: calc(100% - 46px) !important;` (mobile: `calc(100% - 36px)`). Long badges truncate or stack; they NEVER extend into the top-right action icon area.
2. **Action Icons Zone (Strictly Top-Right or Bottom)**:
   - Floating action stack sits at `position: absolute !important; right: 8px !important; top: 8px !important; z-index: 25 !important;`.
   - NEVER place floating action buttons on top-left where badges reside.
   - **No Position Overrides**: CSS rules for `.action-btn` or `.ai` must NEVER declare `position: relative` without specificity clearance, as this broke Tailwind's `.absolute` and caused buttons to flow statically to the top-left over badges.
   - When using corner-fab, the FAB bubble sits at bottom-right (`right: 10px; -bottom: 16px;`), while Wishlist and Eye remain anchored to top-right.

### 📐 CARD-ALIGN-1: Grid Baseline Button Alignment (`mt-auto`)
1. In 2-column mobile feeds and desktop catalog grids, adjacent cards frequently have uneven title lengths (1 vs 2 lines) or differing swatch presence (some have swatches, others do not).
2. To prevent jagged, uneven button heights across the grid:
   - Outer card container must have `flex flex-col h-full`.
   - Content container must have `flex flex-col flex-1 justify-between`.
   - Every bottom action button wrapper (`direct-btn-wrap`, `split-action-bar`, `marketplace-bottom-wrap`) must have `mt-auto w-full`.
   - This ensures all buttons align horizontally on the exact same baseline across every card in the row.

### 🔤 CARD-TYPO-1: Single-Line Button Typography & No-Wrap Standard
1. On narrow 2-column mobile cards (~160px width), action button text must **NEVER** wrap onto multiple lines (e.g. `SELECT` on line 1, `SHADE` on line 2).
2. Every card action button must include `whitespace-nowrap truncate`.
3. Typography scale: `text-[10px]` to `text-[11px] font-bold`, compact padding `py-1.5 px-2.5`, icon scale `h-3.5 w-3.5 shrink-0`.
4. Buttons with long text use compact phrases: `Options` / `Select` instead of long strings, `Quick Add` instead of verbose descriptions.

### 🎨 CARD-ICONS-1: 5 Distinct Action Icon Style Presets
Merchants can customize the aesthetic of Cart, Wishlist, and Quick View icons via `StoreSettings.card_icon_style`:
1. **Preset 1 — Modern Filled Pill (`pill`)**: Solid high-contrast circular badges (`bg-white dark:bg-[#16162a] shadow-md`), classic crisp icons.
2. **Preset 2 — Minimal Line (`minimal`)**: Thin featherweight strokes (`strokeWidth: 1.6`), borderless floating elegance, sleek minimal shopping bag and slender heart.
3. **Preset 3 — Luxury Metallic (`luxe`)**: Champagne gold fine micro-borders (`border-[#c9a44c]/40`), dark warm background, diamond charm wishlist and designer tote bag cart.
4. **Preset 4 — Neo-Brutalist Sharp (`brutalist`)**: Crisp 2px black geometric squircle border, hard offset shadow (`shadow-[2px_2px_0px_#000]`), bold high-contrast impact.
5. **Preset 5 — Floating Frost Glass (`glass`)**: Translucent tactile bubble (`bg-white/85 dark:bg-black/60`), delicate white hairline border, gentle shadow depth.

---

## 3.3 RULE CARD-RATIO-1: Multi-Aspect Ratio Standard (`3:4`, `1:1`, `4:3`, `16:9`, `auto`)

> 📐 **SSOT Image Aspect Ratio Rule**: Every card archetype, catalog grid, and shop list item MUST dynamically adapt to the admin's chosen aspect ratio without any CSS distortion or clipping.

1. **Canonical Supported Options (`IMAGE_ASPECT_RATIO_OPTIONS` in `lib/constants/productCardOptions.ts`)**:
   - `3:4` (Portrait — Fashion & Apparel) ──► `aspect-[3/4]`
   - `1:1` (Square — Jewelry & Accessories) ──► `aspect-square`
   - `4:3` (Landscape) ──► `aspect-[4/3]`
   - `16:9` (Wide — Tech, Lifestyle & Wide Banners) ──► `aspect-[16/9] aspect-video`
   - `auto` (Natural height) ──► `aspect-auto min-h-[220px] sm:min-h-[280px]`

2. **Single Source of Truth (`getSharedAspectClass` in `lib/utils/styles.ts`)**:
   - Sizing logic MUST ONLY be fetched from `getSharedAspectClass(settings?.image_aspect_ratio)`.
   - Normalizer cleanses `/`, `_`, spaces, and `by` (e.g., `16/9`, `16:9`, `wide`, `widescreen`, `video` all map cleanly to `aspect-[16/9] aspect-video`).

3. **No Hardcoded Heights or Aspect Ratios in CSS**:
   - ❌ *STRICTLY BANNED*: Hardcoding `aspect-ratio: 1`, `height: 320px`, or `padding-bottom: 125%` in `.img-box`, `.ib`, or `.z-card-container`.
   - ✅ *MANDATORY*: All image containers use `<div className={"img-box relative " + aspectClass + " w-full ..."}>` and Next.js `<Image fill ... />` with `fitClass` (`object-contain` or `object-cover`).

4. **Tailwind JIT Content Coverage**:
   - `tailwind.config.ts` content array MUST include `./lib/**/*.{js,ts,jsx,tsx}` so that dynamic aspect classes generated by `getSharedAspectClass` (`aspect-[16/9]`, `aspect-video`, `aspect-[3/4]`, `aspect-[4/3]`) are guaranteed to compile in production.

---

## 4. Multi-Archetype Reference Index (Sequential Cards 01–15)

| Canonical Key | Legacy Key | Class | Card Name & Archetype | Silhouette & Element Order | Action Format |
|---|---|---|---|---|---|
| `card_01` | `style1` | `sc-std` | **Card 01 — Classic Standard** | Image top → Badges → Title → Stars → Price → Swatches | 3 circular buttons top-right |
| `card_02` | `showcase_1` | `sc1` | **Card 02 — Neumorphic Soft Grey** | Soft grey inner shadows, pill badges | 3 circular buttons top-right |
| `card_03` | `showcase_8` | `sc8` | **Card 03 — Geometric Mondrian** | High-contrast black outlines, bold blocks | Square outlined buttons |
| `card_04` | `showcase_10` | `sc10` | **Card 04 — Organic & Wavy** | Warm cream curves, soft organic shapes | Soft rounded buttons |
| `card_05` | `showcase_11` | `sc11` | **Card 05 — Luxe Noir** | Black & gold, luxury dark mode aesthetic | Gold bordered dark buttons |
| `card_06` | `showcase_12` | `sc12` | **Card 06 — Pure Editorial** | Scandi minimal, stone background | Subtle monochrome circles |
| `card_07` | `showcase_13` | `sc13` | **Card 07 — Soft Pastel Glow** | Beauty & cosmetics, blush pink tone | Rose-accented circles |
| `card_08` | `showcase_14` | `sc14` | **Card 08 — Street Bold** | High-contrast urban, chunky borders | Heavy dark buttons |
| `card_09` | `showcase_15` | `sc15` | **Card 09 — Frosted Glass** | Clean crisp hairline borders | Clean minimal circles |
| `card_10` | `showcase_16` | `sc16` | **Card 10 — Terracotta Boutique** | Warm clay & earthy tones, italic serif title | Bisque-accented circles |
| `card_11` | `showcase_20` | `sc20` | **Card 11 — Zara Haute Editorial** | Edge-to-edge tall image → 1-line Title + Price parallel row → Swatches | **Slide-up bottom drawer (`+ QUICK ADD`)** |
| `card_12` | `showcase_21` | `sc21` | **Card 12 — Daraz Deal Rush** | Price first + discount % → Rating pill → Title → Urgency bar → Swatches | **Direct full-width bottom Cart button** |
| `card_13` | `showcase_22` | `sc22` | **Card 13 — Nike Streetwear** | Collection Kicker tag → Bold condensed title → Swatches → Price | **Floating corner FAB Cart bubble** |
| `card_14` | `showcase_23` | `sc23` | **Card 14 — Amazon Marketplace** | Limited Time Deal banner → Star ratings first → Price → Title → Swatches | **Split dual-action footer (`[ Quick View ] [ Cart ]`)** |
| `card_15` | `showcase_24` | `sc24` | **Card 15 — Sephora Chic** | Rounded-2xl → Swatches below image → Centered title & price → Star dot | **Center-hover pill (`Quick View 👁`) + Bag button** |

---

## 5. Adding New Card Styles Checklist

Whenever adding a new card style in the future, follow `docs/prompts/add_card_style_prompt.md`:
1. `lib/types/settings.ts`: Add key to `card_style` union type.
2. `components/admin/customizer/pages/ProductCardSettings.tsx`: Add option label to customizer select.
3. `components/store/product-card/ProductCardShowcases.tsx`:
   - Map style key to CSS class.
   - Implement archetype layout in `renderCardBody()`.
   - Bind all Core DNA: `product`, `currentPrice`, `currentComparePrice`, `discountPct`, `finalRenderedGroups`, `showWishlist`, `showQuickview`, `showQuickcart`, `showStars`.
4. `components/store/product-card/ProductCardActions.tsx`: If using a new action trigger format, define the variant.
5. `components/store/product-card/customCss.tsx`: Add scoped desktop CSS + `@media (max-width: 640px) .grid-cols-2` mobile overrides.
6. Verify with `tsc --noEmit` and run customer-flow smoke test.
