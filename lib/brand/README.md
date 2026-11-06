# lib/brand/ — brand config

## Purpose
The one place that knows what a "brand" is. Public brand data + host → brand mapping.

## Belongs here
- `types.ts` — `BrandConfig` shape
- `registry.ts` — builds brand entries from env (no hardcoded domains/names)
- `resolve.ts` — **single entry point**: `resolveBrand(host)`

## Does not belong here
- Secrets / API keys (env only, server-side)
- Admin-editable content (name, colors, banners) → `store_settings` DB, which wins
- Platform code → `lib/platform/`

## Rules
- No domain, name, phone or ID literal in source — everything resolves from env.
- New brand = new env file + `BRAND_HOSTS`/`BRAND_SLUG`; never a code edit.
- Consumers call `resolveBrand()`; they never read `NEXT_PUBLIC_BRAND_*` directly.
