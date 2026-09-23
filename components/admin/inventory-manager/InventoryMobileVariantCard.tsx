'use client';

import React from 'react';
import { ProductVariant } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { getStockBadge } from './inventoryUtils';

interface InventoryMobileVariantCardProps {
  productId: string;
  variant: ProductVariant;
  selectedVariantIds: string[];
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingVariantStock: Record<string, number | string>;
  pendingVariantThreshold: Record<string, number | string>;
  onPendingVariantStockChange: (productId: string, variantId: string, val: number | string) => void;
  onPendingVariantThresholdChange: (productId: string, variantId: string, val: number | string) => void;
}

export function InventoryMobileVariantCard({
  productId,
  variant,
  selectedVariantIds,
  setSelectedVariantIds,
  pendingVariantStock,
  pendingVariantThreshold,
  onPendingVariantStockChange,
  onPendingVariantThresholdChange,
}: InventoryMobileVariantCardProps) {
  const variantLabel = [variant.color, variant.size, variant.material, variant.customValue].filter(Boolean).join(' / ') || 'Default';
  const variantThreshold = variant.inventoryThreshold !== undefined && variant.inventoryThreshold !== null ? variant.inventoryThreshold : 5;

  const isStockModified = pendingVariantStock[variant.id] !== undefined && String(pendingVariantStock[variant.id]) !== String(variant.stock);
  const currentStockVal = pendingVariantStock[variant.id] !== undefined ? pendingVariantStock[variant.id] : variant.stock;
  const effectiveStock = isStockModified ? (parseInt(String(currentStockVal), 10) || 0) : variant.stock;

  const isThresholdModified = pendingVariantThreshold[variant.id] !== undefined && String(pendingVariantThreshold[variant.id]) !== String(variantThreshold);
  const currentThresholdVal = pendingVariantThreshold[variant.id] !== undefined ? pendingVariantThreshold[variant.id] : variantThreshold;
  const effectiveThreshold = isThresholdModified ? (parseInt(String(currentThresholdVal), 10) || 0) : variantThreshold;

  return (
    <div className="bg-gray-50/50 dark:bg-[#0f0f1b]/50 p-3 rounded-xl border border-gray-150 dark:border-gray-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
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
            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer flex-shrink-0"
          />
          {variant.colorHex && (
            <span className="h-3.5 w-3.5 rounded-full border border-gray-300 flex-shrink-0" style={getSwatchStyle(variant.colorHex)} />
          )}
          {variantLabel}
        </span>
        <div className="flex justify-end">
          {getStockBadge(effectiveStock, effectiveThreshold)}
        </div>
      </div>

      {variant.sku && (
        <div className="text-[10px] font-mono text-gray-400">
          SKU: {variant.sku}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Stock</label>
          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] transition-all ${
              isStockModified
                ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20'
                : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'
            }`}>
              <input
                type="number"
                value={currentStockVal}
                style={{ borderWidth: 0 }}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-2 focus:outline-none min-h-[40px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onChange={(e) => onPendingVariantStockChange(productId, variant.id, e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Threshold</label>
          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] transition-all ${
              isThresholdModified
                ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20'
                : 'border-gray-200 dark:border-gray-700 focus-within:border-primary'
            }`}>
              <input
                type="number"
                value={currentThresholdVal}
                style={{ borderWidth: 0 }}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-2 focus:outline-none min-h-[40px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onChange={(e) => onPendingVariantThresholdChange(productId, variant.id, e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
