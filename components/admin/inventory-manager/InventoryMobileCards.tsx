'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Loader2 } from '@/components/common/Icons';
import { Product } from '@/lib/types';
import TableThumbnail from '@/components/admin/TableThumbnail';
import { renderProductStatus } from './inventoryUtils';
import { InventoryMobileVariantCard } from './InventoryMobileVariantCard';
import { toast } from 'sonner';

interface InventoryMobileCardsProps {
  paginatedProducts: Product[];
  expandedProducts: Record<string, boolean>;
  toggleExpand: (productId: string) => void;
  selectedVariantIds: string[];
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<string[]>>;
  updatingIds: Record<string, boolean>;
  handleUpdateProductStock: (productId: string, newStock: number) => Promise<void>;
  handleUpdateProductThreshold: (productId: string, newThreshold: number) => Promise<void>;
  handleUpdateVariantStock: (productId: string, variantId: string, newStock: number) => Promise<void>;
  handleUpdateVariantThreshold: (productId: string, variantId: string, newThreshold: number) => Promise<void>;
  handleBulkUpdateVariantStock: (productId: string, variantIds: string[], newStock: number) => Promise<void>;
  handleBulkUpdateVariantThreshold: (productId: string, variantIds: string[], newThreshold: number) => Promise<void>;
  setPreviewImageUrl: (url: string | null) => void;
}

export function InventoryMobileCards({
  paginatedProducts,
  expandedProducts,
  toggleExpand,
  selectedVariantIds,
  setSelectedVariantIds,
  updatingIds,
  handleUpdateProductStock,
  handleUpdateProductThreshold,
  handleUpdateVariantStock,
  handleUpdateVariantThreshold,
  handleBulkUpdateVariantStock,
  handleBulkUpdateVariantThreshold,
  setPreviewImageUrl,
}: InventoryMobileCardsProps) {
  return (
    <div className="md:hidden space-y-4">
      {paginatedProducts.map(product => {
        const isExpanded = expandedProducts[product.id] ?? false;
        const threshold = product.inventoryThreshold !== undefined && product.inventoryThreshold !== null ? product.inventoryThreshold : 5;
        
        return (
          <div 
            key={product.id}
            className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-gray-900 dark:text-white transition-colors"
          >
            {/* Product Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TableThumbnail 
                  url={product.images?.[0]?.url || null} 
                  alt={product.name} 
                  onPreview={setPreviewImageUrl} 
                  className="h-12 w-12"
                />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{product.name}</div>
                  {product.productCategories && product.productCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.productCategories.map((pc) => pc.category ? (
                        <span key={pc.categoryId} className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {pc.category.name}
                        </span>
                      ) : null)}
                    </div>
                  ) : product.category ? (
                    <div className="text-[10px] text-gray-400 uppercase mt-0.5 font-bold">
                      {product.category.name}
                    </div>
                  ) : null}
                  {product.sku && (
                    <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                      SKU: {product.sku}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {renderProductStatus(product)}
              </div>
            </div>

            {/* Stock Editors / Variant Toggle */}
            {product.hasVariants ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0f0f1b] p-3 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Total Stock: <span className="text-gray-900 dark:text-white font-black">{product.stock}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExpand(product.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1d1d36] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252542] transition-all min-h-[36px]"
                  >
                    <span>{isExpanded ? 'Hide Variants' : 'Show Variants'}</span>
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between py-1 border-b border-gray-150 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.variants.length > 0 && product.variants.every(v => selectedVariantIds.includes(v.id))}
                          onChange={(e) => {
                            const vIds = product.variants.map(v => v.id);
                            if (e.target.checked) {
                              setSelectedVariantIds(prev => [...new Set([...prev, ...vIds])]);
                            } else {
                              setSelectedVariantIds(prev => prev.filter(id => !vIds.includes(id)));
                            }
                          }}
                          className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                          id={`select-all-variants-mobile-${product.id}`}
                        />
                        <label htmlFor={`select-all-variants-mobile-${product.id}`} className="text-xs font-bold text-gray-700 dark:text-gray-200 select-none cursor-pointer">
                          Select All Variants
                        </label>
                      </div>
                    </div>

                    {product.variants.some(v => selectedVariantIds.includes(v.id)) && (
                      <div className="bg-gray-100/80 dark:bg-[#1c1c36] p-3 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                          <span>{product.variants.filter(v => selectedVariantIds.includes(v.id)).length} variant(s) selected</span>
                          <button
                            type="button"
                            onClick={() => {
                              const vIds = product.variants.map(v => v.id);
                              setSelectedVariantIds(prev => prev.filter(id => !vIds.includes(id)));
                            }}
                            className="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-255 font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Set Stock"
                              id={`bulk-stock-input-mobile-${product.id}`}
                              className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:border-primary text-gray-900 dark:text-white min-h-[40px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`bulk-stock-input-mobile-${product.id}`) as HTMLInputElement;
                                const val = parseInt(input?.value, 10);
                                if (!isNaN(val)) {
                                  const vIds = product.variants.filter(v => selectedVariantIds.includes(v.id)).map(v => v.id);
                                  handleBulkUpdateVariantStock(product.id, vIds, val);
                                  if (input) input.value = '';
                                } else {
                                  toast.error('Please enter a valid stock number');
                                }
                              }}
                              className="px-3 py-2 bg-[#e94560] hover:bg-[#e94560]/95 text-white rounded-xl text-xs font-bold min-h-[40px]"
                            >
                              Apply
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Set Threshold"
                              id={`bulk-threshold-input-mobile-${product.id}`}
                              className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:border-primary text-gray-900 dark:text-white min-h-[40px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`bulk-threshold-input-mobile-${product.id}`) as HTMLInputElement;
                                const val = parseInt(input?.value, 10);
                                if (!isNaN(val)) {
                                  const vIds = product.variants.filter(v => selectedVariantIds.includes(v.id)).map(v => v.id);
                                  handleBulkUpdateVariantThreshold(product.id, vIds, val);
                                  if (input) input.value = '';
                                } else {
                                  toast.error('Please enter a valid threshold number');
                                }
                              }}
                              className="px-3 py-2 bg-[#e94560] hover:bg-[#e94560]/95 text-white rounded-xl text-xs font-bold min-h-[40px]"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {product.variants.map(variant => (
                      <InventoryMobileVariantCard
                        key={variant.id}
                        productId={product.id}
                        variant={variant}
                        selectedVariantIds={selectedVariantIds}
                        setSelectedVariantIds={setSelectedVariantIds}
                        updatingIds={updatingIds}
                        handleUpdateVariantStock={handleUpdateVariantStock}
                        handleUpdateVariantThreshold={handleUpdateVariantThreshold}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-[#0f0f1b] p-3 rounded-xl">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Stock Level</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] focus-within:border-[#e94560] transition-all">
                      <input
                        type="number"
                        defaultValue={product.stock}
                        style={{ borderWidth: 0 }}
                        className="w-full bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-2 focus:outline-none min-h-[40px]"
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val !== product.stock) {
                            handleUpdateProductStock(product.id, val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = parseInt((e.target as HTMLInputElement).value, 10);
                            if (!isNaN(val)) {
                              handleUpdateProductStock(product.id, val);
                              (e.target as HTMLInputElement).blur();
                            }
                          }
                        }}
                      />
                    </div>
                    {updatingIds[`stock-${product.id}`] && (
                      <Loader2 className="h-4 w-4 animate-spin text-[#e94560] flex-shrink-0" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Alert Threshold</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] focus-within:border-[#e94560] transition-all">
                      <input
                        type="number"
                        defaultValue={threshold}
                        style={{ borderWidth: 0 }}
                        className="w-full bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-2 focus:outline-none min-h-[40px]"
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val !== threshold) {
                            handleUpdateProductThreshold(product.id, val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = parseInt((e.target as HTMLInputElement).value, 10);
                            if (!isNaN(val)) {
                              handleUpdateProductThreshold(product.id, val);
                              (e.target as HTMLInputElement).blur();
                            }
                          }
                        }}
                      />
                    </div>
                    {updatingIds[`threshold-${product.id}`] && (
                      <Loader2 className="h-4 w-4 animate-spin text-[#e94560] flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

