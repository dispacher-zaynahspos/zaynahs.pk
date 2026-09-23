'use client';

import React from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp, Search } from '@/components/common/Icons';
import { ProductVariant, VariantPreset } from '@/lib/types';
import { VariantBulkBar } from './VariantBulkBar';
import { VariantTableRow } from './VariantTableRow';
import { VariantAxisCard, VariantAxis, AxisValue } from './VariantAxisCard';

export type { AxisValue, VariantAxis };

export interface ProductFormVariantsSectionProps {
  hasVariants: boolean;
  setHasVariants: (val: boolean) => void;
  variantsSectionCollapsed: boolean;
  setVariantsSectionCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  enableSwatches: boolean;
  setEnableSwatches: (val: boolean) => void;
  showSwatchesOnArchive: boolean;
  setShowSwatchesOnArchive: (val: boolean) => void;
  variantAxes: VariantAxis[];
  setVariantAxes: React.Dispatch<React.SetStateAction<VariantAxis[]>>;
  collapsedAxes: boolean[];
  setCollapsedAxes: React.Dispatch<React.SetStateAction<boolean[]>>;
  axisInputs: string[];
  setAxisInputs: React.Dispatch<React.SetStateAction<string[]>>;
  presets: VariantPreset[];
  axisOrderChanged: boolean;
  setAxisOrderChanged: (val: boolean) => void;
  variants: Omit<ProductVariant, 'id' | 'productId'>[];
  setVariants: React.Dispatch<React.SetStateAction<Omit<ProductVariant, 'id' | 'productId'>[]>>;
  selectedVariantIndices: number[];
  setSelectedVariantIndices: React.Dispatch<React.SetStateAction<number[]>>;
  variantSearchTerm: string;
  setVariantSearchTerm: (val: string) => void;
  filteredVariants: Omit<ProductVariant, 'id' | 'productId'>[];
  price: string;
  comparePrice: string;
  images: any[];
  activeImageSelector: { axisIdx: number; valIdx: number } | null;
  setActiveImageSelector: React.Dispatch<React.SetStateAction<{ axisIdx: number; valIdx: number } | null>>;
  handleMoveAxisUp: (idx: number) => void;
  handleMoveAxisDown: (idx: number) => void;
  handleReorderAxisValues: (axisIdx: number, reorderedValues: AxisValue[]) => void;
  handleGenerateVariants: () => void;
  handleUpdateVariant: (index: number, updates: Partial<Omit<ProductVariant, 'id' | 'productId'>>) => void;
  handleRemoveVariant: (index: number) => void;
  handleBulkDelete: () => void;
  handleBulkUpdatePrice: (price: number) => void;
  handleBulkUpdateComparePrice: (comparePrice: number) => void;
  handleBulkUpdateStock: (stock: number) => void;
  handleBulkUpdateSku: (skuPrefix: string) => void;
  handleBulkUpdateThreshold: (threshold: number) => void;
  handleBulkUpdateActive: (active: boolean) => void;
  confirm: (opts: any) => Promise<boolean>;
}

export const ProductFormVariantsSection: React.FC<ProductFormVariantsSectionProps> = (props) => {
  const {
    hasVariants,
    setHasVariants,
    variantsSectionCollapsed,
    setVariantsSectionCollapsed,
    enableSwatches,
    setEnableSwatches,
    showSwatchesOnArchive,
    setShowSwatchesOnArchive,
    variantAxes,
    setVariantAxes,
    collapsedAxes,
    setCollapsedAxes,
    axisInputs,
    setAxisInputs,
    presets,
    axisOrderChanged,
    variants,
    setVariants,
    selectedVariantIndices,
    setSelectedVariantIndices,
    variantSearchTerm,
    setVariantSearchTerm,
    filteredVariants,
    price,
    comparePrice,
    images,
    activeImageSelector,
    setActiveImageSelector,
    handleMoveAxisUp,
    handleMoveAxisDown,
    handleReorderAxisValues,
    handleGenerateVariants,
    handleUpdateVariant,
    handleRemoveVariant,
    handleBulkDelete,
    handleBulkUpdatePrice,
    handleBulkUpdateComparePrice,
    handleBulkUpdateStock,
    handleBulkUpdateSku,
    handleBulkUpdateThreshold,
    handleBulkUpdateActive,
    confirm,
  } = props;

  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3.5 text-gray-900 dark:text-white transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVariantsSectionCollapsed(prev => !prev)}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-[#e94560] dark:hover:text-[#e94560] transition-all cursor-pointer bg-gray-100 dark:bg-[#1a1a30] px-3 py-1.5 rounded-lg"
          >
            {variantsSectionCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
            {variantsSectionCollapsed ? 'Expand All' : 'Collapse All'}
          </button>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Product Variants</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {hasVariants && !variantsSectionCollapsed && (
        <div className="space-y-5 pt-1">
          <div className="flex items-center justify-between p-3 sm:p-3.5 bg-gray-50/70 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs">
            <div className="flex flex-col pr-2">
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Enable Visual Swatches</span>
              <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 mt-0.5">Show color circles and images instead of text button tags on storefront</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableSwatches}
                onChange={(e) => setEnableSwatches(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-3.5 bg-gray-50/70 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs">
            <div className="flex flex-col pr-2">
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Show Swatches on Catalog Cards</span>
              <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 mt-0.5">Show variant color circles under product image on archive/catalog page</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={showSwatchesOnArchive}
                onChange={(e) => setShowSwatchesOnArchive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {/* Attribute Axes */}
          {variantAxes.map((axis, axisIdx) => (
            <VariantAxisCard
              key={axisIdx}
              axis={axis}
              axisIdx={axisIdx}
              variantAxes={variantAxes}
              setVariantAxes={setVariantAxes}
              collapsedAxes={collapsedAxes}
              setCollapsedAxes={setCollapsedAxes}
              axisInputs={axisInputs}
              setAxisInputs={setAxisInputs}
              presets={presets}
              axisOrderChanged={axisOrderChanged}
              setVariants={setVariants}
              images={images}
              activeImageSelector={activeImageSelector}
              setActiveImageSelector={setActiveImageSelector}
              handleMoveAxisUp={handleMoveAxisUp}
              handleMoveAxisDown={handleMoveAxisDown}
              handleReorderAxisValues={handleReorderAxisValues}
            />
          ))}

          {/* Add another attribute axis */}
          <button
            type="button"
            onClick={() => {
              setVariantAxes(prev => [...prev, { name: '', type: 'size', values: [] }]);
              setAxisInputs(prev => [...prev, '']);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#e94560] hover:underline cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Another Attribute (e.g. Material)
          </button>

          {/* Generate + Clear buttons */}
          {(() => {
            const validAxes = variantAxes.filter(a => a.values && a.values.length > 0);
            const possibleCount = validAxes.length > 0
              ? validAxes.reduce((acc, a) => acc * a.values.length, 1)
              : 0;

            return (
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleGenerateVariants}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a2e] hover:bg-[#e94560] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {variants.length > 0 ? 'Regenerate Combinations' : 'Generate All Combinations'}
                </button>
                {possibleCount > 0 && variants.length === 0 && (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/50">
                    ⚡ {possibleCount} combinations ready (will auto-generate on Save)
                  </span>
                )}
                {variants.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Clear Variants',
                        message: 'Clear all variants?',
                        variant: 'danger',
                        confirmText: 'Clear All'
                      });
                      if (confirmed) { setVariants([]); setSelectedVariantIndices([]); }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-bold cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All
                  </button>
                )}
                {variantAxes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const allCollapsed = collapsedAxes.every(Boolean);
                      setCollapsedAxes(Array(variantAxes.length).fill(!allCollapsed));
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {collapsedAxes.every(Boolean) ? (
                      <span className="flex items-center gap-1"><ChevronDown className="h-3.5 w-3.5" /> Expand All</span>
                    ) : (
                      <span className="flex items-center gap-1"><ChevronUp className="h-3.5 w-3.5" /> Collapse All</span>
                    )}
                  </button>
                )}
                <span className="text-xs text-gray-400 font-semibold ml-auto">
                  {variants.length} variant{variants.length !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })()}

          {/* Variant Search */}
          {variants.length > 0 && (
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search variants by name, SKU, color, or price..."
                  value={variantSearchTerm}
                  onChange={(e) => setVariantSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] text-sm focus:outline-none focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Bulk Action Bar */}
          <VariantBulkBar
            selectedVariantIndices={selectedVariantIndices}
            setSelectedVariantIndices={setSelectedVariantIndices}
            handleBulkDelete={handleBulkDelete}
            handleBulkUpdatePrice={handleBulkUpdatePrice}
            handleBulkUpdateComparePrice={handleBulkUpdateComparePrice}
            handleBulkUpdateStock={handleBulkUpdateStock}
            handleBulkUpdateSku={handleBulkUpdateSku}
            handleBulkUpdateThreshold={handleBulkUpdateThreshold}
            handleBulkUpdateActive={handleBulkUpdateActive}
          />

          {/* Variants Table - desktop */}
          {variants.length > 0 && (
            <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#1a1a30] border-b border-gray-200 dark:border-gray-800 font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    <th className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={filteredVariants.length > 0 && filteredVariants.every(v => selectedVariantIndices.includes(variants.indexOf(v)))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newIndices = filteredVariants.map(v => variants.indexOf(v));
                            setSelectedVariantIndices(prev => [...new Set([...prev, ...newIndices])]);
                          } else {
                            const filteredIdxSet = new Set(filteredVariants.map(v => variants.indexOf(v)));
                            setSelectedVariantIndices(prev => prev.filter(i => !filteredIdxSet.has(i)));
                          }
                        }}
                        className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-[21%]">Variant</th>
                    <th className="py-3 px-3 w-[10%]">Color</th>
                    <th className="py-3 px-3 w-[11%]">Price</th>
                    <th className="py-3 px-3 w-[11%]">Compare</th>
                    <th className="py-3 px-3 w-[10%]">Stock *</th>
                    <th className="py-3 px-3 w-[13%]">Threshold</th>
                    <th className="py-3 px-3 w-[16%]">SKU</th>
                    <th className="py-3 px-3 w-[10%] text-center">Active</th>
                    <th className="py-3 px-3 w-[5%] text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
                  {filteredVariants.map((variant) => {
                    const idx = variants.indexOf(variant);
                    const isSelected = selectedVariantIndices.includes(idx);
                    return (
                      <VariantTableRow
                        key={idx}
                        variant={variant}
                        idx={idx}
                        isSelected={isSelected}
                        price={price}
                        comparePrice={comparePrice}
                        onToggleSelect={(i, checked) => {
                          if (checked) setSelectedVariantIndices(prev => [...prev, i]);
                          else setSelectedVariantIndices(prev => prev.filter(x => x !== i));
                        }}
                        handleUpdateVariant={handleUpdateVariant}
                        handleRemoveVariant={handleRemoveVariant}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
