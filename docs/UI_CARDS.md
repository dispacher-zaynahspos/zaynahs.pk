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

## 4. Multi-Archetype Reference Index

| ID | Class | Archetype | Silhoutte & Element Order | Action Format |
|---|---|---|---|---|
| `style1` | `sc-std` | **00 — Classic Standard** | Image top → Badges → Title → Stars → Price → Swatches | 3 circular buttons top-right |
| `showcase_1` | `sc1` | **Showcase 1 — Neumorphic** | Soft grey inner shadows, pill badges | 3 circular buttons top-right |
| `showcase_8` | `sc8` | **Showcase 8 — Geometric Mondrian** | High-contrast black outlines, bold blocks | Square outlined buttons |
| `showcase_10` | `sc10` | **Showcase 10 — Organic & Wavy** | Warm cream curves, soft organic shapes | Soft rounded buttons |
| `showcase_11` | `sc11` | **Showcase 11 — Luxe Noir** | Black & gold, luxury dark mode aesthetic | Gold bordered dark buttons |
| `showcase_12` | `sc12` | **Showcase 12 — Pure Editorial** | Scandi minimal, stone background | Subtle monochrome circles |
| `showcase_13` | `sc13` | **Showcase 13 — Soft Pastel Glow** | Beauty & cosmetics, blush pink tone | Rose-accented circles |
| `showcase_14` | `sc14` | **Showcase 14 — Street Bold** | High-contrast urban, chunky borders | Heavy dark buttons |
| `showcase_15` | `sc15` | **Showcase 15 — Frosted Glass** | Clean crisp hairline borders | Clean minimal circles |
| `showcase_16` | `sc16` | **Showcase 16 — Terracotta Boutique** | Warm clay & earthy tones, italic serif title | Bisque-accented circles |
| **`showcase_20`** | `sc20` | **Showcase 20 — Zara Haute Editorial** | Edge-to-edge tall image → 1-line Title + Price parallel row → Swatches | **Slide-up bottom drawer (`+ QUICK ADD`)** |
| **`showcase_21`** | `sc21` | **Showcase 21 — Daraz Deal Rush** | Price first + discount % → Rating pill → Title → Urgency bar → Swatches | **Direct full-width bottom Cart button** |
| **`showcase_22`** | `sc22` | **Showcase 22 — Nike Streetwear** | Collection Kicker tag → Bold condensed title → Swatches → Price | **Floating corner FAB Cart bubble** |
| **`showcase_23`** | `sc23` | **Showcase 23 — Amazon Marketplace** | Limited Time Deal banner → Star ratings first → Price → Title → Swatches | **Split dual-action footer (`[ Quick View ] [ Cart ]`)** |
| **`showcase_24`** | `sc24` | **Showcase 24 — Sephora Chic** | Rounded-2xl → Swatches below image → Centered title & price → Star dot | **Center-hover pill (`Quick View 👁`) + Bag button** |

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
