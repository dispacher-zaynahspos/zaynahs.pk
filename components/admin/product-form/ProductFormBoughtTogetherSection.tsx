'use client';

import React from 'react';
import { Trash2, Search, Image as ImageIcon } from '@/components/common/Icons';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductFormBoughtTogetherSectionProps {
  frequentlyBoughtTogetherIds: string[];
  setFrequentlyBoughtTogetherIds: React.Dispatch<React.SetStateAction<string[]>>;
  productList: Product[];
  productSearchQuery: string;
  setProductSearchQuery: (val: string) => void;
  visibleProductCount: number;
  setVisibleProductCount: React.Dispatch<React.SetStateAction<number>>;
}

export const ProductFormBoughtTogetherSection: React.FC<ProductFormBoughtTogetherSectionProps> = ({
  frequentlyBoughtTogetherIds,
  setFrequentlyBoughtTogetherIds,
  productList,
  productSearchQuery,
  setProductSearchQuery,
  visibleProductCount,
  setVisibleProductCount,
}) => {
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3 text-gray-900 dark:text-white transition-colors">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Bought Together Recommendations</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Select up to 2 items to bundle and offer discounts at storefront.</p>
      </div>

      {/* Selected Items List */}
      {frequentlyBoughtTogetherIds.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {frequentlyBoughtTogetherIds.map((id) => {
            const product = productList.find(p => p.id === id);
            if (!product) return null;
            return (
              <div key={id} className="flex items-center gap-2.5 p-2 bg-gray-50/70 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#0f0f1b]">
                  {(product as any).product_images && (product as any).product_images.length > 0 ? (
                    <img src={((product as any).product_images as any[]).find((img: any) => img.is_primary)?.url || (product as any).product_images[0].url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"><ImageIcon className="h-3.5 w-3.5 text-gray-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                  <div className="flex items-center justify-between gap-1 text-[9.5px] text-gray-400 mt-0.5">
                    <span className="truncate">{product.sku ? `SKU: ${product.sku}` : 'No SKU'}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">Rs. {product.price}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFrequentlyBoughtTogetherIds(prev => prev.filter(pId => pId !== id))}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={productSearchQuery}
          onChange={(e) => setProductSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white transition-all dark:border-gray-800 dark:bg-[#111124] text-gray-900 dark:text-white"
        />
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg max-h-48 overflow-y-auto p-1.5 space-y-1 bg-gray-50/50 dark:bg-[#0f0f1b] overscroll-contain">
        {(() => {
          const q = productSearchQuery.toLowerCase();
          const filteredList = productList.filter(product =>
            product.name.toLowerCase().includes(q) ||
            (product.sku && product.sku.toLowerCase().includes(q)) ||
            (product.variants && product.variants.some(v =>
              (v.sku && v.sku.toLowerCase().includes(q)) ||
              (v.color && v.color.toLowerCase().includes(q)) ||
              (v.size && v.size.toLowerCase().includes(q)) ||
              (v.material && v.material.toLowerCase().includes(q)) ||
              (v.customValue && v.customValue.toLowerCase().includes(q))
            ))
          );

          if (filteredList.length === 0) {
            return <div className="p-3 text-xs text-gray-400 text-center">No matching products found.</div>;
          }

          const visibleItems = filteredList.slice(0, visibleProductCount);
          const hasMore = filteredList.length > visibleProductCount;

          return (
            <>
              {visibleItems.map((product) => {
                const isChecked = frequentlyBoughtTogetherIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer select-none border border-transparent transition-colors ${!isChecked && frequentlyBoughtTogetherIds.length >= 2
                        ? 'opacity-50 hover:bg-transparent'
                        : 'hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-gray-800'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!isChecked && frequentlyBoughtTogetherIds.length >= 2}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (frequentlyBoughtTogetherIds.length < 2) {
                            setFrequentlyBoughtTogetherIds(prev => [...prev, product.id]);
                          } else {
                            toast.warning('You can choose a maximum of 2 bought-together items.');
                          }
                        } else {
                          setFrequentlyBoughtTogetherIds(prev => prev.filter(id => id !== product.id));
                        }
                      }}
                      className="shrink-0 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {(product as any).product_images && (product as any).product_images.length > 0 ? (
                      <div className="h-7 w-7 shrink-0 rounded border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#0f0f1b]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={((product as any).product_images as any[]).find((img: any) => img.is_primary)?.url || (product as any).product_images[0].url} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 shrink-0 rounded border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#0f0f1b] flex items-center justify-center">
                        <ImageIcon className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">{product.name}</p>
                      <div className="flex items-center justify-between gap-1 text-[9px] text-gray-400 mt-0.5">
                        <span className="truncate">{product.sku ? `SKU: ${product.sku}` : 'No SKU'}</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">Rs. {product.price}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleProductCount(prev => prev + 20)}
                  className="w-full py-1.5 mt-1 text-center text-xs font-bold text-[#e94560] hover:text-[#d63d55] bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  Load More Products (+{filteredList.length - visibleProductCount} remaining)
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
