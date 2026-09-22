import React from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { Search, Download, Loader2 } from '@/components/common/Icons';

interface ExportTabContentProps {
  products: Product[];
  filteredProducts: Product[];
  exportSearch: string;
  setExportSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: { slug: string; name: string }[];
  selectedIds: Set<string>;
  allFilteredSelected: boolean;
  onToggleSelectProduct: (id: string) => void;
  onToggleSelectAllFiltered: () => void;
  onExport: () => void;
  onClose: () => void;
  isExporting: boolean;
}

export default function ExportTabContent({
  products,
  filteredProducts,
  exportSearch,
  setExportSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedIds,
  allFilteredSelected,
  onToggleSelectProduct,
  onToggleSelectAllFiltered,
  onExport,
  onClose,
  isExporting,
}: ExportTabContentProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={exportSearch}
            onChange={e => setExportSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e94560] dark:text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="sm:w-48 px-3 py-2 text-sm bg-gray-50 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e94560] dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.filter(cat => cat.slug !== 'shop').map(cat => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Checklist */}
      <div className="flex-1 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col bg-gray-50/20 dark:bg-[#14142a]/30">
        <div className="flex items-center px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={onToggleSelectAllFiltered}
            className="w-4.5 h-4.5 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer mr-4"
          />
          <span className="flex-1">Product Details</span>
          <span className="w-24 text-right">Price</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No products found matching criteria.</p>
            </div>
          ) : (
            filteredProducts.map(p => {
              const isSelected = selectedIds.has(p.id);
              const primaryImage = p.images?.find(img => img.isPrimary) || p.images?.[0];
              return (
                <div 
                  key={p.id}
                  onClick={() => onToggleSelectProduct(p.id)}
                  className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all ${
                    isSelected ? 'bg-gray-50/30 dark:bg-gray-800/10' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // toggled by row click
                    className="w-4.5 h-4.5 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer mr-4"
                  />
                  
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {primaryImage?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryImage.url}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-400">
                        None
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        {p.category ? (
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            {p.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">No Category</span>
                        )}
                        {p.sku && <span>• SKU: {p.sku}</span>}
                        <span>• {p.variants?.length ? `${p.variants.length} Variants` : 'No variants'}</span>
                      </p>
                    </div>
                  </div>

                  <span className="w-24 text-right text-sm font-bold text-gray-900 dark:text-white">
                    {formatPrice(p.price)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary and Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
          {selectedIds.size} of {products.length} product(s) selected
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={selectedIds.size === 0 || isExporting}
            className="flex items-center gap-2 bg-[#e94560] hover:bg-[#d63d56] text-white font-semibold text-sm rounded-xl px-5 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Selected ({selectedIds.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
