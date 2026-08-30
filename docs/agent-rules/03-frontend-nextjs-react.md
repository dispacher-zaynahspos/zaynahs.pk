# 03 — Frontend Rules (Next.js / React)

- Follow App Router conventions — correctly separate server vs client components.
- Every page/component must have loading states, error boundaries, and empty states.
- Env vars (`NEXT_PUBLIC_*`) properly prefixed + `.env.example` kept up to date.
- Optimize images, fonts, and SEO metadata per Next.js best practices.

## CRITICAL SAFE ACCESS RULE
Always use `product.images?.[0]?.url` and `product.images?.find()`.
NEVER use `product.images[0].url` or bare array methods without `?.`.
Supabase relationships can be empty, and unsafe access crashes the entire Next.js page (causes "This page couldn't load"). Same rule applies to `variants`.

## Centralized Icons Rule
- Single source of truth: `components/common/Icons.tsx`.
- Always `import { ShoppingCart, User } from '@/components/common/Icons'`.
- NEVER import directly from `lucide-react` (or any icon library) in pages/components.

## Component Baseline Rules
- Every product card: image top, name, price, "Add to Cart" button.
- Bottom sticky cart bar on mobile — always visible when cart has items, with responsive dark-mode backgrounds.
- Skeleton loaders on every data fetch. No page without a loading state.
- Toast notifications (sonner) for all actions.
- **Category links**: always `/shop?category=slug` — never a dedicated `/category/[slug]` route unless it redirects to the shop page.
- **Scroll & focus restoration**: every product card click saves scroll position via `saveScrollPosition(product.id)`; every listing/grid page calls `useScrollRestoration()` on back-navigation. Full detail: [19-navigation-state-restoration.md](19-navigation-state-restoration.md) RULE N1.
- **Modal/popup performance**: never use CPU-heavy blurs (`backdrop-blur*`) on overlays — use solid/opacity overlays (`bg-black/60`). Add `will-change-transform` + `transform-gpu` to scrollable/modal containers. Apply `overscroll-contain` + smooth touch config.

## RULE C1 — Never `headers()`/`cookies()` in store pages
See [08-caching-isr-ssr.md](08-caching-isr-ssr.md) — calling these in any store Server Component (especially `generateMetadata`) kills ISR for the whole page (or app, if in root layout). Allowed ONLY in `app/robots.ts`, `app/sitemap.ts`, `app/admin/**`, `app/api/**`.

## Fully unpacked design/system rules live in dedicated files
- Colors, tokens, radii, shadows → [14-design-system.md](14-design-system.md)
- Shared component map → [15-shared-components-ui-modules.md](15-shared-components-ui-modules.md)
- Mobile/native-app card & touch rules → [17-mobile-native-app-style.md](17-mobile-native-app-style.md)
