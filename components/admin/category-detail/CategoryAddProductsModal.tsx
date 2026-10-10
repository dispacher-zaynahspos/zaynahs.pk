'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Product, Category } from '@/lib/types';
import { Search, Loader2, Plus, X } from '@/components/common/Icons';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(isOpen);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-products-modal-title"
        className="relative w-full max-w-2xl bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-150 dark:border-gray-800 shrink-0">
          <h3 id="add-products-modal-title" className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Add Products to {category.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input in Modal */}
        <div className="px-4 sm:p-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[var(--color-primary,#e94560)] text-gray-900 dark:text-white"
            />
          </div>

          {!loadingAllProducts && filteredModalProducts.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[var(--color-primary,#e94560)] focus:ring-[var(--color-primary,#e94560)] h-4 w-4 cursor-pointer"
                  checked={filteredModalProducts.length > 0 && modalSelectedProductIds.length === filteredModalProducts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setModalSelectedProductIds(filteredModalProducts.map(p => p.id));
                    } else {
                      setModalSelectedProductIds([]);
                    }
                  }}
                />
                Select All ({filteredModalProducts.length})
              </label>

              {modalSelectedProductIds.length > 0 && (
                <button
                  type="button"
                  onClick={onBulkAddProducts}
                  disabled={addingProductId === 'bulk'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--color-primary,#e94560)] text-white hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
                >
                  {addingProductId === 'bulk' ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0" />
                  )}
                  Add Selected ({modalSelectedProductIds.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-2.5 touch-pan-y scroll-smooth custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loadingAllProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary,#e94560)]" />
            </div>
          ) : filteredModalProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs sm:text-sm">
              No products available to add.
            </div>
          ) : (
            filteredModalProducts.map(prod => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-gray-150 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-[#1d1d36]/30 transition-all gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[var(--color-primary,#e94560)] focus:ring-[var(--color-primary,#e94560)] h-4 w-4 cursor-pointer shrink-0"
                    checked={modalSelectedProductIds.includes(prod.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setModalSelectedProductIds(prev => [...prev, prod.id]);
                      } else {
                        setModalSelectedProductIds(prev => prev.filter(id => id !== prod.id));
                      }
                    }}
                  />
                  <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-800 shrink-0">
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
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">{prod.name}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-mono mt-0.5 truncate">
                      {prod.sku || 'No SKU'} | Rs. {prod.price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAddProduct(prod.id)}
                  disabled={addingProductId === prod.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary,#e94560)]/10 hover:bg-[var(--color-primary,#e94560)]/20 text-[var(--color-primary,#e94560)] transition-all disabled:opacity-50 cursor-pointer shrink-0 active:scale-95"
                >
                  {addingProductId === prod.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 shrink-0" />
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

  return createPortal(modalContent, document.body);
}
