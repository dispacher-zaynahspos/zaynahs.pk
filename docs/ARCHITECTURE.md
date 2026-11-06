# ARCHITECTURE

Living document. Update whenever folders, request flow or data flow change.

## 1. Current tree (2026-11-06)

```
zaynahs.pk/
├── app/
│   ├── (store)/            public storefront pages (home, shop, product, cart, checkout,
│   │                       account, login, wishlist, reviews, contact, ...)
│   ├── admin/              admin UI (products, orders, settings, customizer, media, ...)
│   ├── api/                route handlers (~59): admin, cron, revalidate, upload-image,
│   │                       search, track, meta-sync, courier, reviews, settings, ...
│   ├── auth/               Supabase auth callbacks
│   ├── manifest.json/      web manifest route
│   ├── admin-manifest.json/ admin web manifest route
│   ├── layout.tsx          root layout (brand from settings/env)
│   ├── robots.ts, sitemap.ts, llms.txt
├── components/
│   ├── common/             brand-neutral shared UI (Modal, reorder, ...)
│   ├── store/              storefront UI (+ product-card/ hooks)
│   ├── admin/              admin UI (settings-form, customizer, ...)
│   └── product-cards/      product card system (SSOT)
├── lib/
│   ├── services/           server-side data logic (products, orders, settings, reviews, ...)
│   ├── supabase/           client / server / admin clients
│   ├── auth/               requireAdmin, guards
│   ├── brand/              ★ brand registry + single resolver (host → brand)
│   ├── config/             domains.ts (thin), singleton-ids.ts, worker-role.ts
│   ├── store/              zustand stores (cartStore, searchStore)
│   ├── hooks/              client hooks (cart, scroll lock, postex cities, ...)
│   ├── utils/              pure helpers (imageUrl, getDomainBrand, ...)
│   ├── ai/ meta/ email/ postex/ security/ sorting/ traffic/ theme-*/
│   ├── revalidate.ts       single cache-purge entry point
│   └── site-url.ts / site-url-server.ts
├── types/                  ambient type declarations
├── scripts/                ops, generators, migrations, bulk store ops
├── supabase/               migrations + schema/SUPER_MASTER_SCHEMA.sql
├── __tests__/              unit tests (sorting)
├── docs/                   living docs + agent-rules/
├── worker-config/          generated Wrangler configs (git-ignored)
└── middleware.ts           admin auth gate + worker role gate
```

## 2. Target tree (after universal refactor)

> Done: `lib/brand/` + `lib/store/` + `lib/hooks/` (2026-11-06). Remaining: `lib/platform/`.

```
zaynahs.pk/
├── app/                    routes only (no business logic)
│   ├── (store)/  admin/  api/  auth/
├── components/
│   ├── common/  store/  admin/  product-cards/
├── lib/
│   ├── brand/              ✅ registry + resolver (single brand entry point)
│   ├── platform/           ★ (planned) Cloudflare / Vercel adapters
│   ├── services/  supabase/  auth/  config/  store/  utils/  hooks/
│   ├── ai/ meta/ email/ postex/ security/ sorting/ traffic/ theme-*/
│   └── revalidate.ts
├── scripts/                ops + generators (worker:config, snapshot)
├── supabase/  docs/  __tests__/
├── worker-config/          generated per brand (git-ignored)
└── middleware.ts
```

Changes: `store/` → `lib/store/`, `hooks/` → `lib/hooks/`, new `lib/brand/`,
new `lib/platform/`, design-reference duplicates moved under `docs/`.

## 3. Request flow (storefront)

```
request
  → Cloudflare (WAF, cache rules, bot shield)
  → Next (Vercel today / Worker later)
      middleware.ts        role gate (store|admin|all) + admin auth gate
      app/(store)/<page>   server component
        → lib/services/*   data logic (tagged caches)
          → lib/supabase/server|admin  → Supabase (RLS)
        → components/store/*  client UI
  → HTML (ISR) + RSC payload
```

## 4. Request flow (admin save → storefront fresh)

```
admin UI → POST /api/admin/*  (requireAdmin)
  → lib/services write → Supabase
  → lib/revalidate.ts::revalidateStorefrontEdge(tags)
      → revalidateTag / revalidatePath (Next)
      → Cloudflare targeted purge (URL + tag)
  → Supabase DB webhook → /api/revalidate (secret) → same purge
  → storefront page regenerated on next request
```

Rule: **one** purge utility. No route purges cache on its own.

## 5. Data flow

```
Supabase tables (snake_case, UUID PK, RLS)
   ↓ lib/services/*  (typed mappers)
   ↓ server components / route handlers
   ↓ props → client components
Settings singleton (store_settings, store_settings_public)
   ↓ lib/services/settings
   ↓ brand name, colors, nav, banners, toggles
Secrets (server-only): lib/services/settings/server-secrets.ts
```

## 6. Platform boundary

| Concern | Vercel (today) | Cloudflare (target) |
|---|---|---|
| Cache | Next ISR + CF cache rules | OpenNext R2 incremental cache |
| Tag cache | Next in-memory/FS | Durable Object |
| Images | Supabase storage | R2 + `img.<host>` |
| Cron | Vercel cron | Cloudflare cron triggers |
| Worker role | `all` | one Worker per brand, admin by host |

Feature code never branches on platform — it calls `lib/platform/*`.
