# ENV

Every variable: name, purpose, owner, secret or public. **Never put values in this file.**

`NEXT_PUBLIC_*` is compiled into the client bundle → **never secret**.

## Supabase
| Name | Purpose | Secret |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | project URL | no |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public API key (RLS is the wall) | no |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only admin client | **yes** |
| `SUPABASE_PROJECT_REF` | project ref for management API | no |
| `SUPABASE_MGMT_TOKEN` | management API token (schema/webhooks) | **yes** |

## Site + brand
| Name | Purpose | Secret |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical store URL (brand) | no |
| `NEXT_PUBLIC_BRAND_NAME` | fallback brand name | no |
| `NEXT_PUBLIC_BRAND_TAGLINE` | fallback tagline | no |
| `NEXT_PUBLIC_TWITTER_HANDLE` | social handle (brand) | no |
| `NEXT_PUBLIC_ADMIN_EMAIL` | admin allow-list (PII) | no (server-checked) |
| `LEGACY_BRAND_NAMES` | old names to strip from stale DB text | no |
| `NEXT_PUBLIC_IMAGE_HOSTNAME` | extra `next/image` host | no |
| `ADMIN_HOST` | admin host for this brand (optional) | no |
| `IMG_HOST` | image host for this brand (optional) | no |
| `BRAND_HOSTS` | comma-separated hosts for this brand (optional) | no |
| `BRAND_SLUG` | worker/bucket slug (defaults to host label) | no |
| `BRAND_LOCALE` | e.g. `en-PK` | no |
| `BRAND_CURRENCY` | e.g. `PKR` | no |
| `NEXT_PUBLIC_WHATSAPP` | brand WhatsApp number | no |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | support address | no |
| `NEXT_PUBLIC_FACEBOOK_URL` / `_INSTAGRAM_URL` / `_TIKTOK_URL` / `_TWITTER_URL` / `_YOUTUBE_URL` | social links | no |

## Cache / cron
| Name | Purpose | Secret |
|---|---|---|
| `REVALIDATE_SECRET` | webhook + purge secret | **yes** |
| `CRON_SECRET` | cron route auth | **yes** |
| `AUTO_DEDUCT_STOCK` | opt-in stock deduction on order | no |
| `CUSTOMER_AUTH_SECRET` | customer session cookie signing | **yes** |

## Cloudflare
| Name | Purpose | Secret |
|---|---|---|
| `CLOUDFLARE_ZONE_ID` | brand zone | no |
| `CLOUDFLARE_API_TOKEN` | cache rules, DNS, purge | **yes** |
| `CF_ACCOUNT_ID` | account (Workers/R2) | no |

## Vercel (legacy platform)
| Name | Purpose | Secret |
|---|---|---|
| `VERCEL_TOKEN` | deploy / domain API | **yes** |
| `VERCEL_PROJECT_NAME` | project for this brand | no |
| `VERCEL_TEAM_ID` | team scope | no |

## GitHub
| Name | Purpose | Secret |
|---|---|---|
| `GITHUB_USERNAME` | repo owner | no |
| `GITHUB_TOKEN` | repo + workflow scope | **yes** |
| `GITHUB_REPO` | repo name | no |

## Commerce integrations
| Name | Purpose | Secret |
|---|---|---|
| `META_CATALOG_ID` | Meta catalog | no |
| `META_ACCESS_TOKEN` | catalog sync | **yes** |
| `META_GRAPH_API_VERSION` | Graph version | no |
| `NEXT_PUBLIC_META_PIXEL_ID` | browser pixel | no |
| `DISABLE_META_SYNC` | kill-switch for test deploys | no |
| `GOOGLE_INDEXING_SA_EMAIL` | service account email | no |
| `GOOGLE_INDEXING_SA_KEY` | service account key | **yes** |
| `GOOGLE_SITE_VERIFICATION` | search console meta | no |
| `INDEXNOW_API_KEY` | IndexNow | **yes** |
| `GEMINI_API_KEY` | AI copywriting / vision | **yes** |

## Realtime
| Name | Purpose | Secret |
|---|---|---|
| `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER` | server Pusher | key is public, secret is **yes** |
| `NEXT_PUBLIC_PUSHER_KEY` / `NEXT_PUBLIC_PUSHER_CLUSTER` | client Pusher | no |

## Files
| File | Committed | Contents |
|---|---|---|
| `.env.example` | yes | names + placeholders |
| `.env.local` | **no** (git-ignored) | active brand values |
| `env-backups/<store>.env.local` | **no** | per-store registry |
| `.dev.vars` | **no** | Wrangler local secrets |

## Workers secrets
Set with `wrangler secret`, never in `vars`:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`REVALIDATE_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_ADMIN_EMAIL`, `NEXT_PUBLIC_BRAND_NAME`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_API_TOKEN`.
