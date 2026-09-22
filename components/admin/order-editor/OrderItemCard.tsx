import React from 'react';
import { CartItem, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { Package, Trash2 } from '@/components/common/Icons';

interface OrderItemCardProps {
  item: CartItem & { _isNew?: boolean };
  idx: number;
  settings: StoreSettings;
  onItemDiscountChange: (idx: number, type: 'fixed' | 'percent', value: number) => void;
  onQuantityChange: (idx: number, qty: number) => void;
  onRemoveItem: (idx: number) => void;
  onSelectOption: (idx: number, type: 'color' | 'size' | 'material' | 'customValue', value: string) => void;
}

export default function OrderItemCard({
  item,
  idx,
  settings,
  onItemDiscountChange,
  onQuantityChange,
  onRemoveItem,
  onSelectOption,
}: OrderItemCardProps) {
  const variantStr = item.selectedVariant ? Object.values({
    color: item.selectedVariant.color,
    size: item.selectedVariant.size,
    material: item.selectedVariant.material,
    custom: item.selectedVariant.customValue
  }).filter(Boolean).join(', ') : '';

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-[#16162a] shadow-xs">
      {/* Top: image + name + variants */}
      <div className="flex items-start gap-3">
        {item.product.images && item.product.images.length > 0 ? (
          <div className="h-14 w-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={item.product.images[0].url} 
              alt={item.product.name} 
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-14 w-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
            <Package className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
              {item.product.name}
            </h4>
            {item._isNew && (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                NEW
              </span>
            )}
          </div>
          {item.product.hasVariants && item.product.variants && item.product.variants.length > 0 ? (
            <div className="mt-2.5 space-y-3">
              {/* Color Group */}
              {(() => {
                const activeVariants = item.product.variants || [];
                const colors = Array.from(new Set(activeVariants.map(v => v.color).filter(Boolean))) as string[];
                if (colors.length === 0) return null;
                return (
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Color</div>
                    <div className="flex flex-wrap gap-1.5">
                      {colors.map(color => {
                        const isSelected = item.selectedVariant?.color === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => onSelectOption(idx, 'color', color)}
                            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Size Group */}
              {(() => {
                const activeVariants = item.product.variants || [];
                const sizes = Array.from(new Set(activeVariants.map(v => v.size).filter(Boolean))) as string[];
                if (sizes.length === 0) return null;
                return (
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Size</div>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map(size => {
                        const isSelected = item.selectedVariant?.size === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => onSelectOption(idx, 'size', size)}
                            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Material Group */}
              {(() => {
                const activeVariants = item.product.variants || [];
                const materials = Array.from(new Set(activeVariants.map(v => v.material).filter(Boolean))) as string[];
                if (materials.length === 0) return null;
                return (
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Material</div>
                    <div className="flex flex-wrap gap-1.5">
                      {materials.map(mat => {
                        const isSelected = item.selectedVariant?.material === mat;
                        return (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => onSelectOption(idx, 'material', mat)}
                            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {mat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Custom Option Group */}
              {(() => {
                const activeVariants = item.product.variants || [];
                const customOptionName = activeVariants[0]?.customOption;
                const customValues = Array.from(new Set(activeVariants.map(v => v.customValue).filter(Boolean))) as string[];
                if (customValues.length === 0) return null;
                return (
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{customOptionName || 'Custom Option'}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {customValues.map(val => {
                        const isSelected = item.selectedVariant?.customValue === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => onSelectOption(idx, 'customValue', val)}
                            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : variantStr && (
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {variantStr}
            </p>
          )}
          {!item.product.hasVariants && (
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              {formatPrice(item.unitPrice, settings.currencySymbol)}
            </p>
          )}
        </div>
      </div>

      {/* Bottom: Item Discount + qty + price + delete */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 gap-3">
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Discount:</span>
          <select 
            value={item.discountType || 'fixed'}
            onChange={e => onItemDiscountChange(idx, e.target.value as 'fixed' | 'percent', item.discountValue || 0)}
            className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1"
          >
            <option value="fixed">{settings.currencySymbol}</option>
            <option value="percent">%</option>
          </select>
          <input 
            type="number" 
            min="0"
            placeholder="0"
            value={item.discountValue || ''}
            onChange={e => onItemDiscountChange(idx, item.discountType || 'fixed', parseFloat(e.target.value) || 0)}
            className="w-16 text-right px-2 py-1 text-xs bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded font-semibold focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button 
              type="button"
              onClick={() => onQuantityChange(idx, item.quantity - 1)}
              className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 font-medium text-base cursor-pointer"
            >−</button>
            <div className="h-8 flex items-center justify-center text-sm font-bold border-x border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 w-10">
              {item.quantity}
            </div>
            <button 
              type="button"
              onClick={() => onQuantityChange(idx, item.quantity + 1)}
              className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 font-medium text-base cursor-pointer"
            >+</button>
          </div>
        
          <div className="flex items-center gap-3">
            <div className="text-right">
              {item.discountAmount && item.discountAmount > 0 ? (
                <>
                  <div className="text-[10px] text-gray-400 line-through">
                    {formatPrice(item.unitPrice * item.quantity, settings.currencySymbol)}
                  </div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {formatPrice(item.total, settings.currencySymbol)}
                  </div>
                </>
              ) : (
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatPrice(item.total, settings.currencySymbol)}
                </div>
              )}
            </div>
            <button 
              type="button"
              onClick={() => onRemoveItem(idx)}
              className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:p-2 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              title="Remove Item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
