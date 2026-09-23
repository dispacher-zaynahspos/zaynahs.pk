'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Loader2, Edit } from '@/components/common/Icons';
import { Product } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';
import TableThumbnail from '@/components/admin/TableThumbnail';
import { getStockBadge, renderProductStatus } from './inventoryUtils';
import { InventoryVariantSubtable } from './InventoryVariantSubtable';
import { toast } from 'sonner';

interface InventoryTableProps {
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
  handleEditProduct: (productId: string) => void;
  setPreviewImageUrl: (url: string | null) => void;
}

export function InventoryTable({
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
              const threshold = product.inventoryThreshold !== undefined && product.inventoryThreshold !== null ? product.inventoryThreshold : 5;
              
              return (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#1d1d36]/30 transition-colors">
                    <td className="py-2.5 px-2 text-center w-8">
                      {product.hasVariants ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(product.id)}
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#252542] transition-all"
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
                        <span className="font-bold text-xs text-gray-500 dark:text-gray-400">
                          {product.stock} (total across variants)
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] focus-within:border-primary transition-all">
                            <input
                              type="number"
                              defaultValue={product.stock}
                              style={{ borderWidth: 0 }}
                              className="w-16 bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-1.5 focus:outline-none"
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
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e94560]" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {product.hasVariants ? (
                        <span className="text-xs text-gray-400">Set per variant</span>
                      ) : (
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] focus-within:border-primary transition-all">
                            <input
                              type="number"
                              defaultValue={threshold}
                              style={{ borderWidth: 0 }}
                              className="w-16 bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-1.5 focus:outline-none"
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
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e94560]" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {renderProductStatus(product)}
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
                      updatingIds={updatingIds}
                      handleUpdateVariantStock={handleUpdateVariantStock}
                      handleUpdateVariantThreshold={handleUpdateVariantThreshold}
                      handleBulkUpdateVariantStock={handleBulkUpdateVariantStock}
                      handleBulkUpdateVariantThreshold={handleBulkUpdateVariantThreshold}
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
