'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import {
  ResponsiveArchiveSwatchControl,
  ResponsiveProductDetailSwatchControl,
} from '@/components/admin/customizer/shared/ResponsiveSwatchControls';

export interface VariantSwatchDisplaySectionProps {
  enableVariantSwatches: boolean;
  setEnableVariantSwatches: (val: boolean) => void;
  swatchShape: 'circle' | 'square';
  setSwatchShape: (val: 'circle' | 'square') => void;
  swatchLimit: number;
  setSwatchLimit: (val: number) => void;
  swatchLimitDesktop?: number | null;
  setSwatchLimitDesktop?: (val: number | null) => void;
  swatchLimitTablet?: number | null;
  setSwatchLimitTablet?: (val: number | null) => void;
  swatchLimitMobile?: number | null;
  setSwatchLimitMobile?: (val: number | null) => void;
  archiveSwatchSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  setArchiveSwatchSize: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
  archiveSwatchSizeDesktop?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setArchiveSwatchSizeDesktop?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  archiveSwatchSizeTablet?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setArchiveSwatchSizeTablet?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  archiveSwatchSizeMobile?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setArchiveSwatchSizeMobile?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  archiveSwatchAlign: 'left' | 'center' | 'right';
  setArchiveSwatchAlign: (val: 'left' | 'center' | 'right') => void;
  archiveSwatchAlignDesktop?: 'left' | 'center' | 'right' | null;
  setArchiveSwatchAlignDesktop?: (val: 'left' | 'center' | 'right' | null) => void;
  archiveSwatchAlignTablet?: 'left' | 'center' | 'right' | null;
  setArchiveSwatchAlignTablet?: (val: 'left' | 'center' | 'right' | null) => void;
  archiveSwatchAlignMobile?: 'left' | 'center' | 'right' | null;
  setArchiveSwatchAlignMobile?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  setProductSwatchSize: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
  productSwatchSizeDesktop?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setProductSwatchSizeDesktop?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  productSwatchSizeTablet?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setProductSwatchSizeTablet?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  productSwatchSizeMobile?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
  setProductSwatchSizeMobile?: (val: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null) => void;
  productSwatchAlign?: 'left' | 'center' | 'right';
  setProductSwatchAlign?: (val: 'left' | 'center' | 'right') => void;
  productSwatchAlignDesktop?: 'left' | 'center' | 'right' | null;
  setProductSwatchAlignDesktop?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchAlignTablet?: 'left' | 'center' | 'right' | null;
  setProductSwatchAlignTablet?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchAlignMobile?: 'left' | 'center' | 'right' | null;
  setProductSwatchAlignMobile?: (val: 'left' | 'center' | 'right' | null) => void;
  productSwatchShape?: 'circle' | 'square';
  setProductSwatchShape?: (val: 'circle' | 'square') => void;
  defaultVariantIndex: number;
  setDefaultVariantIndex: (val: number) => void;
  cardShowSwatches: boolean;
  setCardShowSwatches: (val: boolean) => void;
  cardShowSizes: boolean;
  setCardShowSizes: (val: boolean) => void;
  cardShowMaterials: boolean;
  setCardShowMaterials: (val: boolean) => void;
  cardShowCustom: boolean;
  setCardShowCustom: (val: boolean) => void;
  cardShowCustom2: boolean;
  setCardShowCustom2: (val: boolean) => void;
  cardShowTypeColor: boolean;
  setCardShowTypeColor: (val: boolean) => void;
  cardShowTypeSize: boolean;
  setCardShowTypeSize: (val: boolean) => void;
  cardShowTypeMaterial: boolean;
  setCardShowTypeMaterial: (val: boolean) => void;
  cardShowTypeCustom: boolean;
  setCardShowTypeCustom: (val: boolean) => void;
}

export function VariantSwatchDisplaySection(props: VariantSwatchDisplaySectionProps) {
  const {
    enableVariantSwatches,
    setEnableVariantSwatches,
    swatchShape,
    setSwatchShape,
    swatchLimit,
    setSwatchLimit,
    archiveSwatchSize,
    setArchiveSwatchSize,
    archiveSwatchAlign,
    setArchiveSwatchAlign,
    productSwatchSize,
    setProductSwatchSize,
    defaultVariantIndex,
    setDefaultVariantIndex,
    cardShowSwatches,
    setCardShowSwatches,
    cardShowSizes,
    setCardShowSizes,
    cardShowMaterials,
    setCardShowMaterials,
    cardShowCustom,
    setCardShowCustom,
    cardShowCustom2,
    setCardShowCustom2,
    cardShowTypeColor,
    setCardShowTypeColor,
    cardShowTypeSize,
    setCardShowTypeSize,
    cardShowTypeMaterial,
    setCardShowTypeMaterial,
    cardShowTypeCustom,
    setCardShowTypeCustom,
  } = props;

  // Build reactive StoreSettings proxy object
  const pseudoSettings: Partial<StoreSettings> = {
    enable_variant_swatches: enableVariantSwatches,
    swatch_shape: swatchShape,
    swatch_limit: swatchLimit,
    swatch_limit_desktop: props.swatchLimitDesktop ?? swatchLimit,
    swatch_limit_tablet: props.swatchLimitTablet ?? swatchLimit,
    swatch_limit_mobile: props.swatchLimitMobile ?? swatchLimit,
    archive_swatch_size: archiveSwatchSize,
    archive_swatch_size_desktop: props.archiveSwatchSizeDesktop ?? archiveSwatchSize,
    archive_swatch_size_tablet: props.archiveSwatchSizeTablet ?? archiveSwatchSize,
    archive_swatch_size_mobile: props.archiveSwatchSizeMobile ?? archiveSwatchSize,
    archive_swatch_align: archiveSwatchAlign,
    archive_swatch_align_desktop: props.archiveSwatchAlignDesktop ?? archiveSwatchAlign,
    archive_swatch_align_tablet: props.archiveSwatchAlignTablet ?? archiveSwatchAlign,
    archive_swatch_align_mobile: props.archiveSwatchAlignMobile ?? archiveSwatchAlign,
    product_swatch_size: productSwatchSize,
    product_swatch_size_desktop: props.productSwatchSizeDesktop ?? productSwatchSize,
    product_swatch_size_tablet: props.productSwatchSizeTablet ?? productSwatchSize,
    product_swatch_size_mobile: props.productSwatchSizeMobile ?? productSwatchSize,
    product_swatch_align: props.productSwatchAlign ?? 'left',
    product_swatch_align_desktop: props.productSwatchAlignDesktop ?? props.productSwatchAlign ?? 'left',
    product_swatch_align_tablet: props.productSwatchAlignTablet ?? props.productSwatchAlign ?? 'left',
    product_swatch_align_mobile: props.productSwatchAlignMobile ?? props.productSwatchAlign ?? 'left',
    product_swatch_shape: props.productSwatchShape ?? swatchShape,
  };

  const handleUpdateSettings = (updates: Partial<StoreSettings>) => {
    if (updates.enable_variant_swatches !== undefined) setEnableVariantSwatches(updates.enable_variant_swatches);
    if (updates.swatch_shape !== undefined) setSwatchShape(updates.swatch_shape);
    if (updates.swatch_limit !== undefined) setSwatchLimit(updates.swatch_limit);
    if (updates.swatch_limit_desktop !== undefined && props.setSwatchLimitDesktop) props.setSwatchLimitDesktop(updates.swatch_limit_desktop);
    if (updates.swatch_limit_tablet !== undefined && props.setSwatchLimitTablet) props.setSwatchLimitTablet(updates.swatch_limit_tablet);
    if (updates.swatch_limit_mobile !== undefined && props.setSwatchLimitMobile) props.setSwatchLimitMobile(updates.swatch_limit_mobile);
    if (updates.archive_swatch_size !== undefined) setArchiveSwatchSize(updates.archive_swatch_size);
    if (updates.archive_swatch_size_desktop !== undefined && props.setArchiveSwatchSizeDesktop) props.setArchiveSwatchSizeDesktop(updates.archive_swatch_size_desktop);
    if (updates.archive_swatch_size_tablet !== undefined && props.setArchiveSwatchSizeTablet) props.setArchiveSwatchSizeTablet(updates.archive_swatch_size_tablet);
    if (updates.archive_swatch_size_mobile !== undefined && props.setArchiveSwatchSizeMobile) props.setArchiveSwatchSizeMobile(updates.archive_swatch_size_mobile);
    if (updates.archive_swatch_align !== undefined) setArchiveSwatchAlign(updates.archive_swatch_align);
    if (updates.archive_swatch_align_desktop !== undefined && props.setArchiveSwatchAlignDesktop) props.setArchiveSwatchAlignDesktop(updates.archive_swatch_align_desktop);
    if (updates.archive_swatch_align_tablet !== undefined && props.setArchiveSwatchAlignTablet) props.setArchiveSwatchAlignTablet(updates.archive_swatch_align_tablet);
    if (updates.archive_swatch_align_mobile !== undefined && props.setArchiveSwatchAlignMobile) props.setArchiveSwatchAlignMobile(updates.archive_swatch_align_mobile);
    if (updates.product_swatch_size !== undefined) setProductSwatchSize(updates.product_swatch_size);
    if (updates.product_swatch_size_desktop !== undefined && props.setProductSwatchSizeDesktop) props.setProductSwatchSizeDesktop(updates.product_swatch_size_desktop);
    if (updates.product_swatch_size_tablet !== undefined && props.setProductSwatchSizeTablet) props.setProductSwatchSizeTablet(updates.product_swatch_size_tablet);
    if (updates.product_swatch_size_mobile !== undefined && props.setProductSwatchSizeMobile) props.setProductSwatchSizeMobile(updates.product_swatch_size_mobile);
    if (updates.product_swatch_align !== undefined && props.setProductSwatchAlign) props.setProductSwatchAlign(updates.product_swatch_align);
    if (updates.product_swatch_align_desktop !== undefined && props.setProductSwatchAlignDesktop) props.setProductSwatchAlignDesktop(updates.product_swatch_align_desktop);
    if (updates.product_swatch_align_tablet !== undefined && props.setProductSwatchAlignTablet) props.setProductSwatchAlignTablet(updates.product_swatch_align_tablet);
    if (updates.product_swatch_align_mobile !== undefined && props.setProductSwatchAlignMobile) props.setProductSwatchAlignMobile(updates.product_swatch_align_mobile);
    if (updates.product_swatch_shape !== undefined && props.setProductSwatchShape) props.setProductSwatchShape(updates.product_swatch_shape);
  };

  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Variant Swatch Display</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure responsive swatch sizes, limits, alignments, and shapes across Desktop, Tablet, and Mobile
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enableVariantSwatches}
            onChange={(e) => setEnableVariantSwatches(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {enableVariantSwatches && (
        <div className="space-y-8">
          {/* 1. Archive / Catalog Cards Swatches (Shared SSOT Component) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Catalog Cards (Archive) Swatch Settings
            </h4>
            <div className="p-4 rounded-xl border border-gray-150 dark:border-gray-800/80 bg-gray-50/40 dark:bg-white/[0.01]">
              <ResponsiveArchiveSwatchControl
                settings={pseudoSettings as StoreSettings}
                onUpdateSettings={handleUpdateSettings}
                hideHeaderToggle={true}
              />
            </div>
          </div>

          {/* 2. Product Detail Page Swatches (Shared SSOT Component) */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Product Details Page (PDP) Swatch Settings
            </h4>
            <div className="p-4 rounded-xl border border-gray-150 dark:border-gray-800/80 bg-gray-50/40 dark:bg-white/[0.01]">
              <ResponsiveProductDetailSwatchControl
                settings={pseudoSettings as StoreSettings}
                onUpdateSettings={handleUpdateSettings}
              />
            </div>
          </div>

          {/* 3. Catalog Default Variant & Visibility Toggles */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4 min-w-0">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Catalog Display &amp; Variation Visibility
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Default Variant on Catalog
                  </label>
                  <select
                    value={defaultVariantIndex}
                    onChange={(e) => setDefaultVariantIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num === 1 ? '1st Variant (Default)' : num === 2 ? '2nd Variant' : num === 3 ? '3rd Variant' : `${num}th Variant`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Show this variant index&apos;s price and image as initial card view in catalog.
                  </p>
                </div>

                <div className="space-y-3.5 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Catalog Card Variations
                  </h5>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Show Variation 1 Swatches</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cardShowSwatches}
                        onChange={(e) => setCardShowSwatches(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Show Variation 2 Swatches</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cardShowSizes}
                        onChange={(e) => setCardShowSizes(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Show Variation 3 Swatches</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cardShowMaterials}
                        onChange={(e) => setCardShowMaterials(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Show Variation 4 Swatches</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cardShowCustom}
                        onChange={(e) => setCardShowCustom(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Show Variation 5 Swatches</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cardShowCustom2}
                        onChange={(e) => setCardShowCustom2(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Catalog Swatch Type Visibility
                </h5>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable Color Swatches</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cardShowTypeColor}
                      onChange={(e) => setCardShowTypeColor(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable Size Swatches</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cardShowTypeSize}
                      onChange={(e) => setCardShowTypeSize(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable Material Swatches</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cardShowTypeMaterial}
                      onChange={(e) => setCardShowTypeMaterial(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable Custom Option Swatches</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cardShowTypeCustom}
                      onChange={(e) => setCardShowTypeCustom(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
