'use client';

import React from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getSwatchStyle } from '@/lib/utils/swatch';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit,
  GripVertical,
  Trash2,
  PackageOpen,
  Loader2
} from '@/components/common/Icons';

interface CategoryProductsTableProps {
  products: Product[];
  paginatedProducts: Product[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  sortBy: string;
  draggingId: string | null;
  expandedProducts: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  handleDragStart: (e: React.DragEvent, idx: number) => void;
  handleDragOver: (e: React.DragEvent, idx: number) => void;
  handleDrop: () => void;
  handleDragEnd: () => void;
  moveProduct: (id: string, dir: 'up' | 'down') => void;
  handleEditProduct: (id: string, filtered: Product[]) => void;
  handleRemoveProduct: (id: string) => void;
  handleUpdateProduct: (id: string, fields: Partial<Product>) => void;
  handleUpdateVariant: (prodId: string, varId: string, fields: Partial<ProductVariant>) => void;
  updatingIds: Record<string, boolean>;
  setPreviewImageUrl: (url: string | null) => void;
}

export function CategoryProductsTable({
  products,
  paginatedProducts,
  selectedProductIds,
  setSelectedProductIds,
  sortBy,
  draggingId,
  expandedProducts,
  toggleExpand,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  moveProduct,
  handleEditProduct,
  handleRemoveProduct,
  handleUpdateProduct,
  handleUpdateVariant,
  updatingIds,
  setPreviewImageUrl
}: CategoryProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="p-16 text-center">
        <PackageOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Products Found</h3>
        <p className="text-sm text-gray-400 mt-1">There are no products in this category matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-[#0f0f1b] border-b border-gray-200 dark:border-gray-800 font-bold uppercase text-[10px] tracking-wider text-gray-500">
            <tr>
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(paginatedProducts.map(p => p.id));
                    } else {
                      setSelectedProductIds([]);
                    }
                  }}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                />
              </th>
              {sortBy === 'manual' && (
                <>
                  <th className="py-3.5 px-2 w-10 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">Rank</th>
                  <th className="py-3.5 px-2 w-14 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">Sort</th>
                </>
              )}
              <th className="py-3.5 px-4 w-10"></th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Compare Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedProducts.map((product, index) => {
              const isExpanded = expandedProducts[product.id] ?? false;

              return (
                <React.Fragment key={product.id}>
                  <tr
                    className={`transition-all duration-200 ease-in-out ${draggingId === product.id ? 'opacity-50 bg-orange-50/50 dark:bg-orange-950/20' : 'hover:bg-gray-50/50 dark:hover:bg-[#1d1d36]/30'}`}
                  >
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds(prev => [...prev, product.id]);
                          } else {
                            setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                          }
                        }}
                        className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                      />
                    </td>
                    {sortBy === 'manual' && (
                      <td className="py-4 px-2 w-10 text-center">
                        <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                      </td>
                    )}
                    {sortBy === 'manual' && (
                      <td className="py-4 px-2 w-14 align-middle">
                        <div
                          className="flex flex-col items-center gap-0.5"
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                        >
                          <button
                            type="button"
                            onClick={() => moveProduct(product.id, 'up')}
                            disabled={products.findIndex(p => p.id === product.id) === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <span className="p-0.5 text-gray-400 cursor-grab active:cursor-grabbing touch-none select-none">
                            <GripVertical className="h-3.5 w-3.5" />
                          </span>
                          <button
                            type="button"
                            onClick={() => moveProduct(product.id, 'down')}
                            disabled={products.findIndex(p => p.id === product.id) === products.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4 text-center">
                      {product.hasVariants ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(product.id)}
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#252542] transition-all"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : null}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 flex-shrink-0"
                          onClick={() => product.images?.[0] && setPreviewImageUrl(product.images[0].url)}
                        >
                          {product.images?.[0] ? (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold">NO IMG</div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer" onClick={() => handleEditProduct(product.id, products)}>
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>SKU: {product.sku || 'N/A'}</span>
                            {product.hasVariants && (
                              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {product.variants?.length || 0} variants
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                      Rs. {formatPrice(product.price)}
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-400">
                      {product.comparePrice ? `Rs. ${formatPrice(product.comparePrice)}` : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock > 10 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        product.stock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product.id, products)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[#252542] rounded-lg transition-all"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-[#252542] rounded-lg transition-all"
                          title="Remove from category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Variants Row */}
                  {isExpanded && product.hasVariants && product.variants && product.variants.length > 0 && (
                    <tr className="bg-gray-50/70 dark:bg-[#121225]/50">
                      <td colSpan={sortBy === 'manual' ? 9 : 7} className="p-4 pl-12">
                        <div className="space-y-2 border-l-2 border-primary/30 pl-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Variants</div>
                          <div className="grid grid-cols-1 gap-2">
                            {product.variants.map((v) => (
                              <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#18182f] border border-gray-200 dark:border-gray-800 text-xs">
                                <div className="flex items-center gap-3">
                                  {v.color && (
                                    <div
                                      className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                                      style={getSwatchStyle(v.color)}
                                    />
                                  )}
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {[v.color, v.size, v.material, v.customValue].filter(Boolean).join(' / ') || 'Default'}
                                  </span>
                                  {v.sku && <span className="font-mono text-gray-400 text-[11px]">{v.sku}</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-mono font-semibold text-gray-900 dark:text-white">Rs. {formatPrice(v.price)}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    v.stock > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                  }`}>
                                    {v.stock} in stock
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
