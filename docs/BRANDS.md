# BRANDS

How a brand is defined, and how to add a new one without touching feature code.

## 1. Principle

One universal codebase. A brand is **configuration**, never a code branch.

```
lib/brand/
  registry.ts    one entry per brand, keyed by hostname
  resolve.ts     resolveBrand(host) → BrandConfig   (single entry point)
  types.ts       BrandConfig type
```

Nothing outside `lib/brand/` may read `NEXT_PUBLIC_BRAND_*` directly.

## 2. Brand config (public data)

```ts
export interface BrandConfig {
  slug: string;              // "zaynahs"
  hosts: string[];           // ["zaynahs.pk", "www.zaynahs.pk"]
  adminHost: string;         // "admin.zaynahs.pk"
  imageHost: string;         // "img.zaynahs.pk"
  name: string;              // "Zaynahs.pk"
  tagline?: string;
  twitterHandle?: string;
  locale: string;            // "en-PK"
  currency: string;          // "PKR"
  whatsapp?: string;
  supportEmail?: string;
  socialLinks?: Record<string, string>;
}
```

Secrets and IDs are **not** in the registry — they come from per-brand env
(brand-neutral names, e.g. `SITE_URL`, `SUPABASE_URL`).

## 3. Precedence

1. Database `store_settings` (admin-editable, wins for name/colors/content)
2. Brand registry (host mapping, non-editable defaults)
3. `NEXT_PUBLIC_*` env (fallback only)

## 4. Add a new brand (checklist)

1. Add one entry to `lib/brand/registry.ts`.
2. Create `env-backups/<slug>.env.local` (copy `.env.example`, fill values).
3. `npm run worker:config -- --store=<slug>` → generated Wrangler config.
4. DNS: create the zone/records (brand account only).
5. Supabase: new project or existing project with separate `store_settings` row.
6. Deploy the Worker, set secrets, verify freshness test.
7. Add the brand to `docs/ENV.md` ownership table and `docs/AGENT-LOG.md`.

No feature file changes. If a code change is needed, the abstraction is wrong — fix `lib/brand/`.

## 5. Dry-run proof

Step 3 of the migration plan proves this with a fake brand
(`example.test`) on localhost hosts: the app must render with zero code edits.

## 6. Rules

- Brands never share caches: each brand gets its own R2 cache + tag cache.
- Brand text inside AI prompts, emails, SEO copy must come from settings/config.
- `LEGACY_BRAND_NAMES` handles stale text already stored in the database.
