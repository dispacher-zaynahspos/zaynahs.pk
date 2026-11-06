# lib/ — server logic, data access, shared modules

## Purpose
Everything that is not a route and not a presentational component.

## Belongs here
| Folder/file | Contents |
|---|---|
| `brand/` (target) | brand registry + single resolver |
| `platform/` (target) | Cloudflare/Vercel adapters — only place with platform code |
| `services/` | data logic per domain (products, orders, settings, reviews, ...) |
| `supabase/` | `client`, `server`, `admin` clients only |
| `auth/` | `requireAdmin`, guards |
| `config/` | singleton IDs, domain config, worker role |
| `utils/` | pure helpers |
| `hooks/` | client hooks |
| `ai/ meta/ email/ postex/ security/ sorting/ traffic/ theme-*/` | domain modules |
| `revalidate.ts` | single cache-purge entry point |

## Does not belong here
- JSX/UI → `components/`
- Route handlers → `app/api/`
- One-off scripts → `scripts/`
- Secrets in source (only `process.env`, server-side)

## Conventions
- One responsibility per file; split when it stops being readable in one sitting.
- No duplicate implementations — check `docs/agent-rules/27-single-source-of-truth.md`.
- `lib/services/*` is the only place that talks to the database.
