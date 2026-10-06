# 🏆 STOREFRONT SECTIONS — ULTRA-DETAILED 5-STAR IMPLEMENTATION PLAN
### For: Gemini Flash 4.8 (Junior Model Execution)
### Codebase: `/Users/shoaib/Desktop/zaynahsestore-tv-main`

> ⚠️ **PRIME DIRECTIVES** (never violate):
> 1. **TypeScript strict** — every file `.tsx`/`.ts`, NO `any` except where existing code already uses it
> 2. **Mobile-first** — design 375px first, then `sm:` `md:` `lg:`
> 3. **SSOT1** — reuse existing shared components, never duplicate
> 4. **Icons**: ONLY from `@/components/common/Icons`
> 5. **AccordionGroup**: import from `@/components/admin/customizer/controls`
> 6. **ResponsiveGridColumnsControl**: import from `../shared/ResponsiveGridColumnsControl`
> 7. **Dark mode**: every surface needs `dark:` counterpart
> 8. **No hardcoded colors** in storefront — use `var(--color-primary)` CSS vars

---

## 🗺️ OVERVIEW — TWO TRACKS

| Track | What | Files Touched | Status |
|-------|------|---------------|--------|
| **A — Upgrades** | Bring existing 13 sections to 5★ | Edit existing files | ✅ **COMPLETE** (`d884c3b`) |
| **B — New Sections** | Add 5 brand-new section types + wiring | Create new files + wire | ✅ **COMPLETE** (`93c7580`, `3cd0c22`) |

**Status Summary**:
- ✅ `SectionWrapper.tsx` and `SectionSpacingControls.tsx` built & applied to all sections.
- ✅ `BrandsLogosSettings.tsx` & `BrandsLogosSection` upgraded (media library picker, reorder, grayscale, height).
- ✅ `ProductGridSettings.tsx` & `StoreFrontProductGridSection.tsx` upgraded with `display_mode: 'grid' | 'slider'`.
- ✅ All 5 new storefront sections created (`image_with_text`, `tabbed_product_grid`, `circular_categories`, `faq_accordion`, `rich_text`).
- ✅ All 5 customizer section settings editors created with strict types and shared controls.
- ✅ Registered in `lib/theme-schema/sections.ts` (types + registry + auto palette).
- ✅ Registered in `lib/services/sections/homepage-sections.ts` (`addHomepageSection` defaults).
- ✅ Registered in `components/store/StoreFront.tsx` (RSC/client rendering switch).
- ✅ Registered in `components/admin/customizer-editor/CustomizerRightSidebar.tsx` & `useCustomizerState.ts`.
- ✅ Verification: `npx tsc --noEmit` = **0 errors**.
- ✅ Verification: `npm run check:setup` = **PASSED** (144 migrations, triggers, envs in sync).

---

# ═══════════════════════════════════════
# TRACK A — EXISTING SECTION UPGRADES
# ═══════════════════════════════════════

## A1 — SHARED SECTION WRAPPER: `SectionWrapper`
**Priority: CRITICAL — Do this FIRST, every other section uses it**

### Problem
Every section has hardcoded `py-5`, `py-8`, `px-4` etc. No per-section padding/background control.

### Solution: New shared component

**CREATE NEW FILE:**
```
components/store/store-front/SectionWrapper.tsx
```

**Exact code to write:**
```tsx
'use client';

import React from 'react';

interface SectionWrapperProps {
  section: {
    id: string;
    settings: Record<string, any>;
  };
  children: React.ReactNode;
  /** override default max-w class e.g. 'max-w-full' for full-bleed sections */
  maxWidthClass?: string;
  /** if true, do NOT apply px-4 padding (for full-bleed sections like hero/ticker) */
  fullBleed?: boolean;
}

/**
 * SSOT1 — shared outer wrapper for ALL homepage sections.
 * Reads `section.settings.padding_top`, `section.settings.padding_bottom`,
 * `section.settings.section_bg_color` and applies them uniformly.
 * Default: pt-5 pb-5, no custom bg.
 */
export function SectionWrapper({ section, children, maxWidthClass = 'max-w-7xl', fullBleed = false }: SectionWrapperProps) {
  const s = section.settings || {};
  const ptVal = Number(s.padding_top ?? 20);
  const pbVal = Number(s.padding_bottom ?? 20);
  const bgColor = s.section_bg_color || '';

  return (
    <div
      id={section.id}
      style={{
        paddingTop: `${ptVal}px`,
        paddingBottom: `${pbVal}px`,
        backgroundColor: bgColor || undefined,
      }}
    >
      {fullBleed ? (
        children
      ) : (
        <div className={`mx-auto ${maxWidthClass} px-4 sm:px-6 lg:px-8`}>
          {children}
        </div>
      )}
    </div>
  );
}
```

---

### New shared settings UI: `SectionSpacingControls`

**CREATE NEW FILE:**
```
components/admin/customizer/shared/SectionSpacingControls.tsx
```

**Exact code:**
```tsx
'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';

interface SectionSpacingControlsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

/**
 * SSOT1 — universal Section Spacing & Background accordion.
 * Add <SectionSpacingControls> at the BOTTOM of every section's settings editor.
 */
export default function SectionSpacingControls({ section, onUpdateSection }: SectionSpacingControlsProps) {
  const s = section.settings || {};

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });

  return (
    <AccordionGroup id={`spacing-${section.id}`} title="Spacing & Background" defaultOpen={false}>
      <div className="space-y-4 pt-2">
        {/* Padding Top */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Padding Top</label>
            <span className="text-xs font-bold text-[#e94560]">{s.padding_top ?? 20}px</span>
          </div>
          <input
            type="range" min={0} max={120} step={4}
            value={s.padding_top ?? 20}
            onChange={(e) => setSetting('padding_top', parseInt(e.target.value))}
            className="w-full accent-[#e94560]"
          />
        </div>

        {/* Padding Bottom */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Padding Bottom</label>
            <span className="text-xs font-bold text-[#e94560]">{s.padding_bottom ?? 20}px</span>
          </div>
          <input
            type="range" min={0} max={120} step={4}
            value={s.padding_bottom ?? 20}
            onChange={(e) => setSetting('padding_bottom', parseInt(e.target.value))}
            className="w-full accent-[#e94560]"
          />
        </div>

        {/* Section Background Color */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Section Background</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={s.section_bg_color || '#ffffff'}
              onChange={(e) => setSetting('section_bg_color', e.target.value)}
              className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={s.section_bg_color || ''}
              onChange={(e) => setSetting('section_bg_color', e.target.value)}
              placeholder="transparent / #f8f8f8"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
            {s.section_bg_color && (
              <button
                type="button"
                onClick={() => setSetting('section_bg_color', '')}
                className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </AccordionGroup>
  );
}
```

---

## A2 — UPGRADE: `BrandsLogosSettings` (1★ → 5★)

**File to REPLACE:**
```
components/admin/customizer/sections/BrandsLogosSettings.tsx
```

**Current state:** 40 lines, textarea for URLs only. No image preview, no reorder, no media picker.

**What to write (full replacement):**
```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { HomepageSection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Plus } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import MediaField from '../shared/MediaField';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface BrandsLogosSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string, isGridItem?: boolean, gridIndex?: number) => void;
}

export default function BrandsLogosSettings({ section, onUpdateSection, onSelectMedia }: BrandsLogosSettingsProps) {
  const contentData = section.content_data || {};
  const logos: string[] = contentData.logos || [];
  const s = section.settings || {};

  const setLogos = (next: string[]) =>
    onUpdateSection({ content_data: { ...contentData, logos: next } });

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });

  const addLogo = () => setLogos([...logos, '']);
  const removeLogo = (idx: number) => setLogos(logos.filter((_, i) => i !== idx));
  const updateLogo = (idx: number, url: string) => {
    const next = [...logos];
    next[idx] = url;
    setLogos(next);
  };
  const moveLogo = (idx: number, dir: 'up' | 'down') => setLogos(moveItemInArray(logos, idx, dir === 'up' ? idx - 1 : idx + 1));

  return (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionGroup id={`bl-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Grayscale Effect</span>
              <span className="text-[10px] text-gray-400">Logos appear faded, full color on hover</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={s.grayscale !== false}
                onChange={(e) => setSetting('grayscale', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {/* Logo size */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Logo Height</label>
              <span className="text-xs font-bold text-[#e94560]">{s.logo_height ?? 48}px</span>
            </div>
            <input
              type="range" min={24} max={96} step={4}
              value={s.logo_height ?? 48}
              onChange={(e) => setSetting('logo_height', parseInt(e.target.value))}
              className="w-full accent-[#e94560]"
            />
          </div>
        </div>
      </AccordionGroup>

      {/* Logos List */}
      <AccordionGroup id={`bl-${section.id}-logos`} title={`Partner Logos (${logos.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {logos.map((url, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                {url && (
                  <div className="relative w-12 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200 dark:border-gray-700">
                    <Image src={url} alt="Logo" fill className="object-contain p-1" sizes="48px" />
                  </div>
                )}
                <div className="flex items-center gap-0.5 ml-auto shrink-0">
                  <button onClick={() => moveLogo(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => moveLogo(idx, 'down')} disabled={idx === logos.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
                  <button onClick={() => removeLogo(idx)} className="p-0.5 text-red-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <MediaField
                label="Logo Image URL"
                value={url}
                onChange={(val) => updateLogo(idx, val)}
                onSelect={() => onSelectMedia('content_data', 'logos', true, idx)}
                placeholder="https://... or select from library"
              />
            </div>
          ))}
          <button
            onClick={addLogo}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Logo
          </button>
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
```

**Also update renderer** `components/store/store-front/StoreFrontSections.tsx` — `BrandsLogosSection` function:

Find this block (lines 57–78) and upgrade it to support `logo_height` and `grayscale` settings:
```tsx
// In BrandsLogosSection, replace the inner div:
const logoHeight = section.settings?.logo_height ?? 48;
const grayscale = section.settings?.grayscale !== false;

// Change the className on the outer flex div:
className={`flex items-center justify-center gap-12 flex-wrap transition-opacity ${grayscale ? 'opacity-65 grayscale hover:opacity-100' : 'opacity-100'}`}

// Change the logo dimensions:
<div key={idx} className="relative" style={{ width: logoHeight * 2, height: logoHeight }}>
```

**Wire media picker in `CustomizerRightSidebar.tsx`** — find `brands_logos` block (line 202–207) and add `onSelectMedia`:
```tsx
{activeSection.section_type === 'brands_logos' && (
  <BrandsLogosSettings
    section={activeSection}
    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
    onSelectMedia={(fieldPath, fieldKey, isGridItem, gridIndex) => {
      setMediaUploadTarget({ sectionId: activeSection.id, fieldPath, fieldKey, isGridItem, gridIndex });
      setIsMediaModalOpen(true);
    }}
  />
)}
```

---

## A3 — UPGRADE: `ProductGridSettings` — Add Slider Mode (3★ → 5★)

**File to EDIT:**
```
components/admin/customizer/sections/ProductGridSettings.tsx
```

**What to ADD** inside the `AccordionGroup id="pg-*-content"` accordion, after the columns control (after line 143, before `</div></AccordionGroup>`):

```tsx
{/* Display Mode: Grid vs Carousel/Slider */}
<div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-800">
  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Display Mode</label>
  <div className="grid grid-cols-2 gap-2">
    {(['grid', 'slider'] as const).map((mode) => (
      <button
        key={mode}
        type="button"
        onClick={() => handleSettingsChange('display_mode', mode)}
        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
          (settings.display_mode || 'grid') === mode
            ? 'bg-[#e94560] text-white border-[#e94560]'
            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        {mode === 'grid' ? '⊞ Grid' : '▷ Slider'}
      </button>
    ))}
  </div>
  {(settings.display_mode === 'slider') && (
    <p className="text-[10px] text-gray-400 leading-normal pt-1">
      Slider mode: swipeable horizontal scroll on mobile, arrows on desktop.
    </p>
  )}
</div>
```

**Also add `SectionSpacingControls` at bottom of ProductGridSettings** (before final `</div>`):
```tsx
import SectionSpacingControls from '../shared/SectionSpacingControls';
// ... at the bottom, after the last AccordionGroup:
<SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
```

**File to EDIT (renderer):**
```
components/store/store-front/StoreFrontProductGridSection.tsx
```

Add slider mode rendering. After the existing `<ProductGrid ... />` (line 180–187), replace entire ProductGrid block:

```tsx
const displayMode = section.settings?.display_mode || 'grid';

// Replace ProductGrid render with:
{displayMode === 'slider' ? (
  <div className="relative">
    <div
      className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {displayProducts.map((product) => (
        <div
          key={product.id}
          className="flex-shrink-0 snap-start"
          style={{ width: `calc(${100 / (Number(section.settings?.columns_mobile) || 2)}% - 8px)` }}
        >
          {/* Reuse existing ProductCard — import from @/components/store/ProductCard */}
          <ProductCard
            product={product}
            currencySymbol={activeSettings.currency_symbol}
            settings={activeSettings}
          />
        </div>
      ))}
    </div>
  </div>
) : (
  <ProductGrid
    products={displayProducts}
    currencySymbol={activeSettings.currency_symbol}
    settings={activeSettings}
    columnsDesktop={Number(section.settings?.columns_desktop) || 4}
    columnsTablet={Number(section.settings?.columns_tablet) || 3}
    columnsMobile={Number(section.settings?.columns_mobile) || 2}
  />
)}
```

**Add import at top of StoreFrontProductGridSection.tsx:**
```tsx
import ProductCard from '../ProductCard';
```

---

## A4 — ADD `SectionSpacingControls` to ALL Remaining Editors

**Files to edit** — add import + component at the bottom of each settings editor:

| File | Import path | Last line before return end |
|------|------------|---------------------------|
| `CategoryGridSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |
| `CollectionsGridSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |
| `PromoBannerSettings.tsx` | `../shared/SectionSpacingControls` | After last `<div>` |
| `RecentReviewsSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |
| `ValuePropsSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |
| `HeroBannerSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |
| `FlashSaleSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |
| `SocialFeedSettings.tsx` | `../shared/SectionSpacingControls` | After last AccordionGroup |

**Pattern to add in EVERY file (same 2 lines):**
```tsx
// Step 1: Add import at top (after existing imports)
import SectionSpacingControls from '../shared/SectionSpacingControls';

// Step 2: Add before closing </div> of outer return
<SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
```

---

## A5 — UPDATE `lib/theme-schema/sections.ts` (SectionType union + SECTION_REGISTRY)

**File to EDIT:**
```
lib/theme-schema/sections.ts
```

**Step 1** — add new section types to the `SectionType` union (line 14–27):
```ts
export type SectionType =
  | 'hero_banner'
  | 'product_grid'
  | 'category_list'
  | 'category_grid'
  | 'collections_grid'
  | 'promo_banner'
  | 'trust_badges'
  | 'recent_reviews'
  | 'brands_logos'
  | 'social_feed'
  | 'ticker'
  | 'value_props'
  | 'flash_sale'
  // ── NEW SECTIONS ──
  | 'image_with_text'
  | 'tabbed_product_grid'
  | 'circular_categories'
  | 'faq_accordion'
  | 'rich_text';
```

**Step 2** — add to `SECTION_REGISTRY` (after `flash_sale` entry, before the closing `};`):
```ts
  image_with_text: {
    type: 'image_with_text',
    paletteLabel: 'Image + Text',
    defaultTitle: 'Our Brand Story',
    description: 'Left/right split: image on one side, heading + body + CTA on the other.',
    defaultSettings: { layout: 'image_left', image_width: 50 },
    defaultContent: {
      heading: 'Our Story',
      body: 'Tell your brand story here...',
      button_text: 'Learn More',
      button_link: '/shop',
    },
  },
  tabbed_product_grid: {
    type: 'tabbed_product_grid',
    paletteLabel: 'Tabbed Products',
    defaultTitle: 'Explore Collection',
    deviceAware: true,
    description: 'New Arrivals / Best Sellers / Sale tabs in one section.',
    defaultSettings: {
      columns_desktop: 4,
      columns_tablet: 3,
      columns_mobile: 2,
      limit_per_tab: 8,
    },
    defaultContent: {
      tabs: [
        { id: 'new', label: 'New Arrivals', source: 'recent' },
        { id: 'best', label: 'Best Sellers', source: 'featured' },
        { id: 'sale', label: 'On Sale', source: 'sale' },
      ],
    },
  },
  circular_categories: {
    type: 'circular_categories',
    paletteLabel: 'Round Categories',
    defaultTitle: 'Shop By Style',
    deviceAware: true,
    description: 'Circular image chips in a horizontal scroll row.',
    defaultSettings: { item_size: 80, show_labels: true },
    defaultContent: { items: [] },
  },
  faq_accordion: {
    type: 'faq_accordion',
    paletteLabel: 'FAQ Accordion',
    defaultTitle: 'Frequently Asked Questions',
    description: 'Expandable Q&A accordion.',
    defaultContent: {
      items: [
        { q: 'What are your delivery timelines?', a: '2–4 business days nationwide.' },
        { q: 'Do you offer Cash on Delivery?', a: 'Yes! COD is available on all orders.' },
        { q: 'How do I return an item?', a: 'Contact us on WhatsApp within 7 days.' },
      ],
    },
  },
  rich_text: {
    type: 'rich_text',
    paletteLabel: 'Rich Text',
    defaultTitle: 'About Our Brand',
    description: 'Simple text block — heading, paragraph, optional CTA button.',
    defaultSettings: { text_align: 'center', max_width: 'narrow' },
    defaultContent: {
      heading: 'Welcome to Our Store',
      body: 'We bring you the finest quality kids clothing and jewelry from Pakistan.',
      button_text: '',
      button_link: '',
    },
  },
```

**Step 3** — add default settings/content to `addHomepageSection` in:
```
lib/services/sections/homepage-sections.ts
```

After the existing `value_props` block (line 199), add:
```ts
} else if (sectionType === 'image_with_text') {
  settings = { layout: 'image_left', image_width: 50 };
  content_data = {
    heading: 'Our Story',
    body: 'Tell your brand story here...',
    button_text: 'Learn More',
    button_link: '/shop',
  };
} else if (sectionType === 'tabbed_product_grid') {
  settings = { columns_desktop: 4, columns_tablet: 3, columns_mobile: 2, limit_per_tab: 8 };
  content_data = {
    tabs: [
      { id: 'new', label: 'New Arrivals', source: 'recent' },
      { id: 'best', label: 'Best Sellers', source: 'featured' },
      { id: 'sale', label: 'On Sale', source: 'sale' },
    ],
  };
} else if (sectionType === 'circular_categories') {
  settings = { item_size: 80, show_labels: true };
  content_data = { items: [] };
} else if (sectionType === 'faq_accordion') {
  content_data = {
    items: [
      { q: 'What are your delivery timelines?', a: '2–4 business days nationwide.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes! COD is available on all orders.' },
      { q: 'How do I return an item?', a: 'Contact us on WhatsApp within 7 days.' },
    ],
  };
} else if (sectionType === 'rich_text') {
  settings = { text_align: 'center', max_width: 'narrow' };
  content_data = {
    heading: 'Welcome to Our Store',
    body: 'We bring you the finest quality kids clothing and jewelry.',
    button_text: '',
    button_link: '',
  };
}
```

---

# ═══════════════════════════════════════
# TRACK B — 5 NEW SECTION TYPES
# ═══════════════════════════════════════

## B1 — NEW SECTION: `image_with_text`

### B1a — Renderer

**CREATE NEW FILE:**
```
components/store/store-front/ImageWithTextSection.tsx
```

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection } from '@/lib/types';

interface ImageWithTextSectionProps {
  section: HomepageSection;
}

/**
 * Image + Text split section (brand story, USP, about).
 * Layout: image_left (default) | image_right | image_top (mobile always stacks top).
 */
export function ImageWithTextSection({ section }: ImageWithTextSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const layout = s.layout || 'image_left';
  const imageWidthPct = s.image_width || 50;
  const imageUrl: string = c.image_url || '';
  const heading: string = c.heading || 'Our Brand Story';
  const body: string = c.body || '';
  const buttonText: string = c.button_text || '';
  const buttonLink: string = c.button_link || '/shop';
  const aspectRatio: string = s.aspect_ratio || '4/3';

  const aspectClass = aspectRatio === '1/1' ? 'aspect-square'
    : aspectRatio === '16/9' ? 'aspect-[16/9]'
    : aspectRatio === '3/4' ? 'aspect-[3/4]'
    : 'aspect-[4/3]';

  const isImageRight = layout === 'image_right';

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      style={{
        paddingTop: `${s.padding_top ?? 32}px`,
        paddingBottom: `${s.padding_bottom ?? 32}px`,
        backgroundColor: s.section_bg_color || undefined,
      }}
    >
      <div
        className={`flex flex-col ${isImageRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 md:gap-10 items-center`}
      >
        {/* Image side */}
        <div
          className={`w-full ${aspectClass} relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0`}
          style={{ flexBasis: `${imageWidthPct}%` }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={heading}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-semibold">
              No image selected
            </div>
          )}
        </div>

        {/* Text side */}
        <div
          className="flex flex-col justify-center space-y-4 flex-1"
          style={{ textAlign: s.text_align || 'left' } as React.CSSProperties}
        >
          {section.title && s.show_title !== false && (
            <p className="text-[10px] font-black text-[#e94560] uppercase tracking-[0.2em]">
              {section.title}
            </p>
          )}
          {heading && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight font-heading">
              {heading}
            </h2>
          )}
          {body && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-lg">
              {body}
            </p>
          )}
          {buttonText && buttonLink && (
            <div>
              <Link
                href={buttonLink}
                style={{
                  backgroundColor: s.button_bg || 'var(--btn-primary-bg, var(--color-primary, #1a1a2e))',
                  color: s.button_text_color || 'var(--btn-primary-text, #ffffff)',
                  borderRadius: 'var(--border-radius-btn, 12px)',
                }}
                className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                {buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### B1b — Admin Settings Editor

**CREATE NEW FILE:**
```
components/admin/customizer/sections/ImageWithTextSettings.tsx
```

```tsx
'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import MediaField from '../shared/MediaField';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface ImageWithTextSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string) => void;
}

export default function ImageWithTextSettings({ section, onUpdateSection, onSelectMedia }: ImageWithTextSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setContent = (key: string, value: unknown) =>
    onUpdateSection({ content_data: { ...c, [key]: value } });

  return (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionGroup id={`iwt-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          {/* Image position */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Image Position</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'image_left', label: '← Image Left' },
                { val: 'image_right', label: 'Image Right →' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSetting('layout', opt.val)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (s.layout || 'image_left') === opt.val
                      ? 'bg-[#e94560] text-white border-[#e94560]'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image width */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Image Width</label>
              <span className="text-xs font-bold text-[#e94560]">{s.image_width ?? 50}%</span>
            </div>
            <input
              type="range" min={30} max={70} step={5}
              value={s.image_width ?? 50}
              onChange={(e) => setSetting('image_width', parseInt(e.target.value))}
              className="w-full accent-[#e94560]"
            />
          </div>

          {/* Aspect ratio */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Image Aspect Ratio</label>
            <select
              value={s.aspect_ratio || '4/3'}
              onChange={(e) => setSetting('aspect_ratio', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            >
              <option value="4/3">4:3 Landscape</option>
              <option value="1/1">1:1 Square</option>
              <option value="3/4">3:4 Portrait</option>
              <option value="16/9">16:9 Wide</option>
            </select>
          </div>

          {/* Text align */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Text Alignment</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setSetting('text_align', a)}
                  className={`py-1.5 rounded-xl text-xs font-bold border capitalize cursor-pointer ${
                    (s.text_align || 'left') === a
                      ? 'bg-[#e94560] text-white border-[#e94560]'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionGroup>

      {/* Content */}
      <AccordionGroup id={`iwt-${section.id}-content`} title="Content" defaultOpen>
        <div className="space-y-3 pt-2">
          <MediaField
            label="Section Image"
            value={c.image_url || ''}
            onChange={(val) => setContent('image_url', val)}
            onSelect={() => onSelectMedia('content_data', 'image_url')}
          />
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Heading</label>
            <input
              type="text"
              value={c.heading || ''}
              onChange={(e) => setContent('heading', e.target.value)}
              placeholder="Our Brand Story"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Body Text</label>
            <textarea
              value={c.body || ''}
              onChange={(e) => setContent('body', e.target.value)}
              placeholder="Tell your brand story..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Text (optional)</label>
            <input
              type="text"
              value={c.button_text || ''}
              onChange={(e) => setContent('button_text', e.target.value)}
              placeholder="Learn More"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          {c.button_text && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Link</label>
              <input
                type="text"
                value={c.button_link || ''}
                onChange={(e) => setContent('button_link', e.target.value)}
                placeholder="/shop"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
```

---

## B2 — NEW SECTION: `tabbed_product_grid`

### B2a — Renderer

**CREATE NEW FILE:**
```
components/store/store-front/TabbedProductGridSection.tsx
```

```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { HomepageSection, Product, StoreSettings } from '@/lib/types';
import ProductGrid from '../ProductGrid';

interface Tab {
  id: string;
  label: string;
  source: 'recent' | 'featured' | 'sale' | string; // category ID also valid
}

interface TabbedProductGridSectionProps {
  section: HomepageSection;
  allProducts: Product[];
  activeSettings: StoreSettings;
}

export function TabbedProductGridSection({ section, allProducts, activeSettings }: TabbedProductGridSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const tabs: Tab[] = c.tabs?.length ? c.tabs : [
    { id: 'new', label: 'New Arrivals', source: 'recent' },
    { id: 'best', label: 'Best Sellers', source: 'featured' },
  ];

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || 'new');
  const limitPerTab = Number(s.limit_per_tab) || 8;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const tabProducts = useMemo(() => {
    if (!activeTab) return [];
    let list = [...allProducts];

    if (activeTab.source === 'featured') {
      list = list.filter((p) => p.is_featured);
    } else if (activeTab.source === 'recent') {
      list = list.sort((a, b) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    } else if (activeTab.source === 'sale') {
      list = list.filter((p) => p.compare_price && p.compare_price > (p.price ?? 0));
    } else {
      // treat as category ID
      list = list.filter(
        (p) =>
          p.category_id === activeTab.source ||
          p.product_categories?.some((pc) => pc.category_id === activeTab.source)
      );
    }

    return list.slice(0, limitPerTab);
  }, [allProducts, activeTab, limitPerTab]);

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      style={{
        paddingTop: `${s.padding_top ?? 20}px`,
        paddingBottom: `${s.padding_bottom ?? 20}px`,
        backgroundColor: s.section_bg_color || undefined,
      }}
    >
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
        {section.title && s.show_title !== false && (
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-gray-900 dark:text-white font-heading">
            {section.title}
          </h2>
        )}

        {/* Tab Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeTabId === tab.id
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
              }`}
              style={
                activeTabId === tab.id
                  ? {
                      backgroundColor: 'var(--color-primary, #e94560)',
                    }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {tabProducts.length > 0 ? (
        <ProductGrid
          products={tabProducts}
          currencySymbol={activeSettings.currency_symbol}
          settings={activeSettings}
          columnsDesktop={Number(s.columns_desktop) || 4}
          columnsTablet={Number(s.columns_tablet) || 3}
          columnsMobile={Number(s.columns_mobile) || 2}
        />
      ) : (
        <div className="py-12 text-center text-gray-400 text-sm font-semibold">
          No products in this tab yet.
        </div>
      )}
    </div>
  );
}
```

### B2b — Admin Settings Editor

**CREATE NEW FILE:**
```
components/admin/customizer/sections/TabbedProductGridSettings.tsx
```

```tsx
'use client';

import React from 'react';
import { HomepageSection, Category } from '@/lib/types';
import { Trash2, Plus } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import ResponsiveGridColumnsControl from '../shared/ResponsiveGridColumnsControl';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface Tab {
  id: string;
  label: string;
  source: string;
}

interface TabbedProductGridSettingsProps {
  section: HomepageSection;
  categories: { id: string; name: string; slug: string }[];
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function TabbedProductGridSettings({
  section,
  categories,
  viewportMode = 'desktop',
  onUpdateSection,
}: TabbedProductGridSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const tabs: Tab[] = c.tabs || [];

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setTabs = (next: Tab[]) =>
    onUpdateSection({ content_data: { ...c, tabs: next } });

  const addTab = () =>
    setTabs([...tabs, { id: `tab-${Date.now()}`, label: 'New Tab', source: 'featured' }]);
  const removeTab = (idx: number) => setTabs(tabs.filter((_, i) => i !== idx));
  const updateTab = (idx: number, key: keyof Tab, value: string) => {
    const next = tabs.map((t, i) => (i === idx ? { ...t, [key]: value } : t));
    setTabs(next);
  };

  return (
    <div className="space-y-3">
      {/* Tabs Config */}
      <AccordionGroup id={`tpg-${section.id}-tabs`} title={`Tabs (${tabs.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {tabs.map((tab, idx) => (
            <div key={tab.id} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => updateTab(idx, 'label', e.target.value)}
                  placeholder="Tab label"
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
                <button onClick={() => removeTab(idx)} className="p-1 text-red-400 hover:text-red-500 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <select
                value={tab.source}
                onChange={(e) => updateTab(idx, 'source', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                <option value="featured">⭐ Best Sellers (Featured)</option>
                <option value="recent">🆕 New Arrivals (Recent)</option>
                <option value="sale">🏷️ On Sale</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>📂 {cat.name}</option>
                ))}
              </select>
            </div>
          ))}
          <button
            onClick={addTab}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Tab
          </button>
        </div>
      </AccordionGroup>

      {/* Grid Layout */}
      <AccordionGroup id={`tpg-${section.id}-layout`} title="Grid Layout" defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Products per Tab</label>
              <span className="text-xs font-bold text-[#e94560]">{s.limit_per_tab || 8}</span>
            </div>
            <input
              type="range" min={4} max={24} step={4}
              value={s.limit_per_tab || 8}
              onChange={(e) => setSetting('limit_per_tab', parseInt(e.target.value))}
              className="w-full accent-[#e94560]"
            />
          </div>
          <ResponsiveGridColumnsControl
            label="Columns per Row"
            viewportMode={viewportMode}
            desktopCols={Number(s.columns_desktop) || 4}
            tabletCols={Number(s.columns_tablet) || 3}
            mobileCols={Number(s.columns_mobile) || 2}
            onChangeDesktop={(c) => setSetting('columns_desktop', c)}
            onChangeTablet={(c) => setSetting('columns_tablet', c)}
            onChangeMobile={(c) => setSetting('columns_mobile', c)}
          />
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
```

---

## B3 — NEW SECTION: `circular_categories`

### B3a — Renderer

**CREATE NEW FILE:**
```
components/store/store-front/CircularCategoriesSection.tsx
```

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection } from '@/lib/types';

interface CircularItem {
  title: string;
  link: string;
  imageUrl: string;
}

interface CircularCategoriesSectionProps {
  section: HomepageSection;
}

export function CircularCategoriesSection({ section }: CircularCategoriesSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const items: CircularItem[] = c.items || [];
  const itemSize = Number(s.item_size) || 80;
  const showLabels = s.show_labels !== false;

  if (items.length === 0) return null;

  return (
    <div
      style={{
        paddingTop: `${s.padding_top ?? 16}px`,
        paddingBottom: `${s.padding_bottom ?? 16}px`,
        backgroundColor: s.section_bg_color || undefined,
      }}
    >
      {/* Title */}
      {section.title && s.show_title !== false && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
            {section.title}
          </h2>
        </div>
      )}

      {/* Horizontal Scroll Row */}
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.link || '/shop'}
            className="flex-shrink-0 snap-start flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div
              className="rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-transparent group-hover:border-[color:var(--color-primary,#e94560)] transition-all duration-300 relative flex-shrink-0"
              style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title || 'Category'}
                  fill
                  sizes={`${itemSize}px`}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xl">
                  📂
                </div>
              )}
            </div>
            {showLabels && item.title && (
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 text-center max-w-[80px] leading-tight">
                {item.title}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### B3b — Admin Settings Editor

**CREATE NEW FILE:**
```
components/admin/customizer/sections/CircularCategoriesSettings.tsx
```

```tsx
'use client';

import React from 'react';
import { HomepageSection, Category } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Plus } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import MediaField from '../shared/MediaField';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface CircularItem {
  title: string;
  link: string;
  imageUrl: string;
}

interface CircularCategoriesSettingsProps {
  section: HomepageSection;
  categories: Category[];
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string, isGridItem?: boolean, gridIndex?: number) => void;
}

export default function CircularCategoriesSettings({
  section, categories, onUpdateSection, onSelectMedia,
}: CircularCategoriesSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const items: CircularItem[] = c.items || [];

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setItems = (next: CircularItem[]) =>
    onUpdateSection({ content_data: { ...c, items: next } });

  const addItem = () => setItems([...items, { title: '', link: '/shop', imageUrl: '' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof CircularItem, value: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
    setItems(next);
  };
  const moveItem = (idx: number, dir: 'up' | 'down') =>
    setItems(moveItemInArray(items, idx, dir === 'up' ? idx - 1 : idx + 1));

  const handleBulkFromCategories = () => {
    const newItems = categories
      .filter((cat) => cat.slug !== 'shop')
      .map((cat) => ({
        title: cat.name,
        link: `/shop?category=${cat.slug}`,
        imageUrl: cat.image_url || '',
      }));
    setItems([...items, ...newItems]);
  };

  return (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionGroup id={`cc-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Circle Size</label>
              <span className="text-xs font-bold text-[#e94560]">{s.item_size ?? 80}px</span>
            </div>
            <input
              type="range" min={56} max={120} step={8}
              value={s.item_size ?? 80}
              onChange={(e) => setSetting('item_size', parseInt(e.target.value))}
              className="w-full accent-[#e94560]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Show Labels</span>
              <span className="text-[10px] text-gray-400">Display category name below circle</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={s.show_labels !== false}
                onChange={(e) => setSetting('show_labels', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>
        </div>
      </AccordionGroup>

      {/* Items */}
      <AccordionGroup id={`cc-${section.id}-items`} title={`Categories (${items.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {categories.length > 0 && (
            <button
              onClick={handleBulkFromCategories}
              className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
            >
              + Import All Categories
            </button>
          )}
          {items.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, 'title', e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
                  <button onClick={() => removeItem(idx)} className="p-0.5 text-red-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <input
                type="text"
                value={item.link}
                onChange={(e) => updateItem(idx, 'link', e.target.value)}
                placeholder="/shop?category=kids"
                className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
              <MediaField
                label="Circle Image"
                value={item.imageUrl}
                onChange={(val) => updateItem(idx, 'imageUrl', val)}
                onSelect={() => onSelectMedia('content_data', 'items', true, idx)}
              />
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Circle
          </button>
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
```

---

## B4 — NEW SECTION: `faq_accordion`

### B4a — Renderer

**CREATE NEW FILE:**
```
components/store/store-front/FaqAccordionSection.tsx
```

```tsx
'use client';

import React, { useState } from 'react';
import { HomepageSection } from '@/lib/types';
import { ChevronDown } from '@/components/common/Icons';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionSectionProps {
  section: HomepageSection;
}

export function FaqAccordionSection({ section }: FaqAccordionSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const items: FaqItem[] = c.items || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        paddingTop: `${s.padding_top ?? 32}px`,
        paddingBottom: `${s.padding_bottom ?? 32}px`,
        backgroundColor: s.section_bg_color || undefined,
      }}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {section.title && s.show_title !== false && (
          <h2 className="text-center text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-8">
            {section.title}
          </h2>
        )}

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#16162a] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[52px]"
                >
                  <span className="text-sm font-bold text-gray-900 dark:text-white pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium pt-3">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### B4b — Admin Settings Editor

**CREATE NEW FILE:**
```
components/admin/customizer/sections/FaqAccordionSettings.tsx
```

```tsx
'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Plus } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface FaqItem { q: string; a: string; }

interface FaqAccordionSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function FaqAccordionSettings({ section, onUpdateSection }: FaqAccordionSettingsProps) {
  const c = section.content_data || {};
  const items: FaqItem[] = c.items || [];

  const setItems = (next: FaqItem[]) =>
    onUpdateSection({ content_data: { ...c, items: next } });

  const addItem = () => setItems([...items, { q: 'New Question?', a: 'Answer goes here.' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: 'q' | 'a', val: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: val } : it));
    setItems(next);
  };
  const moveItem = (idx: number, dir: 'up' | 'down') =>
    setItems(moveItemInArray(items, idx, dir === 'up' ? idx - 1 : idx + 1));

  return (
    <div className="space-y-3">
      <AccordionGroup id={`faq-${section.id}-items`} title={`FAQ Items (${items.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeItem(idx)} className="p-0.5 text-red-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Question</label>
                <input
                  type="text"
                  value={item.q}
                  onChange={(e) => updateItem(idx, 'q', e.target.value)}
                  placeholder="Question?"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Answer</label>
                <textarea
                  value={item.a}
                  onChange={(e) => updateItem(idx, 'a', e.target.value)}
                  placeholder="Answer..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add FAQ
          </button>
        </div>
      </AccordionGroup>
      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
```

---

## B5 — NEW SECTION: `rich_text`

### B5a — Renderer

**CREATE NEW FILE:**
```
components/store/store-front/RichTextSection.tsx
```

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { HomepageSection } from '@/lib/types';

interface RichTextSectionProps {
  section: HomepageSection;
}

export function RichTextSection({ section }: RichTextSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const textAlign = s.text_align || 'center';
  const maxWidth = s.max_width === 'wide' ? 'max-w-4xl' : s.max_width === 'full' ? 'max-w-full' : 'max-w-2xl';
  const heading: string = c.heading || '';
  const body: string = c.body || '';
  const buttonText: string = c.button_text || '';
  const buttonLink: string = c.button_link || '/shop';

  return (
    <div
      style={{
        paddingTop: `${s.padding_top ?? 40}px`,
        paddingBottom: `${s.padding_bottom ?? 40}px`,
        backgroundColor: s.section_bg_color || undefined,
      }}
    >
      <div
        className={`mx-auto ${maxWidth} px-4 sm:px-6 lg:px-8`}
        style={{ textAlign } as React.CSSProperties}
      >
        {heading && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4 font-heading">
            {heading}
          </h2>
        )}
        {body && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6 whitespace-pre-line">
            {body}
          </p>
        )}
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            style={{
              backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #1a1a2e))',
              color: 'var(--btn-primary-text, #ffffff)',
              borderRadius: 'var(--border-radius-btn, 12px)',
            }}
            className="inline-block px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}
```

### B5b — Admin Settings Editor

**CREATE NEW FILE:**
```
components/admin/customizer/sections/RichTextSettings.tsx
```

```tsx
'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface RichTextSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function RichTextSettings({ section, onUpdateSection }: RichTextSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setContent = (key: string, value: unknown) =>
    onUpdateSection({ content_data: { ...c, [key]: value } });

  return (
    <div className="space-y-3">
      <AccordionGroup id={`rt-${section.id}-content`} title="Content" defaultOpen>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Heading</label>
            <input
              type="text" value={c.heading || ''}
              onChange={(e) => setContent('heading', e.target.value)}
              placeholder="Section heading"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Body Text</label>
            <textarea
              value={c.body || ''} rows={5}
              onChange={(e) => setContent('body', e.target.value)}
              placeholder="Your message..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Text</label>
              <input type="text" value={c.button_text || ''} onChange={(e) => setContent('button_text', e.target.value)} placeholder="Shop Now"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Link</label>
              <input type="text" value={c.button_link || ''} onChange={(e) => setContent('button_link', e.target.value)} placeholder="/shop"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>
      </AccordionGroup>

      <AccordionGroup id={`rt-${section.id}-layout`} title="Layout" defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Text Alignment</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} type="button" onClick={() => setSetting('text_align', a)}
                  className={`py-1.5 rounded-xl text-xs font-bold border capitalize cursor-pointer ${(s.text_align || 'center') === a ? 'bg-[#e94560] text-white border-[#e94560]' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Content Width</label>
            <select value={s.max_width || 'narrow'} onChange={(e) => setSetting('max_width', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white">
              <option value="narrow">Narrow (max-w-2xl)</option>
              <option value="wide">Wide (max-w-4xl)</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
```

---

# ═══════════════════════════════════════
# WIRING — Connect everything together
# ═══════════════════════════════════════

## W1 — Update `lib/types/settings.ts`

Add new section types to `HomepageSection.section_type` union (line 59):
```ts
section_type: 'hero_banner' | 'product_grid' | 'category_list' | 'promo_banner' | 'trust_badges' | 'recent_reviews' | 'brands_logos' | 'category_grid' | 'collections_grid' | 'social_feed' | 'ticker' | 'flash_sale' | 'value_props' | 'image_with_text' | 'tabbed_product_grid' | 'circular_categories' | 'faq_accordion' | 'rich_text' | string;
```

---

## W2 — Update `components/store/store-front/index.ts`

Add exports for all new renderers:
```ts
export * from './StoreFrontSections';
export * from './FlashSaleSection';
export * from './HeroBannerSection';
export { TrustBadgesSection } from './TrustBadgesSection';
export { RecentReviewsSection } from './RecentReviewsSection';
// ── NEW ──
export { ImageWithTextSection } from './ImageWithTextSection';
export { TabbedProductGridSection } from './TabbedProductGridSection';
export { CircularCategoriesSection } from './CircularCategoriesSection';
export { FaqAccordionSection } from './FaqAccordionSection';
export { RichTextSection } from './RichTextSection';
```

---

## W3 — Update `components/store/StoreFront.tsx` switch statement

**Import new sections at top** (add after existing imports from `./store-front`):
```tsx
import {
  ImageWithTextSection,
  TabbedProductGridSection,
  CircularCategoriesSection,
  FaqAccordionSection,
  RichTextSection,
} from './store-front';
```

**Add to switch statement** (after `case 'flash_sale':` block, before `default:`):
```tsx
case 'image_with_text':
  content = <ImageWithTextSection section={section} />;
  break;

case 'tabbed_product_grid':
  content = (
    <TabbedProductGridSection
      section={section}
      allProducts={allProducts}
      activeSettings={activeSettings}
    />
  );
  break;

case 'circular_categories':
  content = <CircularCategoriesSection section={section} />;
  break;

case 'faq_accordion':
  content = <FaqAccordionSection section={section} />;
  break;

case 'rich_text':
  content = <RichTextSection section={section} />;
  break;
```

---

## W4 — Update `CustomizerRightSidebar.tsx`

**Add imports** at top (after existing section settings imports, line 18):
```tsx
import ImageWithTextSettings from '../customizer/sections/ImageWithTextSettings';
import TabbedProductGridSettings from '../customizer/sections/TabbedProductGridSettings';
import CircularCategoriesSettings from '../customizer/sections/CircularCategoriesSettings';
import FaqAccordionSettings from '../customizer/sections/FaqAccordionSettings';
import RichTextSettings from '../customizer/sections/RichTextSettings';
```

**Add after `flash_sale` block** (after line 263, before closing `</div>` of activeSection branch):
```tsx
{activeSection.section_type === 'image_with_text' && (
  <ImageWithTextSettings
    section={activeSection}
    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
    onSelectMedia={(fieldPath, fieldKey) => {
      setMediaUploadTarget({ sectionId: activeSection.id, fieldPath, fieldKey });
      setIsMediaModalOpen(true);
    }}
  />
)}

{activeSection.section_type === 'tabbed_product_grid' && (
  <TabbedProductGridSettings
    section={activeSection}
    categories={categories}
    viewportMode={viewportMode}
    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
  />
)}

{activeSection.section_type === 'circular_categories' && (
  <CircularCategoriesSettings
    section={activeSection}
    categories={categories}
    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
    onSelectMedia={(fieldPath, fieldKey, isGridItem, gridIndex) => {
      setMediaUploadTarget({ sectionId: activeSection.id, fieldPath, fieldKey, isGridItem, gridIndex });
      setIsMediaModalOpen(true);
    }}
  />
)}

{activeSection.section_type === 'faq_accordion' && (
  <FaqAccordionSettings
    section={activeSection}
    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
  />
)}

{activeSection.section_type === 'rich_text' && (
  <RichTextSettings
    section={activeSection}
    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
  />
)}
```

---

## W5 — Handle media for `brands_logos` and `circular_categories` in `useCustomizerState.ts`

The existing `handleMediaSelected` (line 242–300) already handles `isGridItem + gridIndex` for arrays.

**For `brands_logos`**: The logos array is `content_data.logos` (string[]).
In `handleMediaSelected`, the existing block for `isGridItem && gridIndex !== undefined` handles `content_data.items` arrays but NOT `logos`.

**Find line ~283** (the `isGridItem` block) and add special handling:
```ts
// In handleMediaSelected, after the isGridItem block:
if (fieldKey === 'logos' && isGridItem && gridIndex !== undefined) {
  const existingLogos: string[] = section.content_data?.logos || [];
  const updatedLogos = [...existingLogos];
  updatedLogos[gridIndex] = url;
  setSections(prev => prev.map(s =>
    s.id === sectionId
      ? { ...s, content_data: { ...s.content_data, logos: updatedLogos } }
      : s
  ));
  setIsMediaModalOpen(false);
  setMediaUploadTarget(null);
  return;
}
```

---

# ═══════════════════════════════════════
# VERIFICATION CHECKLIST
# ═══════════════════════════════════════

After all edits, run these commands:
```bash
# In /Users/shoaib/Desktop/zaynahsestore-tv-main:
npx tsc --noEmit        # Must: 0 errors
npm run build           # Must: Compiled successfully, 0 errors
```

**Manual check list:**
- [ ] `SectionSpacingControls` renders in every section editor accordion
- [ ] `BrandsLogosSettings` shows logo previews + media picker works
- [ ] `product_grid` slider mode swipes on mobile viewport in customizer
- [ ] `image_with_text` image appears left/right correctly on desktop
- [ ] `tabbed_product_grid` tabs switch products correctly
- [ ] `circular_categories` scrolls horizontally on mobile
- [ ] `faq_accordion` opens/closes items
- [ ] `rich_text` renders text + button aligned per settings
- [ ] All 5 new sections appear in "Add Layout Section" palette in customizer
- [ ] Dark mode: all new renderers have `dark:` classes on every surface

---

# ═══════════════════════════════════════
# FILE SUMMARY — ALL CHANGES
# ═══════════════════════════════════════

## New files to CREATE (12 files):
```
components/store/store-front/SectionWrapper.tsx           ← shared wrapper
components/admin/customizer/shared/SectionSpacingControls.tsx ← shared spacing UI
components/store/store-front/ImageWithTextSection.tsx
components/admin/customizer/sections/ImageWithTextSettings.tsx
components/store/store-front/TabbedProductGridSection.tsx
components/admin/customizer/sections/TabbedProductGridSettings.tsx
components/store/store-front/CircularCategoriesSection.tsx
components/admin/customizer/sections/CircularCategoriesSettings.tsx
components/store/store-front/FaqAccordionSection.tsx
components/admin/customizer/sections/FaqAccordionSettings.tsx
components/store/store-front/RichTextSection.tsx
components/admin/customizer/sections/RichTextSettings.tsx
```

## Existing files to EDIT (9 files):
```
lib/theme-schema/sections.ts                    ← add 5 new SectionTypes to union + SECTION_REGISTRY
lib/services/sections/homepage-sections.ts      ← add default settings for 5 new types
lib/types/settings.ts                           ← update HomepageSection.section_type union
components/admin/customizer/sections/BrandsLogosSettings.tsx  ← full replacement
components/admin/customizer/sections/ProductGridSettings.tsx  ← add slider mode + SectionSpacingControls
components/store/store-front/index.ts           ← export new renderers
components/store/store-front/StoreFrontSections.tsx ← upgrade BrandsLogosSection render
components/store/StoreFront.tsx                 ← add new cases to switch + imports
components/admin/customizer-editor/CustomizerRightSidebar.tsx ← add new section settings panels + imports
components/admin/customizer-editor/hooks/useCustomizerState.ts ← add logos media handling
```

## Add `SectionSpacingControls` to these editors (8 files — just add import + component):
```
CategoryGridSettings.tsx, CollectionsGridSettings.tsx,
PromoBannerSettings.tsx, RecentReviewsSettings.tsx,
ValuePropsSettings.tsx, HeroBannerSettings.tsx,
FlashSaleSettings.tsx, SocialFeedSettings.tsx
```

**TOTAL: 12 new + 9 edited + 8 spacing additions = 29 file operations**
