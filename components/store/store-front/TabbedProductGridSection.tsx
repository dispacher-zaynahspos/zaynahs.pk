'use client';

import React, { useState, useMemo } from 'react';
import { HomepageSection, Product, StoreSettings } from '@/lib/types';
import ProductGrid from '../ProductGrid';
import { SectionWrapper } from './SectionWrapper';
import { useCatalogColumns } from '@/lib/hooks/useCatalogColumns';

interface Tab {
  id: string;
  label: string;
  source: 'recent' | 'featured' | 'sale' | string;
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

  // Fill-rows + per-layout auto/manual limit (RULE DS24). Columns-aware.
  const fillRowsEnabled = s.fill_rows !== false;
  const { columns, width } = useCatalogColumns({
    mode: s.columns_mode || 'manual',
    mobile: Number(s.columns_mobile) || 2,
    tablet: Number(s.columns_tablet) || 3,
    desktop: Number(s.columns_desktop) || 4,
    wide: s.columns_wide,
    minDesktop: s.min_card_desktop,
  });

  const deviceBatchLimit = useMemo(() => {
    const fallback = Number(s.limit_per_tab) || 8;
    if (width < 640 && s.products_per_page_mobile) {
      return Number(s.products_per_page_mobile);
    }
    if (width >= 640 && width < 1024 && s.products_per_page_tablet) {
      return Number(s.products_per_page_tablet);
    }
    if (width >= 1024 && s.products_per_page_desktop) {
      return Number(s.products_per_page_desktop);
    }
    return fallback;
  }, [width, s]);

  const batchStep = useMemo(() => {
    let target = deviceBatchLimit;
    if (s.limit_mode === 'auto') {
      const rows = Math.min(6, Math.max(1, Math.floor(Number(s.limit_rows) || 2)));
      target = Math.max(1, columns * rows);
    }
    if (fillRowsEnabled && columns > 1) {
      return Math.ceil(target / columns) * columns;
    }
    return Math.max(1, target);
  }, [columns, deviceBatchLimit, s, fillRowsEnabled]);

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
      list = list.filter(
        (p) =>
          p.category_id === activeTab.source ||
          p.product_categories?.some((pc) => pc.category_id === activeTab.source)
      );
    }

    return list.slice(0, batchStep);
  }, [allProducts, activeTab, batchStep]);

  return (
    <SectionWrapper section={section}>
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
          columnsMode={s.columns_mode || 'manual'}
          columnsDesktop={Number(s.columns_desktop) || 4}
          columnsTablet={Number(s.columns_tablet) || 3}
          columnsMobile={Number(s.columns_mobile) || 2}
          columnsWide={s.columns_wide ? Number(s.columns_wide) : undefined}
          minCardDesktop={s.min_card_desktop ? Number(s.min_card_desktop) : undefined}
          gridGap={s.grid_gap || 'normal'}
        />
      ) : (
        <div className="py-12 text-center text-gray-400 text-sm font-semibold">
          No products in this tab yet.
        </div>
      )}
    </SectionWrapper>
  );
}

export default TabbedProductGridSection;
