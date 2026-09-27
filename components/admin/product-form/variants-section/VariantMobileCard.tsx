'use client';

import React from 'react';
import { Trash2 } from '@/components/common/Icons';
import { ProductVariant } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';

interface VariantMobileCardProps {
  variant: Omit<ProductVariant, 'id' | 'product_id'>;
  idx: number;
  isSelected: boolean;
  price: string;
  comparePrice: string;
  onToggleSelect: (idx: number, checked: boolean) => void;
  handleUpdateVariant: (index: number, updates: Partial<Omit<ProductVariant, 'id' | 'product_id'>>) => void;
  handleRemoveVariant: (index: number) => void;
}

export const VariantMobileCard: React.FC<VariantMobileCardProps> = ({
  variant,
  idx,
  isSelected,
  price,
  comparePrice,
  onToggleSelect,
  handleUpdateVariant,
  handleRemoveVariant,
}) => {
  const label = [variant.color, variant.size, variant.material, variant.custom_value].filter(Boolean).join(' / ') || `Var ${idx + 1}`;
  const inputCls = 'w-full rounded-md border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b]/80 px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 transition-all min-h-[40px] text-gray-900 dark:text-white';

  return (
    <div className={`rounded-xl border p-3 space-y-3 transition-colors ${isSelected ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent'}`}>
      {/* Header: select + label + delete */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(idx, e.target.checked)}
          className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer shrink-0"
        />
        {variant.color_hex && (
          <span className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-gray-300" style={getSwatchStyle(variant.color_hex)} />
        )}
        <span className="flex-1 truncate text-sm font-bold text-gray-900 dark:text-white">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={variant.active}
            onChange={(e) => handleUpdateVariant(idx, { active: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
        <button
          type="button"
          onClick={() => handleRemoveVariant(idx)}
          className="text-red-400 hover:text-red-600 p-1 cursor-pointer transition-colors shrink-0"
          title="Remove variant"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Color swatches */}
      {variant.color && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Color</span>
          {(variant.color_hex || '#888888').split(',').map((hexVal, hexIdx, hexArr) => (
            <div key={hexIdx} className="relative group h-7 w-7 rounded border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
              <input
                type="color"
                value={hexVal.trim() || '#888888'}
                onChange={(e) => {
                  const newArr = [...hexArr];
                  newArr[hexIdx] = e.target.value;
                  handleUpdateVariant(idx, { color_hex: newArr.join(',') });
                }}
                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer scale-[2.5] transform-gpu outline-none bg-transparent"
              />
              {hexArr.length > 1 && (
                <button type="button" onClick={() => {
                  const newArr = hexArr.filter((_, i) => i !== hexIdx);
                  handleUpdateVariant(idx, { color_hex: newArr.join(',') });
                }} className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-red-500 text-white rounded-full text-[8px] z-10 cursor-pointer">×</button>
              )}
            </div>
          ))}
          {(variant.color_hex || '#888888').split(',').length < 3 && (
            <button type="button" onClick={() => {
              handleUpdateVariant(idx, { color_hex: (variant.color_hex || '#888888') + ',#ffffff' });
            }} className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-xs cursor-pointer" title="Add split color">+</button>
          )}
        </div>
      )}

      {/* Editable fields grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Price</label>
          <input
            type="number"
            value={variant.price || ''}
            placeholder={price}
            onChange={(e) => handleUpdateVariant(idx, { price: parseFloat(e.target.value) || undefined })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Compare</label>
          <input
            type="number"
            value={variant.compare_price || ''}
            placeholder={comparePrice || '0'}
            onChange={(e) => handleUpdateVariant(idx, { compare_price: parseFloat(e.target.value) || undefined })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock *</label>
          <input
            type="number"
            required
            value={variant.stock}
            onChange={(e) => handleUpdateVariant(idx, { stock: parseInt(e.target.value) || 0 })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Threshold</label>
          <input
            type="number"
            value={variant.inventory_threshold || 0}
            onChange={(e) => handleUpdateVariant(idx, { inventory_threshold: parseInt(e.target.value) || 0 })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SKU</label>
          <input
            type="text"
            value={variant.sku || ''}
            onChange={(e) => handleUpdateVariant(idx, { sku: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
};
