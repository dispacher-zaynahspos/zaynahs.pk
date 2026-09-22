'use client';

import React from 'react';
import Image from 'next/image';
import { Product, Category } from '@/lib/types';
import { Search, Loader2, Plus, X } from '@/components/common/Icons';

interface CategoryAddProductsModalProps {
  isOpen: boolean;
  category: Category;
  loadingAllProducts: boolean;
  filteredModalProducts: Product[];
  modalSearchQuery: string;
  setModalSearchQuery: (query: string) => void;
  modalSelectedProductIds: string[];
  setModalSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  addingProductId: string | null;
  onAddProduct: (productId: string) => void;
  onBulkAddProducts: () => void;
  onClose: () => void;
}

export function CategoryAddProductsModal({
  isOpen,
  category,
  loadingAllProducts,
  filteredModalProducts,
  modalSearchQuery,
  setModalSearchQuery,
  modalSelectedProductIds,
  setModalSelectedProductIds,
  addingProductId,
  onAddProduct,
  onBulkAddProducts,
  onClose,
}: CategoryAddProductsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity duration-350">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden overscroll-contain animate-in fade-in-50 zoom-in-95 duration-200 flex flex-col max-h-[85vh] will-change-transform transform-gpu">
        <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800">
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Add Products to {category.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input in Modal */}
        <div className="my-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={modalSearchQuery}
            onChange={(e) => setModalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50/50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
          />
        </div>

        {!loadingAllProducts && filteredModalProducts.length > 0 && (
          <div className="flex items-center justify-between mb-3 px-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                checked={filteredModalProducts.length > 0 && modalSelectedProductIds.length === filteredModalProducts.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setModalSelectedProductIds(filteredModalProducts.map(p => p.id));
                  } else {
                    setModalSelectedProductIds([]);
                  }
                }}
              />
              Select All
            </label>

            {modalSelectedProductIds.length > 0 && (
              <button
                type="button"
                onClick={onBulkAddProducts}
                disabled={addingProductId === 'bulk'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-[#e94560] text-white hover:bg-[#e94560]/90 transition-all disabled:opacity-50"
              >
                {addingProductId === 'bulk' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Selected ({modalSelectedProductIds.length})
              </button>
            )}
          </div>
        )}

        {/* Product List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 overscroll-contain touch-pan-y transform-gpu will-change-transform" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loadingAllProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#e94560]" />
            </div>
          ) : filteredModalProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No products available to add.
            </div>
          ) : (
            filteredModalProducts.map(prod => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-150 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-[#1d1d36]/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                    checked={modalSelectedProductIds.includes(prod.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setModalSelectedProductIds(prev => [...prev, prod.id]);
                      } else {
                        setModalSelectedProductIds(prev => prev.filter(id => id !== prod.id));
                      }
                    }}
                  />
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-800 flex-shrink-0">
                    {prod.images?.[0] ? (
                      <Image
                        src={prod.images[0].url}
                        alt={prod.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 dark:bg-gray-850 flex items-center justify-center text-gray-400 text-[10px]">
                        No Img
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{prod.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{prod.sku || 'No SKU'} | Rs. {prod.price}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAddProduct(prod.id)}
                  disabled={addingProductId === prod.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#e94560]/10 hover:bg-[#e94560]/20 text-[#e94560] transition-all disabled:opacity-50"
                >
                  {addingProductId === prod.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
