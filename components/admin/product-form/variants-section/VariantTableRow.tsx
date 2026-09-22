'use client';

import React from 'react';
import { Trash2 } from '@/components/common/Icons';
import { ProductVariant } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';

interface VariantTableRowProps {
  variant: Omit<ProductVariant, 'id' | 'productId'>;
  idx: number;
  isSelected: boolean;
  price: string;
  comparePrice: string;
  onToggleSelect: (idx: number, checked: boolean) => void;
  handleUpdateVariant: (index: number, updates: Partial<Omit<ProductVariant, 'id' | 'productId'>>) => void;
  handleRemoveVariant: (index: number) => void;
}

export const VariantTableRow: React.FC<VariantTableRowProps> = ({
  variant,
  idx,
  isSelected,
  price,
  comparePrice,
  onToggleSelect,
  handleUpdateVariant,
  handleRemoveVariant,
}) => {
  const label = [variant.color, variant.size, variant.material, variant.customValue].filter(Boolean).join(' / ') || `Var ${idx + 1}`;

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-[#e94560]/5 dark:bg-[#e94560]/10' : idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50/40 dark:bg-white/[0.02]'} hover:bg-gray-100/60 dark:hover:bg-white/[0.04]`}>
      <td className="py-2.5 px-3">
        <div className="flex items-center justify-center min-h-[28px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect(idx, e.target.checked)}
            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </div>
      </td>
      <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
        <div className="flex items-center gap-1.5 min-h-[28px]">
          {variant.colorHex && (
            <span className="h-3 w-3 rounded-full flex-shrink-0 border border-gray-300" style={getSwatchStyle(variant.colorHex)} />
          )}
          <span className="truncate">{label}</span>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center justify-center min-h-[28px]">
          {variant.color && (
            <div className="flex items-center gap-1 max-w-[100px] overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {(variant.colorHex || '#888888').split(',').map((hexVal, hexIdx, hexArr) => (
                <div key={hexIdx} className="relative group h-7 w-7 rounded border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                  <input
                    type="color"
                    value={hexVal.trim() || '#888888'}
                    onChange={(e) => {
                      const newArr = [...hexArr];
                      newArr[hexIdx] = e.target.value;
                      handleUpdateVariant(idx, { colorHex: newArr.join(',') });
                    }}
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer scale-[2.5] transform-gpu outline-none bg-transparent"
                  />
                  {hexArr.length > 1 && (
                    <button type="button" onClick={() => {
                      const newArr = hexArr.filter((_, i) => i !== hexIdx);
                      handleUpdateVariant(idx, { colorHex: newArr.join(',') });
                    }} className="absolute -top-1 -right-1 hidden group-hover:flex h-3 w-3 items-center justify-center bg-red-500 text-white rounded-full text-[8px] z-10 cursor-pointer">×</button>
                  )}
                </div>
              ))}
              {(variant.colorHex || '#888888').split(',').length < 3 && (
                <button type="button" onClick={() => {
                  handleUpdateVariant(idx, { colorHex: (variant.colorHex || '#888888') + ',#ffffff' });
                }} className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-[10px] cursor-pointer" title="Add split color">+</button>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center min-h-[28px]">
          <input
            type="number"
            value={variant.price || ''}
            placeholder={price}
            onChange={(e) => handleUpdateVariant(idx, { price: parseFloat(e.target.value) || undefined })}
            className="w-20 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b]/80 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 transition-all"
          />
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center min-h-[28px]">
          <input
            type="number"
            value={variant.comparePrice || ''}
            placeholder={comparePrice || '0'}
            onChange={(e) => handleUpdateVariant(idx, { comparePrice: parseFloat(e.target.value) || undefined })}
            className="w-20 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b]/80 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 transition-all"
          />
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center min-h-[28px]">
          <input
            type="number"
            required
            value={variant.stock}
            onChange={(e) => handleUpdateVariant(idx, { stock: parseInt(e.target.value) || 0 })}
            className="w-20 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b]/80 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 transition-all"
          />
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center min-h-[28px]">
          <input
            type="number"
            value={variant.inventoryThreshold || 0}
            onChange={(e) => handleUpdateVariant(idx, { inventoryThreshold: parseInt(e.target.value) || 0 })}
            className="w-20 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b]/80 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 transition-all"
          />
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center min-h-[28px]">
          <input
            type="text"
            value={variant.sku || ''}
            onChange={(e) => handleUpdateVariant(idx, { sku: e.target.value })}
            className="w-24 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-[#0f0f1b]/80 px-2 py-1.5 text-xs focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 transition-all"
          />
        </div>
      </td>
      <td className="py-2.5 px-3 text-center">
        <div className="flex items-center justify-center min-h-[28px]">
          <input
            type="checkbox"
            checked={variant.active}
            onChange={(e) => handleUpdateVariant(idx, { active: e.target.checked })}
            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </div>
      </td>
      <td className="py-2.5 px-3 text-center">
        <div className="flex items-center justify-center min-h-[28px]">
          <button
            type="button"
            onClick={() => handleRemoveVariant(idx)}
            className="text-red-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
            title="Remove variant"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
