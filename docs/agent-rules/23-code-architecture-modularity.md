# 23 — RULE O1: Modular Code Architecture, File Limits & Module Reuse

## 1. File Size Limit (300–400 Lines Max)
- **Every file: 300–400 lines max** — components, pages, API routes, hooks, utils, everything.
- The moment a file approaches this limit, **do not keep growing it** — split it into new files right away:
  - A component crossing the limit → break into sub-components (`ProductCard.tsx` → `ProductCard.tsx` + `ProductCardImage.tsx` + `ProductCardPrice.tsx`).
  - A page/route file crossing the limit → move logic out into `lib/` or `services/`, keep page file for layout + data fetching only.
  - An API route crossing the limit → extract validation, DB queries, and business logic into separate service/helper files.
  - A utils/lib file crossing the limit → split by domain (`lib/pricing.ts`, `lib/cart.ts`) instead of one giant file.
- **Every distinct function/responsibility gets its own file**, organized in a proper folder — not multiple unrelated functions dumped in one file.
- **One file per modal/tab**: every settings tab, dashboard form, modal dialog, sliding sheet, or customizer property panel MUST live in its own dedicated file (e.g. under `components/admin/customizer/sections/` or `components/admin/settings/`).
- Readability and single-responsibility take priority, but 300–400 lines is the hard ceiling to split at.

## 2. Reuse Shared Modules — Never Rewrite What Already Exists
- **Do not write new code for something that already exists.** Before creating any component, hook, util, or type:
  1. Search the existing codebase (`components/ui/`, `components/shared/`, `hooks/`, `lib/`) for something that already does this or something close to it.
  2. **If it exists — use it / import it.** Do not duplicate it, do not rewrite a similar version, do not copy-paste and tweak it into a new file.
  3. If it exists but doesn't fully fit, **extend/generalize the shared version** (add a prop, param, or variant) — everyone keeps using the one shared file, not a fork of it.
  4. Only create a brand-new file when no existing shared module reasonably covers the need.
  5. Any new shared/reusable piece (UI component, hook, util) goes into the shared folder (`components/shared/` or `components/ui/`), never inline in a page or feature folder.

## 3. Match Existing Code Style
Before writing new code in any file:
- Open 1–2 similar existing files in the same folder first.
- Match existing naming conventions, import order, prop typing style, and folder structure exactly.
- Do not introduce a new pattern (e.g. a different state-management approach, a different styling method) if an established pattern already exists for that concern in the codebase.
