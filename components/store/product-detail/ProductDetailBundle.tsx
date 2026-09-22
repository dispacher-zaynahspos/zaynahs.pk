'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoreSettings, Product } from '@/lib/types';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { formatPrice } from '@/lib/utils/whatsapp';

interface ProductDetailBundleProps {
  product: Product;
  settings: StoreSettings;
  images: Array<{ url: string }>;
  unitPrice: number;
  bundleProducts: Product[];
  selectedBundleIds: string[];
  setSelectedBundleIds: React.Dispatch<React.SetStateAction<string[]>>;
  bundleVariantSelections: Record<string, string>;
  setBundleVariantSelections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddBundleToCart: () => void;
}

const fallbackPlaceholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E";

export default function ProductDetailBundle({
  product,
  settings,
  images,
  unitPrice,
  bundleProducts,
  selectedBundleIds,
  setSelectedBundleIds,
  bundleVariantSelections,
  setBundleVariantSelections,
  onAddBundleToCart,
}: ProductDetailBundleProps) {
  if (bundleProducts.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Frequently Bought Together</h4>
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
        {/* Current Product Mini-card */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-2 rounded-xl w-full sm:w-auto sm:flex-1 min-w-[220px] border border-gray-100 dark:border-gray-800/80">
          <div className={`relative w-12 rounded-lg overflow-hidden bg-gray-100 ${getSharedAspectClass(settings?.imageAspectRatio)}`}>
            <Image
              src={getPresetImageUrl(images[0]?.url || fallbackPlaceholder, 'micro')}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-850 dark:text-white truncate">{product.name}</p>
            <p className="text-xs text-gray-500 font-semibold">{formatPrice(unitPrice, settings.currencySymbol)}</p>
          </div>
        </div>

        {bundleProducts.map((bp) => {
          const isChecked = selectedBundleIds.includes(bp.id);
          const bpActiveVariants = bp.hasVariants ? bp.variants.filter(v => v.active) : [];
          const bpHasVariants = bpActiveVariants.length > 0;
          const bpSelectedVarId = bundleVariantSelections[bp.id];
          const bpSelectedVar = bpActiveVariants.find(v => v.id === bpSelectedVarId) ?? bpActiveVariants[0];
          const bpPrice = bpSelectedVar?.price ?? bp.price;

          const bpColors = Array.from(new Set(bpActiveVariants.map(v => v.color).filter(Boolean))) as string[];
          const bpSizes = Array.from(new Set(bpActiveVariants.map(v => v.size).filter(Boolean))) as string[];
          const bpMaterials = Array.from(new Set(bpActiveVariants.map(v => v.material).filter(Boolean))) as string[];
          const bpCustomOpt = bpActiveVariants[0]?.customOption;
          const bpCustomVals = Array.from(new Set(bpActiveVariants.map(v => v.customValue).filter(Boolean))) as string[];

          const selectBpVariant = (color?: string, size?: string, material?: string, customValue?: string) => {
            const match = bpActiveVariants.find(v =>
              (!bpColors.length || v.color === (color ?? bpSelectedVar?.color)) &&
              (!bpSizes.length || v.size === (size ?? bpSelectedVar?.size)) &&
              (!bpMaterials.length || v.material === (material ?? bpSelectedVar?.material)) &&
              (!bpCustomVals.length || v.customValue === (customValue ?? bpSelectedVar?.customValue))
            ) ?? bpActiveVariants.find(v =>
              (color ? v.color === color : true) ||
              (size ? v.size === size : true) ||
              (material ? v.material === material : true) ||
              (customValue ? v.customValue === customValue : true)
            );
            if (match) setBundleVariantSelections(prev => ({ ...prev, [bp.id]: match.id }));
          };

          return (
            <React.Fragment key={bp.id}>
              <span className="text-gray-400 font-bold text-lg">+</span>
              <div
                className={`flex flex-col gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-xl w-full sm:w-auto sm:flex-1 min-w-[220px] border cursor-pointer transition-all ${isChecked ? 'border-amber-500' : 'border-gray-100 dark:border-gray-850'}`}
              >
                {/* Product info row */}
                <div
                  onClick={() => setSelectedBundleIds(prev => prev.includes(bp.id) ? prev.filter(id => id !== bp.id) : [...prev, bp.id])}
                  className="flex items-center gap-3"
                >
                  <div className={`relative w-12 rounded-lg overflow-hidden bg-gray-105 flex-shrink-0 ${getSharedAspectClass(settings?.imageAspectRatio)}`}>
                    {bp.images?.[0]?.url && (
                      <Image
                        src={bp.images?.[0]?.url}
                        alt={bp.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-850 dark:text-white truncate flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 flex items-center justify-center rounded border text-[8px] flex-shrink-0 ${isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 bg-white dark:bg-transparent'}`}>
                        {isChecked && '✓'}
                      </span>
                      {bp.name}
                    </p>
                    <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
                      <p className="text-xs text-gray-500 font-semibold">{formatPrice(bpPrice, settings.currencySymbol)}</p>
                      <Link
                        href={`/product/${bp.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-bold text-[#e94560] hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                      >
                        View Details ↗
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Inline variant selectors */}
                {bpHasVariants && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2 space-y-1.5">
                    {bpColors.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Color</p>
                        <div className="flex flex-wrap gap-1">
                          {bpColors.map(color => {
                            const matchV = bpActiveVariants.find(v => v.color === color);
                            const isActive = bpSelectedVar?.color === color;
                            const bg = matchV?.colorHex;
                            return bg ? (
                              <button
                                key={color}
                                type="button"
                                title={color}
                                onClick={(e) => { e.stopPropagation(); selectBpVariant(color); }}
                                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer overflow-hidden flex-shrink-0 ${isActive ? 'border-amber-500 scale-110 shadow' : 'border-white dark:border-gray-700 hover:scale-105'}`}
                                style={getSwatchStyle(bg)}
                              >
                                {matchV?.imageUrl && (matchV.showImageSwatch || !bg) && (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={getPresetImageUrl(matchV.imageUrl, 'micro')} alt={color} className="w-full h-full object-cover" />
                                )}
                              </button>
                            ) : (
                              <button
                                key={color}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); selectBpVariant(color); }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                              >{color}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {bpSizes.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Size</p>
                        <div className="flex flex-wrap gap-1">
                          {bpSizes.map(size => {
                            const isActive = bpSelectedVar?.size === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); selectBpVariant(undefined, size); }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                              >{size}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {bpMaterials.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">Material</p>
                        <div className="flex flex-wrap gap-1">
                          {bpMaterials.map(mat => {
                            const isActive = bpSelectedVar?.material === mat;
                            return (
                              <button
                                key={mat}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); selectBpVariant(undefined, undefined, mat); }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                              >{mat}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {bpCustomOpt && bpCustomVals.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">{bpCustomOpt}</p>
                        <div className="flex flex-wrap gap-1">
                          {bpCustomVals.map(val => {
                            const isActive = bpSelectedVar?.customValue === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); selectBpVariant(undefined, undefined, undefined, val); }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                              >{val}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Total bundle price and action button */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs text-gray-500 font-semibold">Total Price (Bundle):</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">
            {formatPrice(
              unitPrice + bundleProducts.reduce((sum, bp) => sum + (selectedBundleIds.includes(bp.id) ? bp.price : 0), 0),
              settings.currencySymbol
            )}
          </p>
        </div>
        <button
          onClick={onAddBundleToCart}
          className="w-full sm:w-auto px-5 py-3 bg-[#e94560] hover:bg-[#d43852] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Add All to Cart
        </button>
      </div>
    </div>
  );
}
