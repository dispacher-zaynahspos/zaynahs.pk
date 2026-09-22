'use client';

import React from 'react';
import { Loader2 } from '@/components/common/Icons';
import { ProductVariant } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { getStockBadge } from './inventoryUtils';

interface InventoryMobileVariantCardProps {
  productId: string;
  variant: ProductVariant;
  selectedVariantIds: string[];
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<string[]>>;
  updatingIds: Record<string, boolean>;
  handleUpdateVariantStock: (productId: string, variantId: string, newStock: number) => Promise<void>;
  handleUpdateVariantThreshold: (productId: string, variantId: string, newThreshold: number) => Promise<void>;
}

export function InventoryMobileVariantCard({
  productId,
  variant,
  selectedVariantIds,
  setSelectedVariantIds,
  updatingIds,
  handleUpdateVariantStock,
  handleUpdateVariantThreshold,
}: InventoryMobileVariantCardProps) {
  const variantLabel = [variant.color, variant.size, variant.material, variant.customValue].filter(Boolean).join(' / ') || 'Default';
  const variantThreshold = variant.inventoryThreshold !== undefined && variant.inventoryThreshold !== null ? variant.inventoryThreshold : 5;

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
          {getStockBadge(variant.stock, variantThreshold)}
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
            <div className="flex-1 flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] focus-within:border-primary transition-all">
              <input
                type="number"
                defaultValue={variant.stock}
                style={{ borderWidth: 0 }}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-2 focus:outline-none min-h-[40px]"
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val !== variant.stock) {
                    handleUpdateVariantStock(productId, variant.id, val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val)) {
                      handleUpdateVariantStock(productId, variant.id, val);
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
              />
            </div>
            {updatingIds[`stock-${variant.id}`] && (
              <Loader2 className="h-4 w-4 animate-spin text-[#e94560] flex-shrink-0" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Threshold</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] focus-within:border-primary transition-all">
              <input
                type="number"
                defaultValue={variantThreshold}
                style={{ borderWidth: 0 }}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-white px-2.5 py-2 focus:outline-none min-h-[40px]"
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val !== variantThreshold) {
                    handleUpdateVariantThreshold(productId, variant.id, val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val)) {
                      handleUpdateVariantThreshold(productId, variant.id, val);
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
              />
            </div>
            {updatingIds[`threshold-${variant.id}`] && (
              <Loader2 className="h-4 w-4 animate-spin text-[#e94560] flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
