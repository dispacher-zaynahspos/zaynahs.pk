# components/ — UI only

## Purpose
Presentational + interactive React components. No data fetching, no Supabase, no env.

## Belongs here
| Folder | Contents |
|---|---|
| `common/` | brand-neutral shared UI (`Modal`, reorder, controls) |
| `store/` | storefront UI (header, hero, catalog, cart, product page parts) |
| `admin/` | admin UI (settings-form, customizer, tables, drawers) |
| `product-cards/` | the product card system (SSOT, see `docs/UI_CARDS.md`) |

## Does not belong here
- Data fetching / Supabase queries → pass props from server components
- Business rules / price calculations → `lib/services/`
- Brand names, domains, phone numbers, colors → settings/brand config
- Platform code (Cloudflare/Vercel) → `lib/platform/`

## Conventions
- Mobile-first (base styles = phone, enhance upward).
- Shared primitives from `components/common/` before writing a new one (RULE SSOT1).
- Overlays go through `components/common/Modal.tsx` (RULE MODAL1).
