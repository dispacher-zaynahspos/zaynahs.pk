'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { getStockBadge } from './inventoryUtils';
import { toast } from 'sonner';

interface InventoryVariantSubtableProps {
  product: Product;
  selectedVariantIds: string[];
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingVariantStock: Record<string, number | string>;
  pendingVariantThreshold: Record<string, number | string>;
  onPendingVariantStockChange: (productId: string, variantId: string, val: number | string) => void;
  onPendingVariantThresholdChange: (productId: string, variantId: string, val: number | string) => void;
  onBulkStageVariantStock: (productId: string, variantIds: string[], newStock: number) => void;
  onBulkStageVariantThreshold: (productId: string, variantIds: string[], newThreshold: number) => void;
}

export function InventoryVariantSubtable({
  product,
  selectedVariantIds,
  setSelectedVariantIds,
  pendingVariantStock,
  pendingVariantThreshold,
  onPendingVariantStockChange,
  onPendingVariantThresholdChange,
  onBulkStageVariantStock,
  onBulkStageVariantThreshold,
}: InventoryVariantSubtableProps) {
  return (
    <tr>
      <td colSpan={6} className="bg-gray-50/40 dark:bg-[#0e0e1e]/40 p-4">
        {product.variants.some(v => selectedVariantIds.includes(v.id)) && (
          <div className="ml-10 bg-gray-100/95 dark:bg-[#1c1c36] p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-3 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-1 duration-150">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {product.variants.filter(v => selectedVariantIds.includes(v.id)).length} variant(s) selected
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Bulk Set Stock */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Stock:</span>
                <input
                  type="number"
                  placeholder="Set Stock"
                  id={`bulk-stock-input-${product.id}`}
                  className="w-28 px-3 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-primary text-gray-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(`bulk-stock-input-${product.id}`) as HTMLInputElement;
                    const val = parseInt(input?.value, 10);
                    if (!isNaN(val)) {
                      const vIds = product.variants.filter(v => selectedVariantIds.includes(v.id)).map(v => v.id);
                      onBulkStageVariantStock(product.id, vIds, val);
                      if (input) input.value = '';
                    } else {
                      toast.error('Please enter a valid stock number');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#e94560] hover:bg-[#e94560]/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Bulk Set Threshold */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Threshold:</span>
                <input
                  type="number"
                  placeholder="Set Threshold"
                  id={`bulk-threshold-input-${product.id}`}
                  className="w-28 px-3 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-primary text-gray-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(`bulk-threshold-input-${product.id}`) as HTMLInputElement;
                    const val = parseInt(input?.value, 10);
                    if (!isNaN(val)) {
                      const vIds = product.variants.filter(v => selectedVariantIds.includes(v.id)).map(v => v.id);
                      onBulkStageVariantThreshold(product.id, vIds, val);
                      if (input) input.value = '';
                    } else {
                      toast.error('Please enter a valid threshold number');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#e94560] hover:bg-[#e94560]/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const vIds = product.variants.map(v => v.id);
                  setSelectedVariantIds(prev => prev.filter(id => !vIds.includes(id)));
                }}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-350 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="ml-10 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-inner">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-450">
            <thead className="bg-gray-100/70 dark:bg-[#121226] border-b border-gray-200 dark:border-gray-800 text-[9px] font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-2.5 px-4 w-10 text-center">
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
                    className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3 w-3 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-4">Variant Option</th>
                <th className="py-2.5 px-4">SKU</th>
                <th className="py-2.5 px-4">Stock Level</th>
                <th className="py-2.5 px-4">Alert Threshold</th>
                <th className="py-2.5 px-4 text-right min-w-[150px] whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-800 bg-white/50 dark:bg-[#16162a]/50">
              {product.variants.map(variant => {
                const variantLabel = [variant.color, variant.size, variant.material, variant.customValue].filter(Boolean).join(' / ') || 'Default';
                const variantThreshold = variant.inventoryThreshold !== undefined && variant.inventoryThreshold !== null ? variant.inventoryThreshold : 5;
                
                const isStockModified = pendingVariantStock[variant.id] !== undefined && String(pendingVariantStock[variant.id]) !== String(variant.stock);
                const currentStockVal = pendingVariantStock[variant.id] !== undefined ? pendingVariantStock[variant.id] : variant.stock;
                const effectiveStock = isStockModified ? (parseInt(String(currentStockVal), 10) || 0) : variant.stock;

                const isThresholdModified = pendingVariantThreshold[variant.id] !== undefined && String(pendingVariantThreshold[variant.id]) !== String(variantThreshold);
                const currentThresholdVal = pendingVariantThreshold[variant.id] !== undefined ? pendingVariantThreshold[variant.id] : variantThreshold;
                const effectiveThreshold = isThresholdModified ? (parseInt(String(currentThresholdVal), 10) || 0) : variantThreshold;

                return (
                  <tr key={variant.id} className="hover:bg-gray-150/20 dark:hover:bg-[#1e1e3b]/20 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedVariantIds.includes(variant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVariantIds(prev => [...prev, variant.id]);
                          } else {
                            setSelectedVariantIds(prev => prev.filter(id => id !== variant.id));
                          }
                        }}
                        className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-gray-855 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        {variant.colorHex && (
                          <span className="h-3 w-3 rounded-full flex-shrink-0 border border-gray-300" style={getSwatchStyle(variant.colorHex)} />
                        )}
                        {variantLabel}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs">
                      {variant.sku || '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] transition-all ${
                          isStockModified
                            ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20'
                            : 'border-gray-250 dark:border-gray-700 focus-within:border-primary'
                        }`}>
                          <input
                            type="number"
                            value={currentStockVal}
                            style={{ borderWidth: 0 }}
                            className="w-14 bg-transparent text-xs text-center font-bold text-gray-900 dark:text-white px-2 py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            onChange={(e) => onPendingVariantStockChange(product.id, variant.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] transition-all ${
                          isThresholdModified
                            ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20'
                            : 'border-gray-250 dark:border-gray-700 focus-within:border-primary'
                        }`}>
                          <input
                            type="number"
                            value={currentThresholdVal}
                            style={{ borderWidth: 0 }}
                            className="w-14 bg-transparent text-xs text-center font-bold text-gray-900 dark:text-white px-2 py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            onChange={(e) => onPendingVariantThresholdChange(product.id, variant.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end whitespace-nowrap">
                        {getStockBadge(effectiveStock, effectiveThreshold)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}
