'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from '@/components/common/Icons';
import { Category, Product, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { SidebarVariantFilters } from './sidebar/SidebarVariantFilters';

interface ShopPageSidebarProps {
  allProductsCount: number;
  displayCategories: Category[];
  selectedCategoryId?: string;
  handleCategorySelect: (id: string | undefined) => void;
  categoryCounts: Record<string, number>;
  availability: { onSale: boolean; inStock: boolean; outStock: boolean };
  handleAvailabilityChange: (key: 'onSale' | 'inStock' | 'outStock', checked: boolean) => void;
  priceMin: number;
  priceMax: number;
  setPriceMin: (v: number) => void;
  setPriceMax: (v: number) => void;
  priceLimits: { min: number; max: number };
  priceDirtyRef: React.MutableRefObject<boolean>;
  sliderRef: React.RefObject<HTMLInputElement | null>;
  usedVariants: {
    colors: string[];
    sizes: string[];
    materials: string[];
    colorToHex: Record<string, string>;
  };
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMaterials: string[];
  setSelectedMaterials: React.Dispatch<React.SetStateAction<string[]>>;
  showAllColors: boolean;
  setShowAllColors: (v: boolean) => void;
  showAllSizes: boolean;
  setShowAllSizes: (v: boolean) => void;
  showAllMaterials: boolean;
  setShowAllMaterials: (v: boolean) => void;
  featuredProducts: Product[];
  settings: StoreSettings;
}

export default function ShopPageSidebar({
  allProductsCount,
  displayCategories,
  selectedCategoryId,
  handleCategorySelect,
  categoryCounts,
  availability,
  handleAvailabilityChange,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  priceLimits,
  priceDirtyRef,
  sliderRef,
  usedVariants,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  selectedMaterials,
  setSelectedMaterials,
  showAllColors,
  setShowAllColors,
  showAllSizes,
  setShowAllSizes,
  showAllMaterials,
  setShowAllMaterials,
  featuredProducts,
  settings,
}: ShopPageSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Category List Accordion */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Products Category</span>
        <div className="space-y-1.5 md:max-h-60 md:overflow-y-auto pr-1">
          <button
            onClick={() => handleCategorySelect(undefined)}
            style={selectedCategoryId === undefined ? { backgroundColor: 'var(--color-primary, #C2185B)' } : undefined}
            className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${selectedCategoryId === undefined
              ? 'text-white shadow-xs'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <span>Shop</span>
            <span className={selectedCategoryId === undefined ? 'text-white/80' : 'text-gray-400'}>
              ({allProductsCount})
            </span>
          </button>

          {displayCategories.map((category) => {
            const count = categoryCounts[category.id] || 0;
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                style={isSelected ? { backgroundColor: 'var(--color-primary, #C2185B)' } : undefined}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${isSelected
                  ? 'text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="truncate pr-2">{category.name}</span>
                <span className={isSelected ? 'text-white/80' : 'text-gray-400'}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Availability check boxes */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Availability</span>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={availability.onSale}
              onChange={(e) => handleAvailabilityChange('onSale', e.target.checked)}
              style={{ accentColor: 'var(--color-primary, #C2185B)' }}
              className="rounded border-gray-300 dark:border-gray-700 h-4 w-4"
            />
            <span>On sale</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={availability.inStock}
              onChange={(e) => handleAvailabilityChange('inStock', e.target.checked)}
              style={{ accentColor: 'var(--color-primary, #C2185B)' }}
              className="rounded border-gray-300 dark:border-gray-700 h-4 w-4"
            />
            <span>In stock</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={availability.outStock}
              onChange={(e) => handleAvailabilityChange('outStock', e.target.checked)}
              style={{ accentColor: 'var(--color-primary, #C2185B)' }}
              className="rounded border-gray-300 dark:border-gray-700 h-4 w-4"
            />
            <span>Out of stock</span>
          </label>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Price filter double range & inputs */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Price Range</span>

        {/* Min/Max Text inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Min Price</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Rs</span>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => {
                  priceDirtyRef.current = true;
                  const val = Number(e.target.value);
                  setPriceMin(val >= 0 ? val : 0);
                }}
                className="w-full pl-7 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Max Price</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Rs</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => {
                  priceDirtyRef.current = true;
                  const val = Number(e.target.value);
                  setPriceMax(val >= 0 ? val : 0);
                }}
                className="w-full pl-7 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Double Range Slider UI */}
        <div className="pt-3 px-1">
          <input
            ref={sliderRef}
            type="range"
            min={priceLimits.min}
            max={priceLimits.max}
            value={priceMax}
            onChange={(e) => {
              priceDirtyRef.current = true;
              const val = Number(e.target.value);
              if (val >= priceMin) {
                setPriceMax(val);
              }
            }}
            style={{ accentColor: 'var(--color-primary, #C2185B)' }}
            className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-pointer appearance-none"
          />
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-1.5 uppercase">
            <span>Price: {formatPrice(priceMin, settings.currencySymbol)} — {formatPrice(priceMax, settings.currencySymbol)}</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Variant Filters (Colors, Sizes, Materials) */}
      <SidebarVariantFilters
        usedVariants={usedVariants}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        selectedMaterials={selectedMaterials}
        setSelectedMaterials={setSelectedMaterials}
        showAllColors={showAllColors}
        setShowAllColors={setShowAllColors}
        showAllSizes={showAllSizes}
        setShowAllSizes={setShowAllSizes}
        showAllMaterials={showAllMaterials}
        setShowAllMaterials={setShowAllMaterials}
      />

      {/* Featured Products visual mini sidebar items */}
      {featuredProducts.length > 0 && (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Featured Products</span>
          <div className="space-y-3.5">
            {featuredProducts.map((p) => {
              const img = p.images?.find(img => img.isPrimary)?.url || p.images?.[0]?.url;
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="flex gap-3 group relative cursor-pointer"
                >
                  <div className={`relative w-14 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 shrink-0 ${getSharedAspectClass(settings?.imageAspectRatio)}`}>
                    {img ? (
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h5 className="text-xs font-bold text-gray-800 dark:text-white truncate group-hover:text-[var(--color-primary,#C2185B)] transition-colors">{p.name}</h5>

                    <div className="flex items-center gap-0.5 text-[10px] text-amber-400 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-2.5 w-2.5 ${i < Math.round(p.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <div className="mt-1 text-xs font-black text-gray-900 dark:text-white">
                      {formatPrice(p.price, settings.currencySymbol)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
