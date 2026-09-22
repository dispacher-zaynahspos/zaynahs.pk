'use client';

import React from 'react';
import { SlidersHorizontal, Grid3X3, Grid2X2, List, X } from '@/components/common/Icons';
import { Category } from '@/lib/types';

interface ShopPageControlsProps {
  displayProductsCount: number;
  totalResults: number;
  viewMode: 'grid-3' | 'grid-4' | 'list';
  setViewMode: (mode: 'grid-3' | 'grid-4' | 'list') => void;
  sortBy: string;
  handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onOpenMobileFilter: () => void;
  selectedCategoryId?: string;
  displayCategories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  availability: { onSale: boolean; inStock: boolean; outStock: boolean };
  handleAvailabilityChange: (key: 'onSale' | 'inStock' | 'outStock', checked: boolean) => void;
  priceMin: number;
  priceMax: number;
  priceLimits: { min: number; max: number };
  removePricePill: () => void;
  removeSortPill: () => void;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMaterials: string[];
  setSelectedMaterials: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearFilters: () => void;
  handleCategorySelect: (id: string | undefined) => void;
  hasSortParam: boolean;
  getSortLabel: (val: string) => string;
}

export default function ShopPageControls({
  displayProductsCount,
  totalResults,
  viewMode,
  setViewMode,
  sortBy,
  handleSortChange,
  onOpenMobileFilter,
  selectedCategoryId,
  displayCategories,
  searchQuery,
  setSearchQuery,
  availability,
  handleAvailabilityChange,
  priceMin,
  priceMax,
  priceLimits,
  removePricePill,
  removeSortPill,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  selectedMaterials,
  setSelectedMaterials,
  handleClearFilters,
  handleCategorySelect,
  hasSortParam,
  getSortLabel,
}: ShopPageControlsProps) {
  const showActivePills =
    selectedCategoryId ||
    searchQuery ||
    (hasSortParam && sortBy !== 'manual') ||
    availability.onSale ||
    availability.inStock ||
    availability.outStock ||
    priceMin > priceLimits.min ||
    priceMax < priceLimits.max ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    selectedMaterials.length > 0;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#16162a] p-4 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm transition-colors">

        {/* Filter Toggle (mobile only) & Count */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <button
            onClick={onOpenMobileFilter}
            style={{
              backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
              color: 'var(--btn-primary-text, #ffffff)',
              borderRadius: 'var(--border-radius-btn, 12px)'
            }}
            className="md:hidden flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold transition-all shadow-xs hover:brightness-110 active:scale-95 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter</span>
          </button>

          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Showing {displayProductsCount} of {totalResults} results
          </span>
        </div>

        {/* Layout switchers & Sorting */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid-3')}
              className={`md:hidden p-1.5 rounded-lg transition-all ${viewMode === 'grid-3' ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-sm' : 'text-gray-400 hover:text-gray-650'}`}
              title="3 Columns Grid"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setViewMode('grid-3')}
              className={`hidden md:block p-1.5 rounded-lg transition-all ${viewMode === 'grid-3' ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
              title="3 Columns Layout"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setViewMode('grid-4')}
              className={`hidden md:block p-1.5 rounded-lg transition-all ${viewMode === 'grid-4' ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
              title="4 Columns Layout"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setViewMode('list')}
              style={viewMode === 'list' ? { color: 'var(--color-primary, #C2185B)' } : undefined}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#16162a] shadow-xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
              title="List Layout"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">Sort by:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white shadow-sm"
            >
              <option value="manual">Manual Order</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="alpha_asc">Alphabetically: A-Z</option>
              <option value="alpha_desc">Alphabetically: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Tags Row */}
      {showActivePills && (
        <div className="flex flex-wrap items-center gap-2.5 bg-gray-100/50 dark:bg-gray-900/30 p-3 rounded-xl">
          <span className="text-[10px] font-black text-gray-450 uppercase tracking-wider">Active Filters:</span>

          {hasSortParam && sortBy !== 'manual' && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Sort: {getSortLabel(sortBy)}
              <button onClick={removeSortPill} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedCategoryId && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Category: {displayCategories.find(c => c.id === selectedCategoryId)?.name || 'Shop'}
              <button onClick={() => handleCategorySelect(undefined)} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {availability.onSale && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              On Sale
              <button onClick={() => handleAvailabilityChange('onSale', false)} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {availability.inStock && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              In Stock
              <button onClick={() => handleAvailabilityChange('inStock', false)} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {availability.outStock && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Out of Stock
              <button onClick={() => handleAvailabilityChange('outStock', false)} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {(priceMin > priceLimits.min || priceMax < priceLimits.max) && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Price: Rs {priceMin} - Rs {priceMax}
              <button onClick={removePricePill} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedColors.map(color => (
            <span key={`col-${color}`} className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Color: {color}
              <button onClick={() => setSelectedColors(p => p.filter(c => c !== color))} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          ))}

          {selectedSizes.map(size => (
            <span key={`sz-${size}`} className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Size: {size}
              <button onClick={() => setSelectedSizes(p => p.filter(s => s !== size))} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          ))}

          {selectedMaterials.map(material => (
            <span key={`mat-${material}`} className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2.5 py-1 rounded-full font-bold text-gray-800 dark:text-gray-200">
              Material: {material}
              <button onClick={() => setSelectedMaterials(p => p.filter(m => m !== material))} className="hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
            </span>
          ))}

          <button
            onClick={handleClearFilters}
            style={{ color: 'var(--color-primary, #C2185B)' }}
            className="text-[10px] font-black hover:underline uppercase tracking-wider pl-1.5"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
