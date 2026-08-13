# 🏪 Zaynahs E-Store — MASTER GEMINI RULES
> Replace your entire gemini.md file with this. Gemini Agent is fully autonomous — no manual steps.

## 🔗 Quick Links
- [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/SCHEMA_CHANGE_LOG.md)
- [STORE_GUIDE.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/STORE_GUIDE.md) (Contains GitHub & Supabase Credentials)
- [CLOUDFLARE_SUPABASE_SETUP.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/CLOUDFLARE_SUPABASE_SETUP.md) (Cache Rules, Webhooks, ISR Guide)
- [STORE_TESTING_GUIDE.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/STORE_TESTING_GUIDE.md) (Cache & Webhook Tests)
- [NEW_PROJECT_SETUP_GUIDE.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/NEW_PROJECT_SETUP_GUIDE.md) (Full clone & deploy guide)

---

# ⛔ RULE #0 — ABSOLUTE PRIME DIRECTIVE

1. **Fulfill the Request**: Modify, refactor, or create exactly what is asked without hesitation.
2. **Mobile First ALWAYS**: Every single component, page, layout must be designed mobile-first. Desktop is secondary.
3. **Direct Action**: Find relevant files and implement fixes directly — no asking unnecessary questions.
4. **DATA INTEGRITY FIRST**: Product, stock, order data is NEVER approximated. If uncertain → throw error.
5. **TypeScript Strict**: Every file is `.tsx` or `.ts`. No `any` types ever.
6. **No Email System**: This store uses WhatsApp only. Never suggest or implement email flows.
7. **Agent Executes**: Gemini agent runs all terminal commands autonomously. Never ask user to run commands manually unless absolutely required.
8. **Fast & Direct Work**: Work directly and quickly. Do not waste tokens on MCP tools, browser interactions, or reading unnecessary files. Resolve issues with direct code analysis and implementation.
9. **Product Card Styles & Templates**: Whenever creating, updating, or modifying product card styles, layout designs, swatches, badges, actions, or visual card themes, the agent MUST strictly follow the step-by-step implementation guide in [add_card_style_prompt.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/prompts/add_card_style_prompt.md).
10. **RULE D12 — FLASH SALE DISCOUNT & API CACHING (STRICTLY ENFORCED)**:
   - Flash Sale discounts (percentage or fixed) MUST apply directly to active selling price (`product.price`), preserving `comparePrice` as original compare price (or original price if compare price was null).
   - Dynamic product listing endpoints (such as `/api/products/list`) MUST use `Cache-Control: no-store, no-cache, must-revalidate` to prevent edge CDN price staleness across storefront pages.
   - Every production deploy MUST trigger `node scripts/post-deploy-fix.mjs` to purge Cloudflare CDN edge cache and avoid CSS/JS hash mismatch (`ChunkLoadError 404`).
   - **CRITICAL AGENT RULE**: The AI Agent MUST NEVER wait for the user to ask for a cache purge. After any `git push`, the Agent MUST use a synchronous bash chain to wait and purge: `git push origin main && sleep 120 && node scripts/post-deploy-fix.mjs`. NEVER use the background schedule/timer tool for this.

---

# 🤖 FULL STACK AUTONOMOUS AGENT RULES
(Next.js, React, Node.js, Vercel, GitHub, Supabase, Cloudflare | E-commerce + POS)

## 1. Core Operating Principles
- Pehle problem/root-cause samjho, phir fix karo — guess-based patch mat lagao
- Har change se pehle "kya break ho sakta hai?" check karo
- Existing code, schema, naming convention follow karo — rewrite se bacho
- Scope discipline: sirf jo mangi gayi cheez fix/build karo, unrelated refactor mana hai
- Agent apne decisions ka short summary log kare (kya fix kiya, kyun)

## 2. Error Detection & Auto-Fix Rules
- Build/lint/type errors: auto-detect → root cause identify → fix → re-run verify
- Runtime errors (console, server logs, Vercel logs, Supabase logs) monitor karke fix
- Fix ke baad automatically build/test chalao before "done" marna
- Destructive/uncertain fix se pehle explain karo, phir proceed
- Recurring error patterns `ERRORLOG.md` mein track karo (pattern + fix)

## 3. Frontend Rules (Next.js / React)
- App Router conventions follow karo (server vs client components sahi se separate)
- Loading states, error boundaries, empty states har page/component mein honi chahiye
- Env vars (`NEXT_PUBLIC_*`) properly prefix + `.env.example` update rakho
- Images, fonts, SEO metadata optimize karo (Next.js best practices)

## 4. Backend Rules (Node.js / API Routes)
- Har API route: input validation + try/catch + proper status codes
- Business logic (stock, orders, payments) atomic operations mein ho
- Sensitive actions (refund, stock adjust, delete) logging ke saath
- Rate limiting + auth check har protected route pe

## 5. Database Rules (Supabase)
- Schema change se pehle migration file + RLS policy check/update
- Naming: `snake_case`, existing pattern follow
- Kabhi bhi production pe destructive query (DROP/DELETE without WHERE) auto-run nahi
- Realtime-sensitive tables (POS inventory/orders) — race-safe RPC use karo
- Major schema change se pehle backup/rollback plan

## 6. Git & GitHub Rules
- Har logical change = separate commit, clear message (`fix:`, `feat:`, `chore:`)
- Direct `main` pe push mana — feature branch → PR flow
- Commit se pehle diff review (extra/accidental change check)
- `.env`, secrets, `node_modules` kabhi commit na ho

## 7. Deployment Rules (Vercel / Cloudflare)
- Deploy se pehle local build 100% pass hona chahiye
- Preview deploy pe test, phir production
- Env vars dashboard sync verify before deploy
- Fail hone pe logs se root-cause fix, blind retry mana
- Har production deploy ka rollback plan ready

## 8. E-commerce / POS Specific Rules
- Stock/inventory changes atomic + logged (double-sell na ho)
- Payment flow (JazzCash/EasyPaisa) — graceful fallback, silent fail mana
- Order/sale data kabhi lose na ho — offline queue/sync retry
- PKR pricing format consistent POS + storefront dono mein

## 9. Testing & Verification Rules
- Har fix/feature ke baad happy path + 1 edge case test
- Critical flows (checkout, payment, stock) manual/auto test mandatory
- Breaking change se pehle existing tests/build run

## 10. Autonomy Boundaries (Agent Permissions)
- ✅ Auto-allowed: lint/type fixes, non-destructive DB reads, local build/test, feature-branch commit+push, preview deploy
- ⚠️ Confirm-first: schema migration, production deploy, payment logic change, bulk data update
- ❌ Never auto: DROP table, delete prod data without backup, force-push main, expose/commit secrets

---

## 11. UI/UX Consistency Rules (Shared Design System)

### Golden Rule
- Naya page banane se pehle existing components check karo — naya mat banao
- Ek hi type ka UI element = ek hi component, poore app mein reuse

### Folder Structure (mandatory)
```
/components
  /ui          → base atoms (list neeche)
  /layout      → Header, Sidebar, Footer, PageWrapper, Container
  /shared      → reusable business components (ProductCard, OrderRow, StatCard)
  /forms       → form-specific composites (SearchForm, FilterForm, CheckoutForm)
  /store       → store-only composites
  /admin       → admin-only composites
```

### Design Tokens (single source of truth)
- Colors, spacing, radius, shadow, font-size — sirf `tailwind.config` / `theme.ts` mein define
- Hardcoded value (`#3b82f6`, `padding:13px`) kahin bhi mana hai
- Har naya UI element existing token se hi bane

### Complete Shared Component List (`/components/ui/`)

**Navigation & Structure**
- Navbar / TopBar, Sidebar (collapsible), Breadcrumb, Tabs, Pagination, BottomNav (mobile)

**Inputs & Forms**
- Button (primary, secondary, outline, ghost, danger, icon-button)
- Input (text, number, password, with-icon)
- SearchBar (debounce, clear icon, suggestions dropdown)
- Select / Dropdown, MultiSelect, Checkbox, RadioGroup, Switch/Toggle, Textarea
- DatePicker / DateRangePicker
- FileUpload / ImageUpload (drag-drop zone)
- FormField wrapper (label + error + hint — consistent everywhere)

**Data Display**
- Card (base + variants: ProductCard, StatCard, OrderCard)
- Table (sortable, paginated, row-select)
- List (drag-reorder support)
- Badge, Chip/Tag (removable, filter, category)
- Avatar, Tooltip, StatWidget, EmptyState
- Skeleton/Loader (page, card, table variants)

**Icons**
- Single `Icon` wrapper component (lucide-react based) — icon library mix mana hai
- Consistent size scale: `sm / md / lg` — hardcoded px mana hai

**Feedback & Overlay**
- Modal / Dialog, Drawer (side panel — mobile filters, cart)
- Toast/Notification, ConfirmDialog (destructive actions)
- ProgressBar, Spinner

**Drag & Interaction**
- DragHandle + SortableList (dnd-kit based)
- Draggable Card (kanban/order board views)
- Swipeable row (mobile — delete/edit actions)

**E-commerce/POS Specific Shared**
- ProductCard (grid + list variant), CartItem row, QuantityStepper (+/-)
- PriceTag (with discount strike-through), StockBadge (in/low/out-of-stock)
- OrderStatusBadge, PaymentMethodIcon set, CategoryChip / FilterChip bar

### Consistency Checklist (agent har naya page pe follow kare)
1. Same `PageWrapper`/layout use ho raha hai?
2. Same Button/Input/Card/Chip component use ho raha hai (naya nahi bana)?
3. Spacing/typography scale match karta hai baaki pages se?
4. Same loading/error/empty-state pattern hai?
5. Naya pattern chahiye to pehle 2-3 existing pages check karo
6. **MANDATORY**: Har naye admin page par product ya image thumbnail show karte waqt [ADMIN_UI_FEATURES_GUIDE.md](docs/ADMIN_UI_FEATURES_GUIDE.md) ko laazmi follow karein. Koi bhi admin table/list banate waqt is guide mein maujood UI rules (jaise TableThumbnail click pe Modal) apply karein.

### Anti-Patterns (kabhi na karo)
- ❌ Har page ka apna custom Button/Card
- ❌ Same data ke liye different card design har jagah
- ❌ Icon library mix (kabhi lucide, kabhi heroicons, kabhi svg direct)
- ❌ Copy-paste karke thoda modify karna instead of extending original component
- ❌ Drag-drop har jagah alag library/logic se implement karna

### Enforcement
- Naya UI banane se pehle agent khud check kare: "kya ye `/components/ui/` mein already hai?"
- `COMPONENTS.md` file maintain karo — list of all shared components + unka use-case

---

## 12. Multi-System Architecture Rules (/store vs /admin)

### Structure
```
/app
  /store    → customer-facing e-commerce (public)
  /admin    → POS / dashboard / management (auth-protected)
```

### Shared vs System-Specific
- **Shared (mandatory same everywhere):** Button, Input, Card base, Badge, Chip, Modal, Toast, Icon, Spinner, SearchBar base, FormField
- **System-specific (alag layout allowed, same tokens):**
  - `/store` → mobile-first, customer UX, minimal chrome, big touch targets, product-focused cards
  - `/admin` → data-dense, sidebar nav, tables, filters, desktop + tablet priority
- Dono systems **same design tokens** (color, spacing, radius, font) use karein — sirf layout density/purpose alag ho, base look-and-feel nahi

### Route-level Rule
- Naya `/store` page: sirf `/components/ui` + `/components/store` se import
- Naya `/admin` page: sirf `/components/ui` + `/components/admin` se import
- Agent kabhi `/admin`-style dense table `/store` mein ya `/store`-style card `/admin` mein bina reason ke copy na kare

---

## 13. Mobile Card / Native App Style Rules

### Visual Style (modern native-app feel)
- Rounded corners consistent scale: `rounded-xl` / `rounded-2xl` — sharp corners mana hai
- Soft shadows (elevation-based), not harsh borders — `shadow-sm/md` scale se
- Card padding consistent: `p-4` mobile, `p-5/6` desktop — hardcoded values mana
- Bottom sheet / drawer pattern for mobile actions (not full modal on small screens)
- Sticky bottom nav / action bar on mobile (cart, checkout, save)
- Pull-to-refresh pattern where relevant (order list, product list)
- Micro-interactions: tap scale (`active:scale-95`), smooth transitions (150-200ms)

### Card Component Rules
- Ek `BaseCard` component — sab variants (`ProductCard`, `OrderCard`, `StatCard`) isko extend karein
- Consistent card anatomy: image/icon top → title → meta/subtext → action row bottom
- Swipe actions on mobile cards (edit/delete) — same gesture pattern har jagah

### Responsive Rules
- Mobile-first build: pehle mobile layout design karo, phir `sm:` `md:` `lg:` breakpoints add karo
- Grid: mobile = 1-2 col, tablet = 2-3 col, desktop = 3-4 col — consistent across store/admin
- Touch targets minimum 44px height (buttons, icons, chips)
- Font scale responsive (`text-sm` mobile → `text-base` desktop) via single typography scale, not per-page overrides

### Anti-Patterns
- ❌ Store pe ek card style, admin pe dusra card style bina reason
- ❌ Desktop-first design jo mobile pe squeeze ho
- ❌ Har page apna alag bottom-sheet/modal pattern
- ❌ Inconsistent corner-radius/shadow across cards

# 🎨 DESIGN SYSTEM RULES (NON-NEGOTIABLE)

## Aesthetic: "Modern Pakistani E-Commerce — Premium Mobile"
- **Mobile First**: 375px base, scale up to tablet/desktop
- **Touch Targets**: Minimum 44px for all interactive elements
- **Font**: Geist (headings) + Inter (body) — loaded via next/font
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
- **Border Radius**: `rounded-2xl` for cards, `rounded-xl` for buttons
- **Shadows**: Soft elevation system — never hard box shadows
- **Animations**: Subtle — fade-in on load, scale on tap, slide-up for modals
- **Theme Switching (`next-themes`)**: Full class-based switcher using `next-themes` and a standard client-side `<ThemeToggle />` component. Declare class-based dark mode in Tailwind v4 with `@variant dark (&:where(.dark, .dark *))` in `globals.css`.
- **Text & Cart Contrast Integrity**: Always apply proper dark mode classes (e.g., `dark:bg-[#16162a]`, `dark:border-gray-800`, `dark:text-white`, `dark:text-gray-300`) directly on elements. Never use broad global utility overrides (like `.dark .bg-white`) inside `globals.css` to prevent specificity and contrast bugs.
- **Color Scale Standardization**: Never use non-standard Tailwind class numbers (e.g., `gray-250`, `gray-205`, `gray-955`, `gray-755`, `gray-55`, `gray-350`, `gray-550`, `red-550`). Only use standard, documented tailwind color weights (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950).

## Centralized Icons Rule
- **Single Source of Truth**: All icons MUST be imported from the centralized registry file: [Icons.tsx](file:///Users/shoaib/Desktop/Zaynahs%20e-store/components/common/Icons.tsx) (e.g., `import { ShoppingCart, User } from '@/components/common/Icons'`). Never import directly from `lucide-react` or any other icon library in individual pages or components.

## Component Rules
- Every product card: image top, name, price, "Add to Cart" button
- Bottom sticky cart bar on mobile (always visible when cart has items, styled with responsive dark backgrounds)
- Skeleton loaders on every data fetch
- Toast notifications (sonner) for all actions
- No page without loading state
- **Category Links**: All category links MUST open on the shop page with the category filter applied (e.g. `/shop?category=slug`). Never link to a dedicated `/category/[slug]` route unless it redirects to the shop page.
- **Storefront Scroll & Focus Restoration**: Every product card click must save scroll position via `saveScrollPosition(product.id)`, and every listing/grid view page (e.g. Homepage, Shop page, Wishlist) must call `useScrollRestoration()` to restore scroll and focus on back-navigation.
- **Modal & Popup Performance & Jitter Prevention**: To prevent device lag, jitter, or rendering slowness across all screen sizes (especially high-res desktop displays and mobile/tablet viewports):
  - **Banned Blurs**: NEVER use CPU-heavy blur filters (e.g., `backdrop-blur-sm`, `backdrop-blur-xs`, `backdrop-blur`) on modal backdrops or overlays. Always use high-contrast solid/opacity overlays (e.g., `bg-black/60`).
  - **GPU Hardware Rendering**: Add GPU acceleration triggers like `will-change-transform` and `transform-gpu` to scrollable containers and modal cards to delegate paint layers to the GPU, guaranteeing 60fps scrolling on all screens.
  - Apply `overscroll-contain` and smooth touch configurations to ensure layout integrity.
- **RULE DS1 — DYNAMIC THEMING & CONTRAST VISIBILITY (MANDATORY)**:
  - **Always Theme-Bound**: Never hardcode static dark/light backgrounds (e.g., solid charcoal `#111827`, dark navy `#1a1a2e`) in custom elements, panels, or floating controls. They MUST be mapped to dynamic CSS theme classes (e.g., card surface using `bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white`) so they seamlessly adapt to any theme preset (e.g., green, orange, navy) or dark/light mode switches.
  - **Accents & Buttons**: Interactive button assets, highlight badges, and links must inherit theme variables (`bg-primary`, `bg-accent`, `text-primary`, `text-accent`) rather than static color values to stay consistent with the user's active theme.
  - **Resolve Input Double Borders**: When building inline form groups or inputs inside border-bound containers, always apply `style={{ borderWidth: 0 }}` inline on number and text inputs. This suppresses native borders forced by global styles (`globals.css` overrides) and renders clean, single-bordered unified inputs.
  - **Responsive & Mobile Card Layouts**: All bulk editors, detail panels, and settings forms must use a responsive grid (`grid grid-cols-1 md:grid-cols-3` or similar) that aligns items cleanly side-by-side on desktop/tablets and stacks them into high-comfort touchcards on mobile views.
  - **RULE DS2 — DYNAMIC PRODUCT CARD STYLE TEMPLATES & SETTINGS LINKING (MANDATORY)**:
    - Whenever adding, implementing, or modifying any product card design layout or template, the agent MUST ensure it is fully linked to all dynamic customizer settings (such as Image Aspect Ratio (`aspectClass`), Image Hover Style (`imageHoverStyle`), vertical element ordering (`elementsOrder` and `renderShowcaseContent`/`renderElement`), text alignment classes (`alignClass`), star rating visibility (`showStars`), swatches, quick view, wishlist, and cart action overlays).
    - Specifically, the card template MUST support dynamic multi-badge vertical stacking (via the unified `<div className="bdg-container"> {renderCardBadge()} </div>` flexbox) just like the default style1 (`style1`) layout.
    - The agent must strictly follow the step-by-step implementation checklist in [add_card_style_prompt.md](file:///Users/shoaib/Documents/zaynahsestore-tv-main/docs/prompts/add_card_style_prompt.md) and keep all templates completely synchronized.
  - **RULE DS3 — SKELETON LOADERS (MANDATORY)**: Never use a global `app/loading.tsx` file for page loading states as it completely blocks the UI (hiding Navbar, Footer, etc.) and ruins the perceived performance. Instead, ALWAYS use component-level skeletons (e.g., mapping `<ProductCardSkeleton />` or `<LoadingSkeleton />` inside the page layout) to provide immediate feedback while keeping the application layout visible. Ensure fast loading by rendering these skeletons instantly while data is fetching.

---

# 🗄️ DATABASE RULES

## Tables (Source of Truth)
```
products          → core product data
product_variants  → color/size/material combinations with price+stock
product_images    → multiple images per product
categories        → product categories
store_settings    → WhatsApp number, store name, logo, currency
orders            → WhatsApp orders tracking (optional)
```

## RULE D1 — VARIANT STOCK IS MANDATORY
Every product with variants MUST track stock per variant in `product_variants.stock`.
`products.stock` = sum of all variant stocks (or direct stock if no variants).

## RULE D2 — IMAGE STORAGE
All images go to Supabase Storage bucket: `product-images`
Public URL stored in `product_images.url`
Never store base64 in DB.

## RULE D3 — SETTINGS SINGLETON
`store_settings` always has exactly ONE row.
ID: `00000000-0000-4000-8000-000000000001`
Never create second row.

## RULE D7 — SUPABASE API-ONLY OPERATIONS (STRICTLY ENFORCED)

> ⚠️ **CRITICAL DIRECTIVE**: Ab se har Supabase operation — schema migration, SQL query, auth config, user management, storage buckets, RLS policies, webhooks, edge functions, secrets, network rules, SSL, custom domains, branches, data CRUD — sab kuch **sirf Management API ya Service API** ke through hoga.

- **❌ BANNED:** Prisma, Prisma Migrate, direct Postgres connection strings, `psql`, Supabase CLI `link`, Supabase CLI `db push`, or any SQL client that connects via DB password.
- **✅ ALLOWED:** `curl` with `sbp_` token (Management API) ya `service_role` key (Service API). Full reference: [SUPABASE_API_GUIDE.md](file:///Users/shoaib/Documents/zaynahsestore-tv-main/docs/SUPABASE_API_GUIDE.md)
- **Rule:** Koi bhi feature ya database change implement karte waqt, pehle [SUPABASE_API_GUIDE.md](file:///Users/shoaib/Documents/zaynahsestore-tv-main/docs/SUPABASE_API_GUIDE.md) check karo. Wahan har operation ka curl example milega. Agar koi operation missing ho toh guide ko update karo.
- **Schema migrations:** `supabase/migrations/` files banao, but unhe DB pe apply karo via `POST /v1/projects/{ref}/database/migrations` (Management API). Kabhi bhi `supabase db push` ya `psql` mat chalana.
- **RLS Policies & Storage Policies:** SQL ke through Management API ke `database/query` endpoint se. Kabhi bhi Dashboard ya psql se nahi.
- **Auth users:** `POST /auth/v1/admin/users` (Service API) se. Kabhi bhi Dashboard ya direct SQL se nahi.
- **Storage buckets:** `POST /storage/v1/bucket` (Service API) se. Kabhi bhi Dashboard se nahi.

## RULE D8 — UNIVERSAL REVALIDATE SECRET (STRICTLY ENFORCED)
The webhook revalidation secret `REVALIDATE_SECRET` must **ALWAYS** be exactly `zaynahs_secret_cache_revalidate_2026` across all clones and instances.
- Never generate or use a random secret for this value. 
- It must be hardcoded in `.env.local`, Vercel environment variables, `NEW_PROJECT_SETUP_GUIDE.md`, and Supabase triggers. This ensures multi-domain clones don't break database webhooks.
- Testing and manual curl triggers in `STORE_TESTING_GUIDE.md` must strictly use this secret.
- **Vercel API Sync:** The agent MUST always ensure this secret is synced correctly across all connected Vercel projects (e.g., MiniMahal and Totvogue) using the Vercel REST API (`PATCH /v9/projects/{id}/env/{env_id}`). Never leave Vercel with a mismatched secret.

## RULE D11 — NO DUPLICATE FOREIGN KEY CONSTRAINTS (STRICTLY ENFORCED)
- Never create duplicate foreign key constraints on the same pair of tables (e.g., `fk_products_size_guide` vs `products_size_guide_id_fkey`).
- Duplicate foreign key constraints cause Supabase PostgREST error `PGRST201: Could not embed because more than one relationship was found`, breaking API responses and hiding all products (`0 products found`).
- Always check existing foreign key names before creating a constraint. If an old legacy constraint exists, drop it using `ALTER TABLE <table> DROP CONSTRAINT IF EXISTS <legacy_name>;`.
- Storefront service queries (`staticSupabase` in `lib/services/products.ts`, `categories.ts`, `sections.ts`, etc.) MUST always use `SUPABASE_SERVICE_ROLE_KEY` with fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY` to prevent RLS and schema caching bugs.

## RULE D4 — SOFT DELETE
Never hard delete products. Use `products.active = false`.
Admin can restore. Customer catalog never shows `active = false` products.

## RULE D5 — SCHEMA CHANGE LOG
Every DB change MUST be logged in [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/SCHEMA_CHANGE_LOG.md) with date, files changed, what changed.

## RULE D6 — FULLY SELF-CONTAINED MASTER SCHEMA & SETUP GUIDE (STRICTLY ENFORCED)
⚠️ **CRITICAL DIRECTIVE**: Ab koi bhi AI agent/developer jab bhi koi naya feature ya database change banayega, woh **paband** hai ke code update karte hi usi waqt `SUPER_MASTER_SCHEMA.sql` ko bhi update karega. Koi bhi database column, table, index, or constraint master schema mein missing nahi hona chahiye.

Whenever any feature is added, changed, or removed in the application, both:
1. The master schema database file: [SUPER_MASTER_SCHEMA.sql](file:///Users/shoaib/Desktop/Zaynahs%20e-store/supabase/schema/SUPER_MASTER_SCHEMA.sql)
2. The complete step-by-step setup guide: [NEW_PROJECT_SETUP_GUIDE.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/NEW_PROJECT_SETUP_GUIDE.md)
MUST be immediately updated to reflect these changes. The repository must always remain 100% ready to clone and deploy.
Running/pasting the schema into the Supabase SQL Editor must instantly set up the entire database without requiring ANY manual configuration.
Specifically, the schema must automatically handle:
- Creating all tables, constraints, foreign keys, and indexes.
- Enabling Row Level Security (RLS) on all tables and creating all client/admin policies.
- Automatically creating the Supabase Storage bucket (`product-images`) and its public read/write policies.
- Enabling Supabase Realtime publications (`supabase_realtime`) for all required tables (e.g. `orders`, `abandoned_carts`).
- Defining all trigger functions, sequences, and triggers (e.g. dynamic rating synchronizer, order auto-increment, abandoned cart order linking).
Never ask the user to manually set up any tables, policies, buckets, or realtime settings in the Supabase dashboard.

## RULE D6b — SCHEMA & CODE MUST BE 100% UNIVERSAL — NO HARDCODED PROJECT/BRAND VALUES (STRICTLY ENFORCED)
- `SUPER_MASTER_SCHEMA.sql` is the single shared schema for ALL store clones (TotVogue, Zaynahs, MiniMahal, LittleMister, and any future clone).
- **NEVER hardcode any of these in `.ts`, `.tsx`, `.sql`, `.mjs`, `.js` source files:**
  - Brand names (`TotVogue`, `Zaynahs`, `MiniMahal`, `LittleMister`)
  - Domains (`totvogue.pk`, `zaynahs.pk`, `minimahal.com`, `littlemister.pk`)
  - Store-specific URLs, phone numbers, WhatsApp numbers, addresses
- **Seed data in schema** MUST use generic placeholders: `'Your Store Name'`, `'https://domain.com'`, `'Your Store'`
- **Dynamic values** MUST come from: `store_settings` DB table → `settings.storeName`, `settings.storeUrl`, `settings.whatsappNumber`
- **URL replacement logic in triggers/functions** MUST only match generic template patterns (`https://domain.com`, `http://localhost`) — NEVER hardcode a specific live domain
- **Verify before any commit:** `rg "totvogue|zaynahs\.pk|minimahal|littlemister" --glob '*.ts' --glob '*.tsx' --glob '*.sql' --glob '*.mjs'` — result MUST be empty (0 matches) in source files

---

# 📁 PROJECT STRUCTURE

```
zaynahs-estore/
├── app/
│   ├── (store)/                    ← Customer facing
│   │   ├── page.tsx                ← Homepage / Catalog
│   │   ├── product/[slug]/page.tsx ← Product Detail
│   │   ├── cart/page.tsx           ← Cart Review
│   │   └── layout.tsx
│   ├── admin/                      ← Admin Panel
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── revalidate/route.ts     ← ISR revalidation
│   └── layout.tsx                  ← Root layout
├── components/
│   ├── store/                      ← Customer components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── CartBar.tsx             ← Sticky bottom cart
│   │   ├── CartSheet.tsx           ← Slide-up cart drawer
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   ├── VariantSelector.tsx
│   │   └── WhatsAppButton.tsx
│   ├── admin/                      ← Admin components
│   │   ├── ProductForm.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── VariantBuilder.tsx
│   │   ├── CategoryModal.tsx
│   │   └── StatsCard.tsx
│   └── common/
│       ├── Navbar.tsx
│       ├── LoadingSkeleton.tsx
│       ├── EmptyState.tsx
│       └── MobileNav.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Browser client
│   │   ├── server.ts               ← Server client
│   │   └── admin.ts                ← Service role client
│   ├── services/
│   │   ├── products.ts             ← All product CRUD
│   │   ├── categories.ts
│   │   ├── storage.ts              ← Image upload/delete
│   │   ├── settings.ts
│   │   └── orders.ts
│   ├── hooks/
│   │   ├── useCart.ts              ← Cart state (zustand)
│   │   ├── useProducts.ts
│   │   └── useSettings.ts
│   ├── utils/
│   │   ├── whatsapp.ts             ← Message generator
│   │   ├── price.ts                ← Format PKR
│   │   └── slug.ts
│   └── types.ts                    ← All TypeScript interfaces
├── store/
│   └── cartStore.ts                ← Zustand cart store
├── supabase/
│   ├── schema/
│   │   └── SUPER_MASTER_SCHEMA.sql ← Single source of truth
│   └── migrations/                 ← Incremental migrations
├── docs/                           ← All documentation
│   ├── SCHEMA_CHANGE_LOG.md        ← DB change history (update on every change)
│   ├── CLOUDFLARE_SUPABASE_SETUP.md ← Cache rules, webhooks, ISR guide
│   ├── STORE_GUIDE.md              ← GitHub & Supabase credentials
│   ├── STORE_TESTING_GUIDE.md      ← Cache & webhook test commands
│   ├── NEW_PROJECT_SETUP_GUIDE.md  ← Clone & deploy steps
│   ├── VERCEL_BUILD_FIXES.md       ← Known build error fixes
│   ├── LESSONS_LEARNED.md          ← Past bugs & fixes
│   └── prompts/                    ← Feature implementation prompts
├── public/
│   └── icons/
├── .env.local
├── gemini.md
└── AGENTS.md
```

---

# 🛒 WHATSAPP ORDER FLOW RULES

## RULE W1 — MESSAGE FORMAT
```typescript
// lib/utils/whatsapp.ts
export const generateWhatsAppMessage = (cart: CartItem[], settings: StoreSettings): string => {
  const lines = cart.map(item => {
    const variant = item.selectedVariant 
      ? ` (${Object.values(item.selectedVariant).join(', ')})` 
      : '';
    const modifiers = item.selectedModifiers?.length 
      ? ` + ${item.selectedModifiers.map(m => m.name).join(', ')}` 
      : '';
    return `• ${item.product.name}${variant}${modifiers} x${item.quantity} = ${formatPrice(item.total)}`;
  });
  
  const total = cart.reduce((sum, item) => sum + item.total, 0);
  
  return [
    `*${settings.storeName} — New Order*`,
    ``,
    ...lines,
    ``,
    `*Total: ${formatPrice(total)}*`,
    ``,
    `Please confirm my order. Thank you! 🙏`
  ].join('\n');
};

export const buildWhatsAppURL = (phone: string, message: string): string => {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};
```

## RULE W2 — REDIRECT TARGET
- Mobile: opens WhatsApp app directly
- Desktop: opens web.whatsapp.com
- Always use `wa.me` format — never `api.whatsapp.com`
- Phone number stored WITHOUT + or spaces in DB

---

# 🖼️ SUPABASE STORAGE RULES

## RULE S1 — BUCKET SETUP
```sql
-- Run once in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Public read policy
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admin upload policy  
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Admin delete policy
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

## RULE S2 — IMAGE UPLOAD PATTERN
```typescript
// lib/services/storage.ts
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<string> => {
  const ext = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}.${ext}`;
  
  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });
    
  if (error) throw error;
  
  const { data } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(fileName);
    
  return data.publicUrl;
};

export const deleteProductImage = async (url: string): Promise<void> => {
  // Extract path from URL
  const path = url.split('/product-images/')[1];
  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .remove([path]);
  if (error) throw error;
};
```

## RULE S3 — IMAGE OPTIMIZATION
Always use Next.js `<Image>` component with:
```tsx
<Image
  src={imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, 33vw"
  className="object-cover"
  priority={isAboveFold}
/>
```


## RULE A1 — ADMIN MIDDLEWARE
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = createServerClient(/* ... */);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```

## RULE A2 — NO CUSTOMER ACCOUNTS
Customers do NOT register or login.
Cart is stored in localStorage via Zustand persist.
Orders go via WhatsApp only.

---

# 📱 MOBILE FIRST RULES

## RULE M1 — BREAKPOINTS
```
Default (mobile): 375px+
sm: 640px+   ← tablet portrait
md: 768px+   ← tablet landscape  
lg: 1024px+  ← desktop
xl: 1280px+  ← wide desktop
```

## RULE M2 — STICKY CART BAR
Always visible on mobile when cart has items:
```tsx
// Fixed bottom bar — above everything
<div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
  <CartBar />
</div>
```

## RULE M3 — TOUCH GESTURES
- Product images: swipeable gallery (use embla-carousel)
- Cart sheet: swipe down to close
- Category filter: horizontal scroll, no wrap

## RULE M4 — TOUCH-FIRST SCROLLABLE OVERLAYS (UPDATED v1.0.8)
All overlays, popups, filters, search suggestion pools, and mobile drawer menus that open on mobile/tablet must have touch-first scrolling starting from the top down. 
- These components MUST use `overscroll-contain`, `touch-pan-y` enabled, and be structured to scroll naturally from the top without nested scroll containers that hijack touch gestures.
- **Scrolling Smoothness**: All scrollable modal lists, cards, tables, and dropdowns MUST declare `overscroll-contain touch-pan-y` and inline CSS `style={{ WebkitOverflowScrolling: 'touch' }}` (or `-webkit-overflow-scrolling: touch`) to enforce native momentum/inertia scrolling on iOS Safari and WebKit mobile viewports to prevent lags and heavy frames.

---

# 🔄 NAVIGATION & STATE RESTORATION RULES (MANDATORY FOR NEW PAGES)

## RULE N1 — STOREFRONT SCROLL & FOCUS RESTORATION
- **Mechanism**:
  - Whenever a customer clicks a product card on a listing page (Homepage / Shop / Wishlist), we must call `saveScrollPosition(product.id)` which stores the current page path, scroll position `scrollY`, and the product ID into `sessionStorage`.
  - When the customer returns back, `useScrollRestoration()` checks the path. If matched, it restores the scroll position instantly via double requestAnimationFrame (`window.scrollTo({ top, behavior: 'instant' })`) and triggers focus on the active product card.
  - The restored card element gets temporary CSS highlight class `scroll-restore-highlight` which pulses a subtle border shadow/glow to guide the customer's eye.
- **Rule**: Never remove `useScrollRestoration` or the `id={product-card-${product.id}}` bindings from product card templates. **Any new storefront listing page or grid view created in the future must call `useScrollRestoration()` and bind the click save handlers.**

## RULE N2 — ADMIN URL-BASED TAB PERSISTENCE
- **Mechanism**:
  - Any page in the admin console with multiple tabs (such as settings, reviews, leads, customers, trash, media) must persist the active tab ID in the URL as a query parameter (default: `?tab=tabId`).
  - Use the custom hook `useAdminTab` under `lib/hooks/useAdminTab` to read and push URL parameters on tab changes via router replaces with `scroll: false`.
  - For pages containing these search param-bound tabs, the parent layout/page component MUST wrap the client component inside a React `<Suspense>` boundary to prevent de-optimizing static generation build-time errors.
- **Rule**: Avoid keeping transient tab index states in local React state variables (`useState`) when those tabs form key navigation blocks. **All future admin sub-dashboards or settings tabs must utilize this URL-based persistence hook.**

## RULE N3 — SCROLL RESET TO TOP ON NAVIGATION & TABS (MANDATORY)
- **Mechanism**:
  - Next.js does not automatically scroll nested scrollable layout containers (e.g. `<main id="admin-main-content">` inside admin dashboard) to the top on page or URL query changes (like changing setting tabs `?tab=shipping`).
  - To prevent pages/tabs from loading scrolled down or focusing on the footer, we MUST:
    1. In the admin layout, give the scrollable main container the ID `admin-main-content` and reset its scroll position (`mainEl.scrollTop = 0`) inside a `useEffect` listening to `pathname` and `searchParams` changes.
    2. In the storefront layout/navbar, reset the `window` scroll position (`window.scrollTo({ top: 0, behavior: 'instant' })`) inside a `useEffect` on pathname/searchParams changes, EXCEPT when a scroll restoration is scheduled (`store_scroll_restore` exists in sessionStorage).
  - **Rule**: All future pages or scrollable layouts must implement these scroll-reset behaviors to ensure the viewport always starts at the top.


---

## OG META RULE

This is a multi-domain system. totvogue.pk and zaynahs.pk are separate brands.

**RULE: Every page that has `generateMetadata()` MUST follow this exact pattern:**

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

**NEVER:**
- Hardcode "TotVogue" or "Zaynahs" in any `generateMetadata()`
- Use `settings.storeName` in `generateMetadata()`
- Use `settings.tagline` in `generateMetadata()`
- Skip `generateMetadata()` on any new page

**ALWAYS:**
- Import `getDomainBrand` from `@/lib/utils/getDomainBrand`
- Call it at the top of every `generateMetadata()`
- Use `brand.name` for ALL title and OG name fields
- Use `brand.tagline` for ALL description fields when no specific description

When adding a new page, category, or route:
- Copy `generateMetadata()` pattern from an existing working page
- Never write brand name as a string literal
- `getDomainBrand()` handles everything automatically

# 🔧 FEATURE IMPLEMENTATION WORKFLOW

Always follow this order:

1. **SQL Migration** → create file in `supabase/migrations/`
2. **Update SUPER_MASTER_SCHEMA.sql** → keep in sync
3. **Update types.ts** → TypeScript interfaces
4. **Services** → CRUD in `lib/services/`
5. **Hooks** → React hooks in `lib/hooks/`
6. **UI Component** → Mobile first, follow design rules
7. **Update [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/SCHEMA_CHANGE_LOG.md)** → document everything

---

# 🚨 ERROR HANDLING

```typescript
// Standard pattern for all service functions
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('[products] getProducts failed:', error);
    throw error;
  }
};
```

---

# 🚀 MIGRATION RULES

Every DB change:
1. Create `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Update `supabase/schema/SUPER_MASTER_SCHEMA.sql`
3. Log in [SCHEMA_CHANGE_LOG.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/SCHEMA_CHANGE_LOG.md)

---

# ⚡ NEXT.JS CACHING RULES

## Caching Strategy
For Zaynahs E-Store, use **Next.js built-in cache + revalidateTag** (ISR) as the primary caching strategy combined with Cloudflare Edge CDN cache purging.

- **Kyun (Rationale):**
  - Zero extra cost or third-party infrastructure.
  - Vercel automated global CDN edge caching.
  - On-demand revalidation: When products/categories/settings are updated in the admin panel, trigger revalidation to instantly refresh the storefront and purge Cloudflare Edge cache.

## Rule for New Pages/Features Caching
Whenever a new database-driven feature or page is added:
1. **Cache Data Fetches**: Wrap data retrieval queries inside `unstable_cache(fn, keyParts, { revalidate: 3600, tags: [tag] })` in the service files under `lib/services/`.
2. **Implement Revalidation Helper**: Add a revalidation helper function inside [revalidate.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/lib/revalidate.ts) that:
   * Revalidates the Next.js cache tags.
   * Purges the specific page URLs (and if layout is affected, calls `purgeCloudflareEverything()`) from Cloudflare Edge cache using the zone API.
3. **Trigger on CRUD**: Call the revalidation helper in the corresponding service files (e.g., inside `create`, `update`, `delete` functions).
4. **Hook up Webhooks**: Update the trigger dispatcher inside the `/api/revalidate` webhook route ([route.ts](file:///Users/shoaib/Desktop/Zaynahs%20e-store/app/api/revalidate/route.ts)) to handle changes originating directly from Supabase DB triggers.

## Next.js 16 Type-Safety Standard
In this codebase (Next.js 16), `revalidateTag` type definition expects 2 arguments, but standard runtime execution only needs 1.
* **MANDATORY**: You MUST cast the `revalidateTag` call to `any` to allow compile-time checks to pass without error:
  ```typescript
  (revalidateTag as any)('your-cache-tag');
  ```
  *Never* call `revalidateTag('tag')` directly without the `as any` typecast wrapper, otherwise the TypeScript compilation (`tsc`) will fail with argument count errors (`TS2554`).

## Automated Cache, Webhooks & DNS Setup
- **MANDATORY FOR NEW FORKS**: For configuring database webhooks, Cloudflare cache rules, and google-site-verification DNS TXT records automatically, refer to [CLOUDFLARE_SUPABASE_SETUP.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/CLOUDFLARE_SUPABASE_SETUP.md). The agent MUST run the 1-click terminal commands documented in that file instead of manually creating webhooks, cache rules, or DNS verification records. The Cloudflare deployer script automatically handles creating or updating the `google-site-verification` DNS TXT record matching the `GOOGLE_SITE_VERIFICATION` value in `.env.local`.

## ⚠️ ISR Cache — Critical Rules (MANDATORY)

### RULE C1 — NEVER `headers()` or `cookies()` in Store Pages
Calling `headers()` or `cookies()` in ANY Server Component (especially `generateMetadata`) forces the **entire page** into dynamic rendering → `cache-control: private, no-store` → ISR completely disabled.

```ts
// ❌ FORBIDDEN in app/layout.tsx, app/(store)/**/page.tsx, any store component
import { headers } from 'next/headers';
const h = await headers(); // → kills ISR for ENTIRE app if in root layout

// ✅ USE THIS INSTEAD
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.totvogue.pk';
```

**Allowed only in:** `app/robots.ts`, `app/sitemap.ts`, `app/admin/**`, `app/api/**`

**Verify clean (run before every deploy):**
```bash
grep -rn "headers()\|cookies()" app/ --include="*.tsx" --include="*.ts" | grep -v "robots\|sitemap\|admin\|api"
# Must be EMPTY
```

### RULE C2 — Webhook Test Command
```bash
curl -X POST https://www.totvogue.pk/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: zaynahs_secret_cache_revalidate_2026" \
  -d '{"type":"UPDATE","table":"products","record":{"id":"test","slug":"any-slug","name":"Test"}}'
# Expected: {"revalidated":true,"table":"products","type":"UPDATE"}
```

### RULE C3 — Expected Cache Headers (Healthy State)
| Page | cache-control | x-vercel-cache |
|---|---|---|
| `/*` store pages | `public, s-maxage=86400` | `HIT` (2nd request) |
| `/_next/static/*` | `immutable, 1 year` | `HIT` |
| `/admin/*`, `/api/*` | `no-store` | `MISS` |

### RULE C5 — INSTANT PRICE/SALE UPDATES (NO PR, NO REDEPLOY, NO DIRECT DB HIT) ✅

**How instant price visibility works WITHOUT a new deploy, PR, or per-request DB hit:**

#### Flow Diagram
```
Admin saves Flash Sale / Price change
       ↓
  Supabase DB Trigger fires webhook
       ↓
  POST /api/revalidate (x-revalidate-secret)
       ↓
  revalidateTag('products') → Server RAM cache INSTANTLY CLEARED (< 0.1s)
       ↓
  Next user page request → Server fetches fresh data from DB ONCE
       ↓
  Fresh data stored back in RAM cache (unstable_cache, 24h TTL)
       ↓
  ALL subsequent users served from fast RAM cache again ✅
```

#### Rules (MANDATORY — NEVER BREAK)
1. **Every product/price mutation** in admin (Flash Sale, price edit, sale settings) MUST call `revalidateTag('products')` via `lib/revalidate.ts` helper — NO exceptions.
2. **`/api/products/list` route** MUST have `Cache-Control: no-store, no-cache, must-revalidate` — never a static TTL — so the browser always re-fetches latest prices (the server responds from RAM cache, not DB).
3. **`unstable_cache` in `lib/services/products.ts`** wraps ALL DB queries with tag `'products'` and `revalidate: 86400` (24h). This means DB is ONLY hit when cache is cold or after revalidation.
4. **After any Vercel deploy**: run `node scripts/post-deploy-fix.mjs` to purge Cloudflare Edge CDN and keep HTML + CSS assets in-sync (prevents `ChunkLoadError`).
   **CRITICAL AGENT RULE**: The AI Agent MUST use a synchronous bash chain (`git push origin main && sleep 120 && node scripts/post-deploy-fix.mjs`) to execute this script after pushing. Do not rely on background timers.
5. **NEVER remove `revalidateTag('products')`** from any admin save handler — doing so breaks instant price visibility.

#### What This Means
- ✅ Price change visible to customers in < 1 second after Admin save
- ✅ Zero DB hits per customer page load (served from server RAM)
- ✅ No PR, no redeploy, no manual cache clear needed
- ✅ Cloudflare Edge CDN serves HTML from ISR, Next.js RAM serves fresh data

---

### RULE C4 — Middleware vs Proxy (RSC Caching Skew)
- **MANDATORY**: Never name the root proxy file `middleware.ts` to avoid Next.js RSC caching skew bugs with Cloudflare. Always name it `proxy.ts`.
- **Redirect Caching**: When triggering a redirect from `proxy.ts` to an auth page, explicitly append a `?_nocache=timestamp` query param and set `cdn-cache-control: no-store, no-cache, must-revalidate` on the response.
- **Mobile Auth Cookies**: Mobile browsers reject cookies over 4KB. Always explicitly copy chunked cookies from `supabaseResponse` to the `NextResponse.redirect(url)` response inside `proxy.ts` using `.getAll().forEach()`.

For full test suite: [STORE_TESTING_GUIDE.md](file:///Users/shoaib/Desktop/Zaynahs%20e-store/docs/STORE_TESTING_GUIDE.md)

---

# 🤖 AGENT OPERATING RULES

1. Read existing files BEFORE creating new ones
2. Never rewrite a working file unnecessarily
3. Always check `app/` routing before creating pages
4. Run `npm run build` only when explicitly asked
5. Mobile-first is non-negotiable — desktop is enhancement
6. Every UI component needs loading + error + empty states
7. Images always through Supabase Storage — never local
8. WhatsApp is the ONLY order channel — no exceptions
9. **Dual-Sided Feature Integrity**: Whenever any feature is added or updated on either the customer Storefront or the Admin Panel, it MUST be fully implemented on the other side as well (e.g., if a feature is added to the storefront, its management/editor fields must be added to the Admin Panel, and vice versa), ensuring full database integration, service synchronization, and type-safety throughout the application.
10. **Customizer & Settings Linking Sync**: All theme/swatch controls, sizes (e.g., `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`), visibilities, and settings fields MUST be implemented in both the main Settings dashboard and the Visual Customizer sidebar panels. They must remain fully linked and synchronized so that edits in either interface immediately propagate to the database, store settings state, and the live preview/storefront.

---

## RULE S4 — SMART IMAGE COMPRESSOR & BRAND UPLOADS (UPDATED v1.0.7)
- All uploads pass through `lib/utils/imageCompressor.ts` which uses a **3-strategy fallback chain**:
  1. `createImageBitmap(file)` — OS-native HEIC decoding on macOS/iOS (fastest)
  2. `ObjectURL → <img> → createImageBitmap` — uses OS decoder via img tag (works for HEIC on macOS Chrome)
  3. `heic2any → createImageBitmap` — pure WASM fallback for HEIC on Windows/Linux (last resort)
- If all strategies fail → **throw user-visible Error** (shown as toast). NEVER silently upload a broken file.
- Output: `.webp`, max 1200px, target **under 50 KB**. Iterative quality + resolution reduction.
- Admin panel image previews use plain `<img>` tags (not `next/image`) to avoid domain restriction errors.
- `next.config.ts` must have Supabase hostname in `images.remotePatterns` for `next/image` to work on storefront.
- Favicon, Logo, and Banner uploadable/removable in Settings; logo display width is adjustable via range slider.
- Store favicon and document titles bind dynamically via `generateMetadata()` in `app/layout.tsx`.

## RULE S5 — NEXT.CONFIG IMAGE DOMAINS
```typescript
// next.config.ts — REQUIRED for next/image with Supabase
images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: 'ziucrfpebpxijqhwmqre.supabase.co',
    pathname: '/storage/v1/object/public/**',
  }],
  formats: ['image/webp', 'image/avif'],
}
```

## RULE S6 — UNIVERSAL MEDIA SELECTOR
- All admin panel image selection features MUST use the shared `MediaSelectorModal` component instead of direct `<input type="file">`.
- Selection buttons must use the centralized `Image` icon from `@/components/common/Icons` (e.g. `import { Image as ImageIcon } from '@/components/common/Icons'`) and standardized styling to ensure consistency across the application.
- Direct upload inputs are forbidden on settings forms and product editors; new media must be uploaded within the `MediaSelectorModal` context to maintain library consistency.

---

## RULE K1 — INSTANT PAGE-LEVEL SKELETONS & COLOR SCALE
- Every directory/route group must have a corresponding `loading.tsx` to handle async page transitions instantly.
- **Customer Storefront (`app/(store)/loading.tsx`)**: Default loader using `GridSkeleton` from `@/components/common/LoadingSkeleton` to represent grids of product cards.
- **Product Details (`app/(store)/product/[slug]/loading.tsx`)**: Specific loader using `DetailSkeleton` showing product details structure (two-column layout).
- **Admin Dashboard (`app/admin/loading.tsx`)**: Generic loader displaying statistics cards and list tables skeleton layouts.
- **Skeleton Color Standardization**: All skeleton component backgrounds and placeholders must use standard, documented Tailwind color weights (e.g. `bg-gray-100` and `dark:bg-gray-800`). Under no circumstances should non-standard Tailwind colors (e.g. `bg-gray-150`, `bg-gray-155`) be used.
- **Contrast Integrity**: Skeletons must support both light and dark mode colors (e.g. `dark:bg-[#16162a]`, `dark:border-gray-800/80`, `bg-gray-100`, `dark:bg-gray-800`).

---

## RULE O1 — MODULAR CODE ARCHITECTURE & SEPARATE MODAL/TAB FILES
- **One File Per Modal/Tab**: Every settings tab, dashboard form, modal dialog, sliding sheet, or customizer property panel MUST be written in its own separate, dedicated file (e.g. under `components/admin/customizer/sections/` or `components/admin/settings/`).
- **No Multi-Modal/Multi-Feature Files**: It is strictly forbidden to group multiple modals, multiple settings tabs, or multiple distinct features inside a single file. Every modal or tab must live in its own isolated file to keep features easily updateable.
- **File Length Limits**: Individual files should be kept under 500 lines of code where possible. Large monolithic components exceeding 600 lines are strictly forbidden to prevent confusion, improve page load speeds, and facilitate seamless features update.
- **Strict Separation of Concerns**: Master containers should focus solely on page layouts, state orchestrations, and API bindings, delegating UI blocks and input handlers to child components via clean props interfaces.

---

## RULE V1 — VERCEL BUILD SECURITY & CLIENT INITIALIZATION
To prevent Vercel build-time crashes (`Error: supabaseUrl is required` / `Failed to collect page data` errors):
1. **Never use non-null assertions (`!`) on environment variables during top-level module initialization.**
2. **Always provide a fallback string** (e.g., `|| 'https://placeholder.supabase.co'` for URL and `|| 'placeholder'` for Key) for any static client initialized at the module level.
3. This ensures that the Next.js static compilation and linting analyze files successfully even if environment variables are not loaded in the build system.

---

---
## RULE AUTO1 — AGENT AUTOMATION FLOW (CLONE/SETUP)

Jab user naye project ke liye yeh 7 values de (ref ID URL se auto-extract):
1. Supabase URL (se ref auto-extract) + service role key
2. Cloudflare zone ID + API token
3. Vercel API token (settings → tokens → create)
4. GitHub personal access token (repo + contents write)
5. Domain name

To agent AUTOMATICALLY kare ga:

**Supabase API se:**
- SUPER_MASTER_SCHEMA.sql execute (tables, policies, bucket)
- Storage bucket create
- 5 webhooks create (products, categories, homepage_sections, store_settings, reviews)

**Cloudflare API se:**
- 4 Cache Rules (no-cache-dynamic, static-assets, html-pages, supabase-images)
- 3 Page Rules (cart, checkout, my-account → bypass)
- DNS records (A, CNAME, TXT) — all proxied (orange cloud)

**GitHub + Vercel API se:**
- git init + commit + push (GITHUB_TOKEN se)
- npm i -g vercel → vercel --prod --token=$VERCEL_TOKEN
- Vercel env vars set via API (sab .env.local wale)
- vercel domains add [domain]
- Auto SSL enable

**Verify:**
- Cache headers (HIT/MISS/BYPASS)
- Webhook (revalidated:true)
- CF purge API
- Page rules active

Full details: `docs/NEW_PROJECT_SETUP_GUIDE.md#agent-automation--full-setup-flow`

---
## RULE CACHE1 — CACHE SYSTEM RULES (NEVER CHANGE THESE)

### Cloudflare Cache Rules (Active — Set via API)
| Rule | Action | Notes |
|------|--------|-------|
| `no-cache-dynamic` | cache:true + edge_ttl:0 + browser_ttl:0 | cart, checkout, account, api, admin |
| `static-assets` | cache:true + edge_ttl:1yr | /_next/static/* |
| `html-pages` | cache:true + edge_ttl:24h | All HTML pages (/*) |
| `supabase-images` | cache:true + edge_ttl:30d | supabase.co images |

### Page Rules (Active — Fallback)
- `cart*` → cache_level: bypass
- `checkout*` → cache_level: bypass  
- `my-account*` → cache_level: bypass

### ⚠️ Free Plan Limitation
Cloudflare Free tier may cache 200 HTML responses despite bypass rules. Upgrade to Pro ($20/mo) for strict bypass enforcement on cart/checkout/account.

### Server-Client Split (Always Follow)
- `lib/site-url-server.ts`: Contains `getSiteUrl()` which uses `headers()` — ONLY import in Server Components
- `lib/site-url.ts`: Contains `getClientSiteUrl()` and `cleanLocalhostUrls()` — safe for Client Components
- Never import `next/headers` in a file imported by a Client Component

### Shop Page Caching
- Never use `getSiteUrl()` (has `headers()`) inside `generateMetadata` on shop page
- Use `settings?.storeUrl?.replace(...)` directly instead
- This prevents `cache-control: private, no-store` being forced

### Cache Purge Flow
```
Admin DB change → Supabase webhook → /api/revalidate
→ revalidateTag() + revalidatePath() + purgeCloudflareEverything()
→ Next visitor → MISS → fresh data → re-cached as HIT
```

---
## RULE AI1 — SEO & COPYWRITING AI ENGINE
- **Vision Models for Images**: Use Vision models (`gemini-2.0-flash` or similar) strictly for image SEO optimizations, alt tags, captions, and visual descriptive generation.
- **Text Models for Copywriting**: Use content copywriting models (configured via `ai_settings` content model) to write descriptions, keywords, titles, and schema metadata.
- **Brand Context Bound**: All copywriting requests must utilize the brand's general settings (`brand_name`, `store_type`, `target_market`, `tone`, `language`, `address`, `whatsapp_number`, `tagline`) as system context to generate highly personalized, localized descriptions and structured FAQ schemas, guaranteeing maximized local SEO ranking.
- **Form Integration**: AI copywriting output must populate storefront description fields directly, and update main data tables (`products` and `categories`) upon generation for complete storefront data synchronization.





## RULE M5 — DESKTOP / MOBILE JITTER PREVENTION
Modals aur filters ke overlays par CPU-heavy blur styles (e.g. backdrop-blur-sm, backdrop-blur-xs) forbidden hain. Sirf high-contrast solid options (e.g. bg-black/60) render honge.
GPU Acceleration: Scrollable layers par CSS triggers will-change-transform aur transform-gpu laazmi hain.

## RULE E1 — SERVER COMPONENT ERROR UNMASKING (SAFE ACTIONS)
- **Problem**: Next.js App Router aggressively masks thrown errors in Server Actions (`use server`) during production builds. If you `throw new Error('Missing column')`, the client only receives "An error occurred in the Server Components render".
- **Solution**: **ALL mutations (Create, Update, Delete) in Server Actions MUST use the `SafeResult` pattern** instead of throwing errors.
- Every mutating server function must be wrapped using the `safeAction()` utility from `@/lib/utils/serverAction` (or a similarly named equivalent pattern). 
- Example: `export const updateCategorySafe = async (id, data) => safeAction(updateCategory(id, data))`
- On the frontend, after invoking a safe server action, you MUST check the result flag:
  ```typescript
  const result = await mySafeAction();
  if (!result.success) throw new Error(result.error);
  ```
- This ensures the actual `error.message` from the backend is gracefully returned as a serialized object and rendered in toast notifications.

---

# 🧩 SHARED_MODULES_RULE (STRICTLY ENFORCED FOR ALL AGENTS)

⚠️ **CRITICAL DIRECTIVE TO ALL AI AGENTS**: 
**DO NOT IGNORE THIS RULE.** You MUST reuse the following shared modules for ALL new pages and features in both `/admin` and `/store`. 
**NEVER** build inline, page-local UI/logic for anything that is conceptually reusable. If a pattern doesn't exist yet, build it inside the shared directory first (`components/admin/shared/`, `components/store/shared/`, or `components/common/`), then consume it from the page.

### 🚫 ABSOLUTELY FORBIDDEN PRACTICES
- `window.confirm()` or native `alert()` → **BANNED**. You MUST use `AdminConfirmDialog` / `useConfirm`.
- Inline `<input>` for searching or filtering → **BANNED**. You MUST use `AdminSearchInput` or `SearchBar`.
- Inline `<svg>` or direct `lucide-react` imports on pages → **BANNED**. You MUST import from `@/components/common/Icons`.
- Inline `<button>` blocks for Prev/Next pagination → **BANNED**. You MUST use `PaginationFooter`.
- Hardcoded `<table>` headers without responsive mobile fallback → **BANNED**. See Admin Mobile Responsive Rule.
- Custom "No data found" `<div className="text-gray-500">` → **BANNED**. You MUST use `EmptyState`.

### ✅ THE MANDATORY MODULE MAP

| Component/Feature | Required Module | Path / Provider |
|-------------------|-----------------|-----------------|
| **Icons** | **Central Registry Only** | `@/components/common/Icons` |
| **Search Bar (Admin)** | `AdminSearchInput` | `@/components/admin/shared/AdminSearchInput` |
| **Search Bar (Store)** | `SearchBar` | `@/components/store/SearchBar` |
| **Pagination** | `PaginationFooter` | `@/components/admin/PaginationFooter` |
| **Date Filters** | `AdminDateFilter` | `@/components/admin/shared/AdminDateFilter` |
| **Confirmation Alerts** | `useConfirm` / `AdminConfirmProvider` | `@/components/admin/shared/AdminConfirmProvider` |
| **Empty States** | `EmptyState` | `@/components/common/EmptyState` |
| **Loading States** | `LoadingSkeleton` variants | `@/components/common/LoadingSkeleton` |
| **Admin Page Headers**| `AdminPageHeader` | `@/components/admin/shared/AdminPageHeader` |
| **Admin Cards/Panels**| `AdminCard` | `@/components/admin/shared/AdminCard` |
| **Admin Bulk Actions**| `AdminBulkActionBar` | `@/components/admin/shared/AdminBulkActionBar` |
| **Admin Toolbars** | `AdminToolbar` | `@/components/admin/shared/AdminToolbar` |
| **Storefront Filters**| `CategoryFilter`, `PriceRangeFilter`, `ColorFilter`, `SizeFilter`, `MaterialFilter`, `SortDropdown` | `@/components/store/shared/*` |

### ✅ THE MANDATORY UTILITY MAP

- **Reordering Arrays / Drag & Drop** → `import { arrayMove } from '@/lib/utils/arrayMove'`
- **Formatting Price / Currency** → `import { formatPrice } from '@/lib/utils/whatsapp'`
- **Date Math / ISO Strings / Time Ago** → `import { timeAgo, getStartISO, getEndISO } from '@/lib/utils/dateFilters'`
- **Storage URLs / Image Parsing** → `import { isOwnStorageUrl, processImageUrl } from '@/lib/services/storage'`
- **Tab State Management** → `useAdminTab.ts` pattern

Any agent found duplicating these patterns directly inside a page instead of importing the centralized module is fundamentally breaking the architecture of this project. **Import the module or build a new shared module!**

## RULE CACHE2 — CACHE & WEBHOOK ENFORCEMENT (STRICTLY ENFORCED)

Whenever any **new feature, table, admin tab, or data module** is added to the system, the agent MUST simultaneously implement its cache purge and webhook systems for all connected projects. Never leave a new feature without instant cache invalidation.

**Mandatory Checklist for New Features:**
1. **Database Triggers**: Add a `revalidate-<table_name>` trigger to `SUPER_MASTER_SCHEMA.sql` (and its corresponding migration file) that POSTs to `https://domain.com/api/revalidate` with `x-revalidate-secret`.
2. **Next.js Cache Tags**: Ensure the new data queries use appropriate cache tags (e.g. `['new_feature']`) via `unstable_cache`.
3. **Revalidation Logic**: Update `app/api/revalidate/route.ts` and/or `lib/revalidate.ts` to explicitly handle the new table's webhooks. It must call `revalidateTag` for the new feature's tags and trigger a Cloudflare cache purge to ensure instantly faster load times globally.
4. **Multi-Project Sync**: All schema changes and webhooks must be applied across ALL active project databases (TotVogue, Zaynahspk, MiniMahal, LittleMister) simultaneously to maintain parity.

## RULE D9 — MULTI-PROJECT CLOUDFLARE WEBHOOK VERIFICATION (STRICTLY ENFORCED)
When working with multiple cloned projects (e.g., Zaynahs, Totvogue, MiniMahal, LittleMister), each project relies on a Cloudflare API Token for the Next.js Cache Purge Webhook (`/api/revalidate`). 
- **The Token:** It must be a valid **Cloudflare API Token** with "Cache Purge" permissions. It typically starts with `cfut_`. Do NOT use Global API Keys (`cfk_` or similar 37-char hex strings).
- **Verification Script:** Whenever you configure env files or the user reports webhook/cache issues, you MUST run `node scripts/test-cf-tokens.mjs`. This script automatically scans `.env.local` and `env-backups/*.env.local`, extracts all `CLOUDFLARE_API_TOKEN`s, and verifies them against the live Cloudflare API (`https://api.cloudflare.com/client/v4/user/tokens/verify`).
- **Agent Action:** If a token returns as INVALID or EXPIRED, you must immediately inform the user and tell them exactly which project's token failed, instructing them to generate a new valid "API Token" (not a Global API Key) from the Cloudflare Dashboard.

---

# 🧠 SENIOR DEVELOPER BACKEND ENGINEERING HABITS

1. **Think Before You Code**:
   - The best engineers understand the problem before touching the keyboard.
   - Junior Instinct: "I'll figure it out while coding."
   - Senior Habit: "What problem am I solving?"

2. **Read Existing Code First**:
   - Understanding the current system saves hours of unnecessary work.
   - Junior: "I'll rewrite everything."
   - Senior: "Let me understand what's already here."

3. **Handle Errors Gracefully**:
   - Users don't need stack traces. They need helpful, structured responses.
   - ❌ `res.json(error)`
   - ✅ `res.status(400).json({ message: "Invalid email" })`

4. **Write for Readability**:
   - Self-documenting, clean, maintainable code over complex tricks.
   - Subtext: "It's not about writing more code. It's about writing better systems."

5. **Validate Every Input**:
   - Never trust client input. Validate before touching your database.
   - ❌ `User.create(req.body)`
   - ✅ `if(!email){ return res.status(400) }`

6. **Test Edge Cases**:
   - Test empty states, missing values, rate limits, and network failures before shipping.

7. **Think Like Your Users**:
   - Good developers write code. Great developers build experiences.
   - Junior: "My API works."
   - Senior: "Can someone actually use it easily?"

---

# 🚨 STRONG ERROR TRACKING & INSTANT DIAGNOSTIC PROTOCOL

Whenever the user copy-pastes an error log, terminal output, stack trace, or DevTools error snippet, the agent MUST immediately map it to the diagnostic matrix below, identify the root cause, and execute the exact instant fix without asking for permission.

### 🔍 Error Diagnostic Matrix & Instant Fix Actions:

1. **`ChunkLoadError` / `404 (Not Found) _next/static/chunks/`**:
   - **Root Cause**: Cloudflare Edge CDN is serving stale HTML pointing to hashed JS assets deleted in a new deployment.
   - **Instant Fix**: Run `node scripts/post-deploy-fix.mjs` or execute Cloudflare `purge_everything: true` API call, then trigger POST to `/api/revalidate`.

2. **`PGRST204` / `Could not find the '<col>' column of '<table'> in schema cache`**:
   - **Root Cause**: Supabase database table missing column or Supabase REST schema cache needs refreshing.
   - **Instant Fix**: Run DDL SQL via Supabase Management API (`POST /v1/projects/{ref}/database/query`), sync `SUPER_MASTER_SCHEMA.sql`, and re-query.

3. **`An error occurred in the Server Components render`**:
   - **Root Cause**: Next.js App Router masked exception in Server Action or Server Component in production.
   - **Instant Fix**: Wrap the operation in `safeAction()` from `@/lib/utils/serverAction` or return `{ success: false, error: message }` instead of throwing raw Error.

4. **`Hydration failed because the initial UI does not match`**:
   - **Root Cause**: Client-only dynamic value (`window.location`, `localStorage`, `Date.now()`, random numbers) evaluated during Server-Side Rendering (SSR).
   - **Instant Fix**: Wrap client-only evaluation in `useEffect()` or `useState(null)` with `suppressHydrationWarning`.

5. **`Invalid API Key` / `401 Unauthorized` on `/api/revalidate`**:
   - **Root Cause**: Mismatched or missing `x-revalidate-secret` header in webhook request.
   - **Instant Fix**: Pass `x-revalidate-secret: zaynahs_secret_cache_revalidate_2026` header explicitly.

6. **`TypeError: Cannot read properties of undefined (reading 'map')`**:
   - **Root Cause**: API or service returned `null`/`undefined` data without array fallback.
   - **Instant Fix**: Provide nullish coalescing array fallback: `(data ?? []).map(...)`.

7. **`Database error: RLS policy violation` / `42501`**:
   - **Root Cause**: Query using standard client (`supabase`) instead of service role admin client (`supabaseAdmin`) on RLS-protected table.
   - **Instant Fix**: Change import to `import { supabaseAdmin } from '@/lib/supabase/admin'`.

8. **`Cookie limit exceeded` / `Cookie chunking failed`**:
   - **Root Cause**: Auth session cookies exceeding 4KB browser limit on mobile devices.
   - **Instant Fix**: Use `createServerClient` from `@supabase/ssr` with chunked cookie response handling in `proxy.ts`.

### ⚡ Agent Mandatory Execution Order on Copy-Pasted Error:
1. **Direct Action**: Immediately locate target file(s) and apply the fix.
2. **Compile & Test**: Run `npm run build` locally to verify 0 build errors.
3. **Deploy & Push**: Push commit to all GitHub remotes and trigger live cache revalidation.
4. **Structured Report**:
   - 📌 **Error**: Identified issue
   - 🔍 **Root Cause**: Exact explanation
   - 🛠️ **File & Line**: Exact code location fixed
   - 🚀 **Status**: Live revalidation & build verification results



---

## 🔑 CLOUDFLARE + SUPABASE — AGENT API RULE (MANDATORY)

> ⚡ Agent kabhi bhi user ko manual kaam karne nahi dega jab API available ho.

### ❌ NEVER
- User ko manually Cloudflare token banane ko nahi kehna
- User ko Supabase dashboard mein webhook add karne ko nahi kehna
- Token browser mein test nahi karna — always API use karo

### ✅ ALWAYS via API

**CF Token Verify (all projects):**
```bash
TOKEN=cfut_xxxx
curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $TOKEN"
# expect: {"result":{"status":"active"},"success":true}
```

**Supabase Trigger Create/Fix (all tables, all projects):**
```bash
SQL_JSON=$(python3 -c "import json; print(json.dumps({'query': 'CREATE TRIGGER ...'}))") 
curl -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $MGMT_TOKEN" -H "Content-Type: application/json" -d "$SQL_JSON"
```

**Vercel Env Update:**
```bash
curl -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"NEW_TOKEN","target":["production"]}'
```

### 🚨 cfk_ Token = ALWAYS WRONG
- `cfk_` = Global API Key — Bearer auth mein KAAM NAHI KARTA
- `cfut_` = API Token — ✅ SAHI FORMAT
- Agar kisi env mein `cfk_` mile → immediately user ko batao naya `cfut_` token banane ko

### 📋 All Projects Table
| Project | Ref | Zone ID | URL | REVALIDATE_SECRET |
|---------|-----|---------|-----|-------------------|
| TotVogue | ziucrfpebpxijqhwmqre | e4aceeacdc4f6a1677e92823df1651fd | www.totvogue.pk | zaynahs_secret_cache_revalidate_2026 |
| Zaynahs | unfdpfmjqljbjydgsccr | 10d964449186f64d7896f8dcac4e5eff | www.zaynahs.pk | zaynahs_secret_cache_revalidate_2026 |
| MiniMahal | mgwkcumurrllhpjvfezz | 6acd493022cd0f2d5a9c290088b5327a | www.minimahal.com | zaynahs_secret_cache_revalidate_2026 |
| LittleMister | ljknmwianiswkalifueb | 063a3d5c72d44b3654aa60b17ed94863 | www.littlemister.pk | zaynahs_secret_cache_revalidate_2026 |

### 🔁 Mandatory Self-Test After Any Setup
1. Webhook: `curl -X POST https://SITE/api/revalidate -H "x-revalidate-secret: SECRET"` → `{"revalidated":true}`
2. CF Token: `curl cf_verify -H "Bearer TOKEN"` → `"status":"active"`
3. Triggers: SQL query → no `localhost` or `domain.com` URL in any trigger

---

## 🔑 RULE CRED1 — EACH STORE HAS COMPLETELY SEPARATE CREDENTIALS (MANDATORY — NEVER SHARE)

> ⚠️ **ABSOLUTE RULE**: Code = Universal (same for all stores). Credentials = 100% Separate per store. These two rules can NEVER be broken.

### What MUST be Separate (per store)
| Credential | Separate? | Notes |
|------------|-----------|-------|
| `SUPABASE_PROJECT_REF` | ✅ UNIQUE | Different DB per store |
| `SUPABASE_MGMT_TOKEN` (`sbp_...`) | ✅ UNIQUE | Different Supabase account |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ UNIQUE | Different project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ UNIQUE | Different project key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ UNIQUE | Different project key |
| `CLOUDFLARE_ZONE_ID` | ✅ UNIQUE | Different domain per store |
| `CLOUDFLARE_API_TOKEN` (`cfut_...`) | ✅ UNIQUE | Different CF account/token |
| `CF_ACCOUNT_ID` | ✅ UNIQUE | Different CF account |
| `VERCEL_PROJECT_NAME` | ✅ UNIQUE | Different Vercel project |
| `GITHUB_TOKEN` (`ghp_...`) | ✅ UNIQUE | Different GitHub account |
| `NEXT_PUBLIC_SITE_URL` | ✅ UNIQUE | Different domain |

### What is SHARED (same value across all stores)
| Credential | Value | Why |
|------------|-------|-----|
| `REVALIDATE_SECRET` | `zaynahs_secret_cache_revalidate_2026` | Must match Supabase triggers |

### Mandatory File Structure
```
env-backups/
  totvogue.env.local      ← TotVogue ONLY credentials
  zaynahs.env.local       ← Zaynahs ONLY credentials
  minimahal.env.local     ← MiniMahal ONLY credentials
  littlemister.env.local  ← LittleMister ONLY credentials
.env.local                ← Current working store credentials
```

### Agent Rules (STRICTLY ENFORCED)
1. **Never copy credentials** from one store's `env-backups/` file to another
2. **After any token rotation**: update `env-backups/<store>.env.local` + Vercel dashboard for THAT store only
3. **Before every deploy**: run `node scripts/post-deploy-fix.mjs` — it auto-reads ALL env-backups and purges ALL Cloudflare zones + Vercel ISR cache. 
   **CRITICAL AGENT RULE**: The AI Agent MUST use a synchronous bash chain (`git push origin main && sleep 120 && node scripts/post-deploy-fix.mjs`) to execute this script after pushing. Do not rely on background timers.
4. **Verify no cross-contamination**: `rg "CLOUDFLARE_ZONE_ID" env-backups/` — every file MUST show a DIFFERENT value
5. **Verify no secrets in code**: `rg "sbp_|ghp_|cfut_|eyJ" --glob '*.ts' --glob '*.tsx' --glob '*.mjs' --glob '*.sql'` — must return 0 results
6. **cfk_ token = ALWAYS WRONG** → only `cfut_` tokens work with Bearer auth

### Multi-Store Purge System (MANDATORY after every deploy)
```bash
node scripts/post-deploy-fix.mjs
# Auto-reads .env.local + ALL env-backups/*.env.local
# 1. Vercel ISR cache purge (requires VERCEL_TOKEN + VERCEL_PROJECT_NAME)
# 2. Purges Cloudflare for EVERY store zone
# 3. Verifies /api/revalidate → {revalidated: true}
# 4. Verifies all pages → HTTP 200
```
If any zone fails → fix token immediately. NEVER skip a failed zone.

---

## 🚨 RULE VERCEL1 — VERCEL_PROJECT_NAME MANDATORY IN ALL ENV-BACKUPS

> **Root Cause**: Vercel has its OWN internal ISR (Incremental Static Regeneration) cache that is SEPARATE from Cloudflare edge cache. Both must be purged after every deploy.

### Why This Issue Happens
- `.env.local` ya `env-backups/<store>.env.local` mein `VERCEL_PROJECT_NAME` missing hota hai
- `post-deploy-fix.mjs` skip kar deta hai Vercel purge → [1/4] shows `SKIPPED`
- Result: Vercel ke server pe purana HTML cached rehta hai → users ko stale page milta hai first request pe

### Fix (Permanent)
Every `env-backups/<store>.env.local` MUST have:
```
VERCEL_TOKEN=vcp_...          ← Vercel account token
VERCEL_PROJECT_NAME=<name>    ← Exact project name from vercel.com dashboard
```

### Current Values (All Stores)
| Store | VERCEL_PROJECT_NAME |
|-------|---------------------|
| TotVogue | `zaynahsestore-tv` |
| Zaynahs | `zaynahsestore-tv-main` |
| MiniMahal | `mini-mahal-e-store` |
| LittleMister | `eestore` |

### Verify Before Every Deploy
```bash
grep "VERCEL_PROJECT_NAME" env-backups/*.env.local
# Every file MUST show a value — no empty or missing lines
```

### Agent Rule
- When setting up ANY new store → IMMEDIATELY add `VERCEL_PROJECT_NAME` to its `env-backups/` file
- When `post-deploy-fix.mjs` shows `SKIPPED` for Vercel → STOP and fix before continuing
- NEVER mark deploy as complete if Vercel purge is SKIPPED

