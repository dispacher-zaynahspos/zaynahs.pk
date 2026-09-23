'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Edit } from '@/components/common/Icons';
import { Product } from '@/lib/types';
import TableThumbnail from '@/components/admin/TableThumbnail';
import { renderProductStatus } from './inventoryUtils';
import { InventoryVariantSubtable } from './InventoryVariantSubtable';

interface InventoryTableProps {
  paginatedProducts: Product[];
  expandedProducts: Record<string, boolean>;
  toggleExpand: (productId: string) => void;
  selectedVariantIds: string[];
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingProductStock: Record<string, number | string>;
  pendingProductThreshold: Record<string, number | string>;
  pendingVariantStock: Record<string, number | string>;
  pendingVariantThreshold: Record<string, number | string>;
  onPendingProductStockChange: (productId: string, val: number | string) => void;
  onPendingProductThresholdChange: (productId: string, val: number | string) => void;
  onPendingVariantStockChange: (productId: string, variantId: string, val: number | string) => void;
  onPendingVariantThresholdChange: (productId: string, variantId: string, val: number | string) => void;
  onBulkStageVariantStock: (productId: string, variantIds: string[], newStock: number) => void;
  onBulkStageVariantThreshold: (productId: string, variantIds: string[], newThreshold: number) => void;
  handleEditProduct: (productId: string) => void;
  setPreviewImageUrl: (url: string | null) => void;
}

export function InventoryTable({
  paginatedProducts,
  expandedProducts,
  toggleExpand,
  selectedVariantIds,
  setSelectedVariantIds,
  pendingProductStock,
  pendingProductThreshold,
  pendingVariantStock,
  pendingVariantThreshold,
  onPendingProductStockChange,
  onPendingProductThresholdChange,
  onPendingVariantStockChange,
  onPendingVariantThresholdChange,
  onBulkStageVariantStock,
  onBulkStageVariantThreshold,
  handleEditProduct,
  setPreviewImageUrl,
}: InventoryTableProps) {
  return (
    <div className="hidden md:block bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden text-gray-900 dark:text-white transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-[#0f0f1b] border-b border-gray-200 dark:border-gray-800 font-bold uppercase text-[10px] tracking-wider text-gray-500">
            <tr>
              <th className="py-2.5 px-2 w-8 text-center"></th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3 w-28">SKU</th>
              <th className="py-2.5 px-3 w-36">Stock Level</th>
              <th className="py-2.5 px-3 w-32">Alert Threshold</th>
              <th className="py-2.5 px-4 text-right min-w-[170px] whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {paginatedProducts.map(product => {
              const isExpanded = expandedProducts[product.id] ?? false;
              const originalThreshold = product.inventoryThreshold !== undefined && product.inventoryThreshold !== null ? product.inventoryThreshold : 5;
              
              const isStockModified = pendingProductStock[product.id] !== undefined && String(pendingProductStock[product.id]) !== String(product.stock);
              const currentStockVal = pendingProductStock[product.id] !== undefined ? pendingProductStock[product.id] : product.stock;
              const effectiveStock = isStockModified ? (parseInt(String(currentStockVal), 10) || 0) : product.stock;

              const isThresholdModified = pendingProductThreshold[product.id] !== undefined && String(pendingProductThreshold[product.id]) !== String(originalThreshold);
              const currentThresholdVal = pendingProductThreshold[product.id] !== undefined ? pendingProductThreshold[product.id] : originalThreshold;
              const effectiveThreshold = isThresholdModified ? (parseInt(String(currentThresholdVal), 10) || 0) : originalThreshold;

              const anyVariantStockModified = product.hasVariants && product.variants?.some(
                v => pendingVariantStock[v.id] !== undefined && String(pendingVariantStock[v.id]) !== String(v.stock)
              );

              const computedTotalStockWithVariants = product.hasVariants && product.variants
                ? product.variants.reduce((sum, v) => {
                    const pVal = pendingVariantStock[v.id];
                    return sum + (pVal !== undefined ? (parseInt(String(pVal), 10) || 0) : v.stock);
                  }, 0)
                : effectiveStock;

              // Construct effective product to reflect changes in the status badge dynamically
              const effectiveProductForStatus: Product = {
                ...product,
                stock: computedTotalStockWithVariants,
                inventoryThreshold: effectiveThreshold,
                variants: product.hasVariants && product.variants ? product.variants.map(v => ({
                  ...v,
                  stock: pendingVariantStock[v.id] !== undefined ? (parseInt(String(pendingVariantStock[v.id]), 10) || 0) : v.stock,
                  inventoryThreshold: pendingVariantThreshold[v.id] !== undefined ? (parseInt(String(pendingVariantThreshold[v.id]), 10) || 0) : (v.inventoryThreshold ?? 5),
                })) : product.variants,
              };
              
              return (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#1d1d36]/30 transition-colors">
                    <td className="py-2.5 px-2 text-center w-8">
                      {product.hasVariants ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(product.id)}
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#252542] transition-all cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <TableThumbnail 
                          url={product.images?.[0]?.url || null} 
                          alt={product.name} 
                          onPreview={setPreviewImageUrl} 
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px] xl:max-w-xs">{product.name}</div>
                          {product.productCategories && product.productCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {product.productCategories.map((pc) => pc.category ? (
                                <span key={pc.categoryId} className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 leading-tight">
                                  {pc.category.name}
                                </span>
                              ) : null)}
                            </div>
                          ) : product.category ? (
                            <div className="text-[9px] text-gray-400 uppercase mt-0.5 font-bold">
                              {product.category.name}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                      {product.sku || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      {product.hasVariants ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-xs ${anyVariantStockModified ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-gray-500 dark:text-gray-400'}`}>
                            {computedTotalStockWithVariants} (total across variants)
                          </span>
                          {anyVariantStockModified && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" title="Unsaved variant edits" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className={`flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] transition-all ${
                            isStockModified
                              ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20'
                              : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'
                          }`}>
                            <input
                              type="number"
                              value={currentStockVal}
                              style={{ borderWidth: 0 }}
                              className="w-16 bg-transparent text-xs text-center font-bold text-gray-900 dark:text-white px-2 py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              onChange={(e) => onPendingProductStockChange(product.id, e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {product.hasVariants ? (
                        <span className="text-xs text-gray-400">Set per variant</span>
                      ) : (
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className={`flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] transition-all ${
                            isThresholdModified
                              ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20'
                              : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'
                          }`}>
                            <input
                              type="number"
                              value={currentThresholdVal}
                              style={{ borderWidth: 0 }}
                              className="w-16 bg-transparent text-xs text-center font-bold text-gray-900 dark:text-white px-2 py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              onChange={(e) => onPendingProductThresholdChange(product.id, e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {renderProductStatus(effectiveProductForStatus)}
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product.id)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all cursor-pointer flex-shrink-0"
                          title="Edit Product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Variants Subtable */}
                  {product.hasVariants && isExpanded && (
                    <InventoryVariantSubtable
                      product={product}
                      selectedVariantIds={selectedVariantIds}
                      setSelectedVariantIds={setSelectedVariantIds}
                      pendingVariantStock={pendingVariantStock}
                      pendingVariantThreshold={pendingVariantThreshold}
                      onPendingVariantStockChange={onPendingVariantStockChange}
                      onPendingVariantThresholdChange={onPendingVariantThresholdChange}
                      onBulkStageVariantStock={onBulkStageVariantStock}
                      onBulkStageVariantThreshold={onBulkStageVariantThreshold}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
