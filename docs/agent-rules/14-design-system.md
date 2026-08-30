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
