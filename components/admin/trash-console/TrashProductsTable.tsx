'use client';

import React from 'react';
import { ShoppingBag, RefreshCw, Trash2 } from '@/components/common/Icons';
import { Product } from '@/lib/types';
import EmptyState from '@/components/common/EmptyState';

interface TrashProductsTableProps {
  products: Product[];
  searchTerm: string;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  handleRestore: (id: string, type: 'products') => void;
  setConfirmDelete: (val: any) => void;
  isPending: boolean;
}

export const TrashProductsTable: React.FC<TrashProductsTableProps> = ({
  products,
  searchTerm,
  selectedIds,
  toggleSelect,
  handleRestore,
  setConfirmDelete,
  isPending,
}) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No trashed products"
        description={searchTerm ? "No products matching your search term." : "Your trash bin is clean of products."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map(product => {
          const primaryImg = product.images?.find(i => i.isPrimary) || product.images?.[0];
          const isSelected = selectedIds.includes(product.id);
          return (
            <div
              key={product.id}
              className={`bg-white dark:bg-[#16162a] p-4 rounded-2xl border shadow-sm flex flex-col space-y-3 transition-colors ${
                isSelected ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/5' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(product.id)}
                  className="h-4.5 w-4.5 rounded-md border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-850 flex-shrink-0">
                  {primaryImg ? (
                    <img
                      src={primaryImg.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <ShoppingBag className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-450 truncate">
                    SKU: {product.sku || 'N/A'} | Price: PKR {product.price}
                  </p>
                  {product.deletedAt && (
                    <p suppressHydrationWarning={true} className="text-[10px] text-gray-400 mt-0.5">
                      Deleted: {new Date(product.deletedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-gray-800/50">
                <button
                  onClick={() => handleRestore(product.id, 'products')}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: product.id, type: 'products', name: product.name })}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-gray-850/50">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={products.length > 0 && products.every(p => selectedIds.includes(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) toggleSelect(products[0]?.id);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
              </th>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Deleted Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {products.map(product => {
              const primaryImg = product.images?.find(i => i.isPrimary) || product.images?.[0];
              const isSelected = selectedIds.includes(product.id);
              return (
                <tr key={product.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors ${isSelected ? 'bg-[#e94560]/5 dark:bg-[#e94560]/5' : ''}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(product.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                        {primaryImg ? (
                          <img src={primaryImg.url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{product.sku || '—'}</td>
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">PKR {product.price}</td>
                  <td className="p-4 text-gray-400 text-xs" suppressHydrationWarning={true}>
                    {product.deletedAt ? new Date(product.deletedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleRestore(product.id, 'products')}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: product.id, type: 'products', name: product.name })}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
