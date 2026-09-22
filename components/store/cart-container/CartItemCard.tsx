'use client';

import React from 'react';
import Image from 'next/image';
import { Package, Minus, Plus, Trash2 } from '@/components/common/Icons';
import { CartItem, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { toast } from 'sonner';

interface CartItemCardProps {
  item: CartItem;
  compact?: boolean;
  settings: StoreSettings;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
}

export default function CartItemCard({ item, compact = false, settings, removeItem, updateQuantity }: CartItemCardProps) {
  const img = getPresetImageUrl(item.product.images?.find((i: any) => i.isPrimary)?.url || item.product.images?.[0]?.url || '', 'micro');
  const parts: string[] = [];
  if (item.selectedVariant?.color) parts.push(item.selectedVariant.color);
  if (item.selectedVariant?.size) parts.push(item.selectedVariant.size);
  if (item.selectedVariant?.material) parts.push(item.selectedVariant.material);
  if (item.selectedVariant?.customValue) parts.push(item.selectedVariant.customValue);
  const variantStr = parts.join(' · ');

  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Image Container with Badge */}
      <div className="relative flex-shrink-0">
        <div className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] relative w-16 shadow-sm ${getSharedAspectClass(settings?.imageAspectRatio)}`}>
          {img ? (
            <Image src={img} alt={item.product.name} fill sizes="80px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center"><Package className="h-6 w-6 text-gray-300" /></div>
          )}
        </div>
        {compact && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800/90 dark:bg-gray-100/90 text-[10px] font-bold text-white dark:text-black ring-2 ring-white dark:ring-[#16162a] z-10 shadow-sm">
            {item.quantity}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[4rem]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight">
            {item.product.name}
          </h3>
          {compact && (
            <p className="text-sm font-black text-gray-900 dark:text-white shrink-0">
              {formatPrice(item.unitPrice * item.quantity, settings.currencySymbol)}
            </p>
          )}
        </div>

        {(variantStr || item.selectedModifiers?.length > 0) && (
          <div className="mt-1 space-y-0.5">
            {variantStr && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{variantStr}</p>
            )}
            {item.selectedModifiers?.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                + {item.selectedModifiers.map((m: any) => m.name).join(', ')}
              </p>
            )}
          </div>
        )}

        {!compact && (
          <div className="flex items-center justify-between mt-3">
            {/* Qty stepper */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (item.quantity <= 1) { removeItem(item.id); toast.success('Item removed'); }
                    else updateQuantity(item.id, item.quantity - 1);
                  }}
                  className="flex h-8 w-8 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 active:scale-95"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white select-none">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => { removeItem(item.id); toast.success(`${item.product.name} removed`); }}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer active:scale-95"
                title="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {/* Line price */}
            <span className="text-base font-black text-gray-900 dark:text-white">
              {formatPrice(item.unitPrice * item.quantity, settings.currencySymbol)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
