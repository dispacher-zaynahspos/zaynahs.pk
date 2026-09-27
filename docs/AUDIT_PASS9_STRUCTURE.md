# AUDIT PASS 9 — File & Folder Structure

Status: **assessed; safe cleanups applied. Mass restructure deliberately NOT done (high blast radius, low value).**

## Assessment
The structure already follows domain/feature organization that matches the admin menu:
- `app/admin/<domain>/` (products, orders, customers, settings, ...) mirrors the sidebar.
- `components/admin/<feature>/`, `components/store/<feature>/`, `lib/services/<domain>/`.
- Shared code in `components/common`, `components/admin/shared`, `lib/utils`, `lib/config`, `lib/features`, `lib/auth`.
A wholesale move/rename of the ~62 `components/admin` entries would touch dozens of imports at once for marginal readability gain and real regression risk — so per engineering judgment it was NOT done as a blind sweep. Targeted, safe cleanups were applied instead.

## ✅ Cleanups applied (verified, tsc = 0 errors)
- Removed empty leftover dirs `app/api/debug`, `app/api/debug-product`.
- Deleted 3 genuinely orphaned files (zero references anywhere in the repo — dead code from earlier iterations): `components/admin/OrderActionsDropdown.tsx`, `components/admin/PostExFulfillmentModal.tsx`, `components/admin/SortableMediaGrid.tsx`.
- (Pass 1) removed dead debug routes `app/api/test`, `app/api/test-product`.

## If a full reorg is wanted later (safe procedure)
Do it ONE domain at a time: move a feature's files into its subfolder, update imports, run `tsc`/build, commit; repeat. Never move many domains in one pass. New shared modules already live in clear homes (`lib/features`, `lib/auth`, `lib/config`, `components/admin/customizer/shared`, `components/store/product-card/hooks`).
