# AUDIT PASS 3 — Customizer Deep Audit (media, carousel, live preview, gating)

Status: **critical erroring bugs fixed + verified (tsc = 0 errors); shared-component extraction planned.**

## Live preview mechanism — VERIFIED GOOD (no fix needed)
The customizer preview is already live/AJAX, no save+reload:
- Editor renders `<iframe src="/admin/settings/customizer/preview">` at 3 device scales (`components/admin/customizer-editor/CustomizerPreview.tsx:69,116,163`).
- `useCustomizerIframeSync.ts` posts `{type:'sync', sections, settings, products}` to the iframe on every state change and on the iframe `ready` handshake.
- `preview/PreviewClient.tsx:53-90` applies `sync` and renders the **real storefront components** (`StoreFront`, `ShopPage`) — so preview == live output by construction (one code path, not a mock).
- Bidirectional select/nav via `select_section` / `nav_to_page` / `scroll_to_section` messages.
- Persistence: settings autosave 1s, sections 1.2s; explicit Save Layout also purges edge cache (`useCustomizerState.ts:342`).

Gating in the customizer (Flash Sale / Social Feed lock) already routes through `lib/features/premium.ts` after Pass 0/2 — verified.

## ✅ Root-cause bugs FIXED

### F3-1 — "Banner video selector errors out / lands on wrong section" (the reported bug)
Root cause: the media modal dispatches selections through **two** state channels — `mediaUploadTarget` (target-based) and `mediaSelectCallback` (callback-based) — and `handleMediaSelected` (`useCustomizerState.ts:255`) checks the callback **first**. `CustomizerEditor.tsx` `onClose` only did `setIsMediaModalOpen(false)`, never clearing these. So: open a callback-based picker (e.g. Social Feed) → dismiss without selecting → open the Hero **video** (target-based) picker → the **stale** callback fired and the URL landed on the wrong section.
**Fix:**
- `components/admin/CustomizerEditor.tsx` — `onClose` now clears BOTH `mediaSelectCallback` and `mediaUploadTarget` (every open goes through this single modal, so no stale state can survive a close).
- `components/admin/customizer-editor/hooks/useCustomizerState.ts` — `handleMediaSelected` callback branch now also clears `mediaUploadTarget`.
Since `MediaManager.handleConfirmSelection` calls `onSelect` then `onClose` (`useMediaManagerData.ts:210-213`), every selection path now resets picker state. Bug eliminated at root, not per-section.

### F3-2 — Hero panel churn / activeSlideId reset ("misaligned/unoptimized")
Root cause: the slide-migration `useEffect` in `HeroBannerSettings.tsx` had unstable object refs (`contentData`, `slides`, `onUpdateSection`) in its dependency array, so it re-ran on every render.
**Fix:** dependencies narrowed to primitives (`section.id`, `contentData.slides?.length`, `activeSlideId`); guard reads `contentData.slides` directly. No more per-render churn.

### Video poster/fallback — verified NOT broken
`HeroSlideItem.tsx` layers the responsive preset `<img>` (opacity-100) beneath the `<video>` and crossfades once `onLoadedData/onCanPlay/onPlaying` fires — this IS the poster/fallback and is responsive-image-aware. Left as-is (better than a static `poster=`).

## 🔶 Confirmed duplicate media/carousel implementations — extraction plan (staged, not yet merged)
These are TRUE duplicates (per the read-only audit). Merging them is a larger refactor scheduled as its own tracked step to avoid rushed regressions; the erroring behavior above is already fixed independently.

1. **Admin "ordered list of media cards" editors — 4 hand-written copies** of add/remove/reorder + media-select:
   - `sections/hero-banner/HeroSlideManager.tsx`
   - `sections/CategoryGridSettings.tsx` (:181-312)
   - `sections/CollectionsGridSettings.tsx` (:380-469)
   - `sections/SocialFeedItemsEditor.tsx`
   → merge into one `MediaCardListEditor`.
2. **Field-level "image URL input + Select button"** repeated in `HeroActiveSlideForm.tsx:69-113`, `pages/GlobalSettings.tsx:24-65`, `SocialFeedItemsEditor.tsx:184-232` → extract shared `MediaField` (wraps the already-canonical `MediaSelectorModal`).
3. **Storefront product carousels** `ProductDetailGallery.tsx` and `QuickViewModal.tsx` are near-identical Embla galleries → extract shared `ImageCarousel` (thumbnails + arrows + dots); `HeroBannerSection` can reuse it with an `autoplay` option.
4. **Raw-URL media entry** in `BrandsLogosSettings.tsx:30` (a `<textarea>` of URLs — no picker/upload/preview/reorder) → migrate onto `MediaCardListEditor`.
5. **Inconsistent per-section media UI** (button vs clickable-thumbnail vs textarea vs avatar+input) collapses automatically once `MediaField`/`MediaCardListEditor` are the single entry points.

Canonical decisions (locked):
- Media **library/picker** stays `MediaManager` + `MediaSelectorModal` (already correct — do NOT rebuild).
- New shared components to build: `MediaField`, `MediaCardListEditor`, `ImageCarousel`.
- Collapse the dual `onSelectMedia` contract to the single callback shape `(onSelect:(url)=>void)=>void` when `MediaField` lands (removes the fragile `mediaUploadTarget` dispatch entirely).

## Decisions made
- The stale-picker-state class of bug is fixed centrally (modal close resets all dispatch state) — no per-section band-aids.
- Media/carousel consolidation is a defined, tracked refactor with named target components, not left vague.

## ✅ Pass 3b (partial) — shared `MediaField` extracted
Created `components/admin/customizer/shared/MediaField.tsx` (URL input + preview-ready + "Select from library" button) as the single-source field. Migrated the duplicated input+button blocks in `HeroActiveSlideForm.tsx` (banner image + video URL) and `GlobalSettings.tsx` (favicon + logo). `tsc` = 0 errors. Remaining Pass 3b (larger, tracked): `MediaCardListEditor` (Hero/Category/Collections/Social/Brands ordered-media lists) and `ImageCarousel` (ProductDetailGallery/QuickView/Hero). `SocialFeedItemsEditor` uses a distinct avatar+URL layout — can adopt `MediaField` in the follow-up.

## ✅ Pass 3b cont. — shared gallery Embla wiring (`useEmblaGallery`)
Created `components/store/product-card/hooks/useEmblaGallery.ts` — the ONE genuinely duplicated bit between `ProductDetailGallery` and `QuickViewModal` (Embla init + bidirectional swipe⇄activeIndex sync). Both now use it; removed their duplicate `useEmblaCarousel` init + select-sync effects.
**Deliberate scope call:** did NOT force a monolithic `ImageCarousel`. The two galleries' chrome is *intentionally different* (product page = hover-zoom + lightbox + badges + stock pill; quick-view = compact, variant-synced, in-modal) — per SSOT1 "merge only true duplicates, keep intentional variations distinct." Only the wiring was a true duplicate, so only the wiring was shared. This avoids a leaky abstraction on two critical conversion surfaces.

## ✅ Pass 3b cont. — shared reorder helper `moveItemInArray`
The identical "move item up/down (adjacent swap)" logic was copy-pasted in 7 customizer list editors. Extracted `moveItemInArray(arr, index, direction)` into `lib/utils/arrayMove.ts` (alongside the pre-existing drag-oriented `arrayMove`) and routed all 7 through it: `HeroBannerSettings`, `CategoryGridSettings`, `CollectionsGridSettings`, `FlashSaleProductManager`, `FlashSaleCategoryRules`, `ProductLayoutSubTab`, `ProductCardSettings`. Zero inline temp-swap reorder remains in the customizer. `tsc` = 0 errors.
**Note:** a full monolithic `MediaCardListEditor` was intentionally NOT built — the four "media card list" editors use two genuinely different interaction models (Hero = master-list + separate form; grids = inline-per-card editing), so per SSOT1 only the truly-identical reorder logic was shared, not the divergent item UI.
