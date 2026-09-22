import React, { useMemo } from 'react';
import { Product, ProductVariant, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { Search, Plus, X } from '@/components/common/Icons';

interface OrderProductSearchProps {
  products: Product[];
  settings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddProduct: (product: Product, variant?: ProductVariant) => void;
}

export default function OrderProductSearch({
  products,
  settings,
  searchQuery,
  setSearchQuery,
  onAddProduct,
}: OrderProductSearchProps) {
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQ = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQ) || 
      (p.sku && p.sku.toLowerCase().includes(lowerQ)) ||
      (p.variants && p.variants.some(v => 
        (v.sku && v.sku.toLowerCase().includes(lowerQ)) ||
        (v.color && v.color.toLowerCase().includes(lowerQ)) ||
        (v.size && v.size.toLowerCase().includes(lowerQ)) ||
        (v.material && v.material.toLowerCase().includes(lowerQ)) ||
        (v.customValue && v.customValue.toLowerCase().includes(lowerQ))
      ))
    ).slice(0, 10);
  }, [searchQuery, products]);

  return (
    <div className="relative mt-2">
      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-gray-50/50 dark:bg-gray-800/50 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-shadow">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input 
          type="text"
          placeholder="Search products to add..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 p-0"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md cursor-pointer">
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {/* Search Dropdown Results */}
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No products found</div>
          ) : (
            <div className="py-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <button 
                    type="button"
                    onClick={() => onAddProduct(product)}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={product.images[0].url} className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700" alt="" />
                      ) : <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800" />}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {product.name}
                        </span>
                        {product.hasVariants && product.variants && product.variants.length > 0 && (
                          <span className="text-xs text-gray-400">
                            {product.variants.length} variations
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price, settings.currencySymbol)}
                      </span>
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
