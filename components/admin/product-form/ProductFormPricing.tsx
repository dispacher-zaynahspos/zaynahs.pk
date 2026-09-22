'use client';

import React from 'react';
import { ProductVariant } from '@/lib/types';

interface ProductFormPricingProps {
  price: string;
  onPriceChange: (val: string) => void;
  comparePrice: string;
  onComparePriceChange: (val: string) => void;
  cost: string;
  setCost: (val: string) => void;
  rating: string;
  setRating: (val: string) => void;
  reviewsCount: string;
  setReviewsCount: (val: string) => void;
  isService: boolean;
  hasVariants: boolean;
  stock: string;
  setStock: (val: string) => void;
  inventoryThreshold: string;
  setInventoryThreshold: (val: string) => void;
  variants: Omit<ProductVariant, 'id' | 'productId'>[];
}

export const ProductFormPricing: React.FC<ProductFormPricingProps> = ({
  price,
  onPriceChange,
  comparePrice,
  onComparePriceChange,
  cost,
  setCost,
  rating,
  setRating,
  reviewsCount,
  setReviewsCount,
  isService,
  hasVariants,
  stock,
  setStock,
  inventoryThreshold,
  setInventoryThreshold,
  variants,
}) => {
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3.5 text-gray-900 dark:text-white transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Pricing & Inventory</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Selling Price *</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Compare Price</label>
          <input
            type="number"
            value={comparePrice}
            onChange={(e) => onComparePriceChange(e.target.value)}
            placeholder="Original price for strikethrough"
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Purchase Cost</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Rating (0.0 to 5.0)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Reviews Count Override</label>
          <input
            type="number"
            min="0"
            value={reviewsCount}
            onChange={(e) => setReviewsCount(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        {!isService && (
          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">In Stock Quantity</label>
            {hasVariants ? (
              <div className="relative">
                <div className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed select-none transition-all">
                  {variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                </div>
                <span className="text-[9.5px] text-gray-450 dark:text-gray-550 mt-0.5 block font-semibold">
                  Managed per variant below
                </span>
              </div>
            ) : (
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
              />
            )}
          </div>
        )}
        {!isService && (
          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Alert Threshold</label>
            <input
              type="number"
              value={inventoryThreshold}
              onChange={(e) => setInventoryThreshold(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
            />
          </div>
        )}
      </div>
    </div>
  );
};
