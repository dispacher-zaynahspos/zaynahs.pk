'use client';

import React from 'react';
import { Product, StoreSettings } from '@/lib/types';
import EmptyState from '@/components/common/EmptyState';
import TableThumbnail from '@/components/admin/TableThumbnail';
import { Package, Edit, Trash2, RefreshCw, Loader2 } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface ProductListTableProps {
  filteredProducts: Product[];
  paginatedProducts: Product[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  settings: StoreSettings;
  syncingProductId: string | null;
  setPreviewImageUrl: (url: string | null) => void;
  handleToggleActive: (product: Product) => void;
  handleToggleFeatured: (product: Product) => void;
  handleSingleSync: (productId: string) => void;
  handleEditProduct: (productId: string, allFiltered: Product[]) => void;
  handleDelete: (id: string) => void;
}

export default function ProductListTable({
  filteredProducts,
  paginatedProducts,
  selectedProductIds,
  setSelectedProductIds,
  settings,
  syncingProductId,
  setPreviewImageUrl,
  handleToggleActive,
  handleToggleFeatured,
  handleSingleSync,
  handleEditProduct,
  handleDelete,
}: ProductListTableProps) {
  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
        <EmptyState 
          icon={<Package className="h-8 w-8 text-gray-400" />}
          title="No products found" 
          description="No products found matching your criteria." 
        />
      </div>
    );
  }

  const fallbackPlaceholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E";

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-wider bg-gray-50/80 dark:bg-white/2 border-b border-gray-100 dark:border-gray-800 select-none">
              <tr>
                <th className="py-3 px-4 md:py-3.5 md:px-6 w-12 text-center">
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
                    className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer accent-[#e94560]"
                  />
                </th>
                <th className="py-3 px-4 md:py-3.5 md:px-6">Product</th>
                <th className="py-3 px-4 md:py-3.5 md:px-6 hidden md:table-cell">SKU</th>
                <th className="py-3 px-4 md:py-3.5 md:px-6">Price</th>
                <th className="py-3 px-4 md:py-3.5 md:px-6 hidden md:table-cell">Stock Level</th>
                <th className="py-3 px-4 md:py-3.5 md:px-6 hidden md:table-cell text-center">Visible</th>
                <th className="py-3 px-4 md:py-3.5 md:px-6 hidden md:table-cell text-center">Featured</th>
                {settings.meta_sync_enabled && <th className="py-3 px-4 md:py-3.5 md:px-6 hidden md:table-cell">Meta Sync</th>}
                <th className="py-3 px-4 md:py-3.5 md:px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
              {paginatedProducts.map(product => {
                const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || fallbackPlaceholder;
                const isSyncing = syncingProductId === product.id;
                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors ${selectedProductIds.includes(product.id) ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}
                  >
                    <td className="py-3.5 px-4 md:px-6 w-12 text-center">
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
                        className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer accent-[#e94560]"
                      />
                    </td>
                    <td className="py-3.5 px-4 md:px-6 flex items-center gap-2.5 md:gap-3">
                      <TableThumbnail 
                        url={primaryImage} 
                        alt={product.name} 
                        onPreview={setPreviewImageUrl} 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-900 dark:text-white text-xs md:text-sm max-w-[180px] lg:max-w-[400px] line-clamp-1">
                            {product.name}
                          </p>
                        </div>
                        {product.productCategories && product.productCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {product.productCategories.map((pc) => pc.category ? (
                              <span key={pc.categoryId} className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50/70 dark:bg-indigo-950/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 leading-tight">
                                {pc.category.name}
                              </span>
                            ) : null)}
                          </div>
                        ) : product.category ? (
                          <span className="text-[10px] font-bold text-gray-400 ml-0.5">{product.category.name}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[11px]">
                        {product.sku || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 font-black text-gray-900 dark:text-white text-xs md:text-sm whitespace-nowrap">
                      {formatPrice(product.price, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 md:px-6 font-semibold text-xs hidden md:table-cell">
                      {product.hasVariants && product.variants ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                          Variants ({product.variants.reduce((sum, v) => sum + v.stock, 0)})
                        </span>
                      ) : product.stock === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 whitespace-nowrap">
                          Out of stock
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          Low: {product.stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          {product.stock} in stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 md:px-6 hidden md:table-cell text-center">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.isActive ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                          }`}
                          role="switch"
                          aria-checked={product.isActive}
                          title={product.isActive ? 'Visible on store' : 'Hidden from store'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              product.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 hidden md:table-cell text-center">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.isFeatured ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-800'
                          }`}
                          role="switch"
                          aria-checked={product.isFeatured}
                          title={product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              product.isFeatured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    {settings.meta_sync_enabled && (
                      <td className="py-3.5 px-4 md:px-6 hidden md:table-cell">
                        {product.meta_sync_status === 'synced' ? (
                          <span suppressHydrationWarning={true} className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" title={product.meta_last_synced_at ? `Synced at: ${new Date(product.meta_last_synced_at).toLocaleString()}` : 'Synced'}>🟢 Synced</span>
                        ) : product.meta_sync_status === 'error' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 cursor-help" title={product.meta_sync_error || 'Sync failed'}>🔴 Error</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">🟡 Pending</span>
                        )}
                      </td>
                    )}
                    <td className="py-3.5 px-4 md:px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        {settings.meta_sync_enabled && (
                          <button 
                            type="button"
                            onClick={() => handleSingleSync(product.id)} 
                            disabled={isSyncing}
                            className="p-2 rounded-xl border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer" 
                            title="Force Meta Sync"
                          >
                            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => handleEditProduct(product.id, filteredProducts)}
                          className="p-2 rounded-xl border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer" 
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-xl border border-gray-200/80 dark:border-gray-800/80 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all cursor-pointer" 
                          title="Move to Trash"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Products Select All Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-50/70 dark:bg-white/2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
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
            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer accent-[#e94560]"
            id="select-all-products-mobile"
          />
          <label htmlFor="select-all-products-mobile" className="text-xs font-black text-gray-800 dark:text-gray-200 select-none cursor-pointer">
            Select All Products
          </label>
        </div>
      </div>

      {/* Mobile Products Cards */}
      <div className="md:hidden space-y-3 p-4">
        {paginatedProducts.map(product => {
          const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || fallbackPlaceholder;
          const isSyncing = syncingProductId === product.id;
          return (
            <div 
              key={product.id} 
              className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3 transition-all"
            >
              <div className="flex items-start gap-3">
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
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer mt-1 flex-shrink-0 accent-[#e94560]"
                />
                <TableThumbnail 
                  url={primaryImage} 
                  alt={product.name} 
                  onPreview={setPreviewImageUrl} 
                  className="h-12 w-12"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate flex-1 line-clamp-1">{product.name}</h3>
                    <span className="text-sm font-black text-gray-900 dark:text-white flex-shrink-0">{formatPrice(product.price, settings.currencySymbol)}</span>
                  </div>
                  {product.productCategories && product.productCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.productCategories.map((pc) => pc.category ? (
                        <span key={pc.categoryId} className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {pc.category.name}
                        </span>
                      ) : null)}
                    </div>
                  ) : product.category ? (
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{product.category.name}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(product)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        product.isActive ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                      }`}
                      role="switch"
                      aria-checked={product.isActive}
                      title={product.isActive ? 'Visible on store' : 'Hidden from store'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          product.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      {product.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        product.isFeatured ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-800'
                      }`}
                      role="switch"
                      aria-checked={product.isFeatured}
                      title={product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          product.isFeatured ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      {product.isFeatured ? 'Featured' : 'Not Featured'}
                    </span>
                  </div>

                  {settings.meta_sync_enabled && (
                    product.meta_sync_status === 'synced' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">🟢 Synced</span>
                    ) : product.meta_sync_status === 'error' ? (
                      <span className="text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">🔴 Error</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">🟡 Pending</span>
                    )
                  )}
                </div>

                <span className="text-gray-400 font-mono text-[10px]">{product.sku || 'No SKU'}</span>
              </div>

              <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-800/80">
                {settings.meta_sync_enabled && (
                  <button 
                    type="button"
                    onClick={() => handleSingleSync(product.id)} 
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl border border-gray-200/80 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />}
                    <span>Sync</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => handleEditProduct(product.id, filteredProducts)}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl border border-gray-200/80 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 text-blue-500" />
                  <span>Edit</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[38px] rounded-xl border border-gray-200/80 dark:border-gray-800/80 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
