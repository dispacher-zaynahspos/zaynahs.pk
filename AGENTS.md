<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Full Stack Autonomous Agent Rules
(Next.js, React, Node.js, Vercel, GitHub, Supabase, Cloudflare | E-commerce + POS)

---

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

---

<!-- BEGIN:domain-rules -->
# Multi-Domain System Rule

This app runs across ANY domain (localhost, custom domain, production). Never hardcode a domain or brand name.

**Always use:**
- Server-side: `getSiteUrl(settings)` from `@/lib/site-url-server` — uses `settings.storeUrl` first, then detects `host` header
- Client-side: `getClientSiteUrl(settings)` from `@/lib/site-url` — uses `settings.storeUrl` first, then `window.location.origin`
- URL cleanup: `cleanLocalhostUrls(text, siteUrl)` from `@/lib/site-url` — replaces localhost URLs with dynamic site URL
- Brand name: `settings.storeName || process.env.NEXT_PUBLIC_BRAND_NAME || 'Zaynahs E-Store'`
- Logo: `settings.logoUrl` — always from general settings, never fallback to Vercel/Next.js default favicon
- Favicon: `settings.faviconUrl` — always from general settings, served via `/favicon.ico` route that reads from DB
- OG image: `settings.logoUrl` or `settings.bannerUrl` — never use Vercel/Next.js default og-image
- Google index / SEO: all meta tags, JSON-LD schema, canonical URLs, sitemap, robots.txt must use `getSiteUrl()` value
- All image URLs in meta tags must use `cleanLocalhostUrls()` to ensure absolute paths

**CRITICAL — Never use `getSiteUrl()` inside `generateMetadata`:**
- `getSiteUrl()` imports `headers()` from `next/headers` which forces `cache-control: private, no-store`
- Kills ISR (`revalidate`), kills Cloudflare CDN cache
- Always use direct: `settings?.storeUrl?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || ''`
- Exception: inside page component (not generateMetadata) — allowed

**Never use:**
- Hardcoded `totvogue.pk`, `zaynahs.pk`, `TotVogue.pk` — all must come from DB settings or request headers
- `process.env.NEXT_PUBLIC_SITE_URL` as final fallback — use `getSiteUrl()` helper inside page components
- `.replace(/http:\/\/localhost:3000/g, '...')` — use `cleanLocalhostUrls()` instead
- Vercel/Next.js default favicon, logo, or og-image — always read from DB settings
- Hardcoded favicon.ico in `/public/` — the app serves favicon dynamically from `settings.faviconUrl`
<!-- END:domain-rules -->

<!-- BEGIN:ssr-rules -->
# SSR / Caching Rules

1. **Never block SSR with non-critical data.** Social proofs, banners, recommendations — anything non-critical must be:
   - Fetched client-side (inside `'use client'` component via `useEffect` + dynamic import)
   - OR wrapped in `Promise.race` with timeout (max 2s), caught with `.catch(() => [])`
   - Pass `[]` as default, let client-side fetch populate

2. **ISR pattern:** `export const revalidate = 86400` on all storefront pages.
   - Webhooks purge cache on admin save (`revalidateTag`, `revalidatePath`, Cloudflare purge)

3. **Server/Client split for site-url:**
   - `lib/site-url-server.ts` = server-only (uses `next/headers`) — DO NOT import in client components
   - `lib/site-url.ts` = client-safe — uses `window.location.origin`, no `next/headers`

4. **Cloudflare cache override:**
   - Always set `cdn-cache-control: public, s-maxage=86400, stale-while-revalidate=60`
   - This makes Cloudflare cache even pages with `cache-control: private`

5. **Cloudflare & Vercel Caching Skew (WARNING)**:
   - Caching HTML files on Cloudflare for 24h (`s-maxage=86400`) while Vercel serves unique hashed CSS/JS files (e.g. `_next/static/css/hash.css`) causes **un-styled layouts, raw HTML text, and missing images** on new deploys. The old cached HTML points to deleted assets.
   - **Fix**: Whenever a new deploy goes live, you MUST trigger a Cloudflare cache purge ("Purge Everything"), or use a shorter cache duration (`s-maxage=600`) for HTML responses to minimize the version discrepancy window.

6. **Metadata Title Duplication (Absolute Title rule)**:
   - If a child page title (e.g. homepage) duplicates the brand name or suffix from the parent layout (`title.template`), always specify the title as an object with the `absolute` property: `title: { absolute: title }` instead of a plain string. This forces Next.js to ignore the parent layout suffix and prevents doubled titles.
<!-- END:ssr-rules -->

<!-- BEGIN:db-rules -->
# Database Rules

1. **Always use `supabaseAdmin` (service role key) for admin/storefront queries.**
   - Bypasses RLS — avoids nested join RLS failures
   - Use `@/lib/supabase/admin` import

2. **Settings table name:** `store_settings` (not `settings`)
   - Key columns: `store_url`, `store_name`, `currency_symbol`, `logo_url`, `favicon_url`, `banner_url`

3. **Avoid nested joins that fail on RLS.**
   - Batch fetch product images separately instead of joining in main query
   - Pattern: fetch main data → collect IDs → batch fetch related data → merge in memory

4. **Reviews table:** `reviews`
   - `getGlobalReviews()` returns `{ reviews: [], total: 0 }` on error (graceful degradation)
   - `getTopReviews(3)` for homepage, `getGlobalReviews()` for /reviews page

5. **Cache tags for revalidation:**
   - `products` — all product changes
   - `categories` — category changes
   - `reviews` — review CRUD
   - `social_proof` — social proof CRUD
   - `settings` — settings update
   - Use `unstable_cache` with these tags for DB-backed caching

6. **HARD RULE: SUPER_MASTER_SCHEMA.sql MUST always match ALL migrations — zero exceptions.**
   - Every schema change (columns, tables, indexes, policies, triggers, functions, RLS, storage rules, auth config, seed data) must be reflected in `supabase/schema/SUPER_MASTER_SCHEMA.sql`
   - **Update BEFORE writing the migration** — master schema is the source of truth, migration follows it
   - This applies to: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX`, `DROP INDEX`, `CREATE POLICY`, `DROP POLICY`, `CREATE FUNCTION`, `CREATE TRIGGER`, storage bucket config, auth settings, seed data (`INSERT`) — absolutely everything
   - Keep the schema version (top comment) and "Updated" date header current
   - **After writing any migration, run `node scripts/check-master-schema.mjs` to verify — it MUST pass with 0 issues**
   - **If a migration is found that is NOT in master schema, the agent MUST fix master schema immediately before proceeding**

7. **All Supabase admin actions via Management API only.**
   - Never use Supabase CLI (`supabase db push`, `supabase migration` etc.)
   - Never use direct Postgres connection strings, Prisma, or any direct ORM for schema changes or management. All operations MUST go through the Supabase Management API.
   - All operations must use `SUPABASE_MGMT_TOKEN` and `SUPABASE_PROJECT_REF` from `.env.local`
   - Covers: schema migrations, storage rules, RLS policies, triggers, functions, webhooks, auth config, and any other DDL/DML changes
   - Pattern: use the helper scripts below — never hardcode tokens in any file. **Reference:** [SUPABASE_API_GUIDE.md](file:///Users/shoaib/Documents/zaynahsestore-tv-main/docs/SUPABASE_API_GUIDE.md)

8. **NEVER hardcode credentials in any file.**
   - No tokens, API keys, passwords, or project refs in `.ts`, `.tsx`, `.sql`, `.md`, `.json`, or `.js` files
   - Everything goes in `.env.local` only:
     ```
     SUPABASE_PROJECT_REF=your_project_ref
     SUPABASE_MGMT_TOKEN=sbp_your_management_token
     NEXT_PUBLIC_SUPABASE_URL=https://yourref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     REVALIDATE_SECRET=zaynahs_secret_cache_revalidate_2026
     ```
   - **Vercel API Sync:** The agent MUST automatically sync this universal secret to all linked Vercel projects via the Vercel REST API (`PATCH /v9/projects/{id}/env/{env_id}`).
   - GitHub will block pushes containing secrets — use `rg "sbp_|ghp_" --glob '!.env*' --glob '!.git'` to check

9. **Clone / setup from scratch:**
   - Copy `.env.example` to `.env.local` and fill in your Supabase project details
   - Run `node scripts/init-db.mjs` to apply `SUPER_MASTER_SCHEMA.sql` (creates all tables, indexes, RLS, triggers)
   - Run `node scripts/run-migration.mjs supabase/migrations/<filename>.sql` for individual migrations
   - Also fill in: `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` (for traffic analytics)
   - Optional: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` for real-time live count
   - Then `npm run dev` — everything works

10. **ALWAYS KEEP TYPES.TS SYNCHRONIZED (STRICTLY ENFORCED)**
    - Whenever any new feature is added, database column is changed, or frontend interface data model is updated, the agent MUST immediately update `lib/types.ts`.
    - Just like `SUPER_MASTER_SCHEMA.sql` is the single source of truth for the database, `lib/types.ts` is the absolute source of truth for the frontend TypeScript interfaces.
    - No new features can be merged with `any` types. If a feature or column is removed, its type definitions must also be removed to avoid stale code.
<!-- END:db-rules -->

<!-- BEGIN:shared-modules-rule -->
# SHARED_MODULES_RULE (STRICTLY ENFORCED)

Any new page or feature added to `/admin` or `/store` MUST reuse the following shared modules. If a pattern doesn't exist yet, build it inside the shared directory first (`components/admin/shared/`, `components/store/shared/`, or `components/common/`), then consume it from the page — NEVER build inline, page-local UI/logic for anything conceptually reusable.

1. **Icons** → only import from `@/components/common/Icons` — never `lucide-react` directly anywhere outside that file.
2. **Search bar** → `/admin` pages use only `AdminSearchInput`; `/store` pages use only `SearchBar`. No inline `<input>` search reimplementations permitted.
3. **Pagination** → only `PaginationFooter`, project-wide.
4. **Date filters** → only `AdminDateFilter`, backed by `lib/utils/dateFilters.ts`.
5. **Confirmation dialogs** → only `AdminConfirmDialog`. Raw `window.confirm()` is strictly forbidden.
6. **arrayMove** → only import from `@/lib/utils/arrayMove`.
7. **formatPrice** → only import from `@/lib/utils/whatsapp`.
8. **timeAgo, getStartISO, getEndISO** → only import from `@/lib/utils/dateFilters`.
9. **isOwnStorageUrl / processImageUrl** → only import from `@/lib/services/storage`.
10. **Empty states** → only `@/components/common/EmptyState`.
11. **Loading states** → only `@/components/common/LoadingSkeleton` variants.
12. **Page headers (admin)** → only `AdminPageHeader`.
13. **Cards (admin)** → only `AdminCard`.
14. **Storefront filters** → only components in `components/store/shared/` (`CategoryFilter`, `PriceRangeFilter`, `ColorFilter`, `SizeFilter`, `SortDropdown`).
15. **Tab management** → continue following the existing `useAdminTab.ts` pattern for any page with tabbed UI.
<!-- END:shared-modules-rule -->

<!-- BEGIN:senior-backend-habits-rule -->
# Senior Developer Backend Engineering Habits

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
<!-- END:senior-backend-habits-rule -->

<!-- BEGIN:error-tracking-diagnostic-rule -->
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
<!-- END:error-tracking-diagnostic-rule -->

<!-- BEGIN:cloudflare-supabase-api-rule -->
---

## 14. 🔑 Cloudflare + Supabase — Agent MUST Use API (MANDATORY RULE)

### ❌ NEVER do manually
- Never ask user to manually create Cloudflare tokens, Supabase webhooks, or Vercel env vars
- Never say "go to dashboard and do X" when an API/curl exists
- Never test tokens in browser — always use API

### ✅ Agent ALWAYS handles via API automatically

#### Cloudflare Token Verification (ALL projects at once)
```bash
# env-backups/ se CLOUDFLARE_API_TOKEN padhke har project test karo
for ENV in env-backups/*.env.local; do
  TOKEN=$(grep CLOUDFLARE_API_TOKEN $ENV | cut -d= -f2)
  NAME=$(basename $ENV)
  curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'$NAME: {d.get(\"result\",{}).get(\"status\",\"INVALID\")} | success: {d.get(\"success\")}')"
done
```

#### Cloudflare Cache Purge (via API)
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'
```

#### Supabase Webhook Triggers — Agent creates via SQL API
```bash
# CORRECT: cfut_ token only (NOT cfk_ Global API Key)
# cfk_ tokens DO NOT work with Bearer auth — always create cfut_ API Tokens
SQL_JSON=$(python3 -c "import json; print(json.dumps({'query': '''
DROP TRIGGER IF EXISTS "revalidate-TABLE" ON public.TABLE;
CREATE TRIGGER "revalidate-TABLE"
  AFTER INSERT OR UPDATE OR DELETE ON public.TABLE
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    '"'"'https://SITE_URL/api/revalidate'"'"', '"'"'POST'"'"',
    '"'"'{"Content-Type":"application/json","x-revalidate-secret":"SECRET"}'"'"',
    '"'"'{"type":"CHANGE","table":"TABLE"}'"'"', '"'"'5000'"'"'
  );
'''}))")
curl -s -X POST "https://api.supabase.com/v1/projects/$SUPABASE_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_MGMT_TOKEN" \
  -H "Content-Type: application/json" -d "$SQL_JSON"
```

#### Vercel Env Vars — Agent updates via API
```bash
# Get project ID
curl -s "https://api.vercel.com/v9/projects?limit=20" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import sys,json; [print(p['id'], p['name']) for p in json.load(sys.stdin)['projects']]"

# Update env var
curl -s -X PATCH "https://api.vercel.com/v9/projects/PROJECT_ID/env/ENV_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"NEW_VALUE","target":["production","preview","development"]}'
```

### 📋 All Projects Reference
| Project | Supabase Ref | CF Zone ID | Site URL |
|---------|-------------|------------|----------|
| TotVogue | ziucrfpebpxijqhwmqre | e4aceeacdc4f6a1677e92823df1651fd | www.totvogue.pk |
| Zaynahs | unfdpfmjqljbjydgsccr | 10d964449186f64d7896f8dcac4e5eff | www.zaynahs.pk |
| MiniMahal | mgwkcumurrllhpjvfezz | 6acd493022cd0f2d5a9c290088b5327a | www.minimahal.com |
| LittleMister | ljknmwianiswkalifueb | 063a3d5c72d44b3654aa60b17ed94863 | www.littlemister.pk |

### 🚨 CF Token Format Rule (CRITICAL)
- `cfut_` or `cf_` = ✅ API Token — works with `Authorization: Bearer`
- `cfk_` = ❌ Global API Key — NEVER works with Bearer auth
- Agent MUST warn user if cfk_ token found in any env file
- Agent MUST guide user to create new cfut_ token via Cloudflare → Profile → API Tokens → Create Token → Cache Purge permission

### 🔁 Mandatory Self-Test After Any Change
After creating/updating ANY trigger, token, or webhook, agent MUST verify:
1. **Webhook live test**: `curl -X POST https://SITE/api/revalidate -H "x-revalidate-secret: SECRET"` → expect `{"revalidated":true}`
2. **CF token test**: `curl https://api.cloudflare.com/client/v4/user/tokens/verify -H "Authorization: Bearer TOKEN"` → expect `"status":"active"`
3. **Trigger URL check**: SQL query to verify no trigger points to `localhost` or `domain.com`
<!-- END:cloudflare-supabase-api-rule -->
