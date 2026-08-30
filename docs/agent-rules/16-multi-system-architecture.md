# 16 — Multi-System Architecture Rules (/store vs /admin)

## Structure
```
/app
  /store    → customer-facing e-commerce (public)
  /admin    → POS / dashboard / management (auth-protected)
```

## Shared vs system-specific
- **Shared (mandatory, identical everywhere)**: Button, Input, Card base, Badge, Chip, Modal, Toast, Icon, Spinner, SearchBar base, FormField.
- **System-specific (different layout allowed, same tokens)**:
  - `/store` → mobile-first, customer UX, minimal chrome, big touch targets, product-focused cards.
  - `/admin` → data-dense, sidebar nav, tables, filters, desktop + tablet priority.
- Both systems use the SAME design tokens (color, spacing, radius, font) — only layout density/purpose differs, never the base look-and-feel.

## Route-level rule
- New `/store` page: import only from `/components/ui` + `/components/store`.
- New `/admin` page: import only from `/components/ui` + `/components/admin`.
- Never copy an `/admin`-style dense table into `/store`, or a `/store`-style card into `/admin`, without reason.

## Dual-sided feature integrity (Agent Operating Rule #9)
Whenever a feature is added/updated on the Storefront OR the Admin Panel, it MUST be fully implemented on the OTHER side too (e.g. a new storefront feature needs matching management/editor fields in Admin, and vice versa) — full DB integration, service sync, and type-safety throughout.

## Customizer & settings linking sync (Agent Operating Rule #10)
All theme/swatch controls, sizes (`xxs`–`xxl`), visibilities, and settings fields MUST be implemented in BOTH the main Settings dashboard AND the Visual Customizer sidebar. They stay fully linked/synchronized — edits in either interface immediately propagate to the DB, store settings state, and the live preview/storefront.
