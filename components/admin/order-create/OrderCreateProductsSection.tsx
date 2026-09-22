'use client';

import React from 'react';
import { Search, Loader2, X, Trash2 } from '@/components/common/Icons';
import { Product, CartItem, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';

interface OrderCreateProductsSectionProps {
  isAddingCustom: boolean;
  setIsAddingCustom: React.Dispatch<React.SetStateAction<boolean>>;
  customItemName: string;
  setCustomItemName: (v: string) => void;
  customItemPrice: string;
  setCustomItemPrice: (v: string) => void;
  customItemQuantity: string;
  setCustomItemQuantity: (v: string) => void;
  handleAddCustomItem: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  isLoadingProducts: boolean;
  filteredProducts: Product[];
  handleProductSelect: (product: Product) => void;
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  chosenSize: string;
  setChosenSize: (v: string) => void;
  chosenColor: string;
  setChosenColor: (v: string) => void;
  setChosenVariantId: (v: string) => void;
  customUnitPrice: string;
  setCustomUnitPrice: (v: string) => void;
  chosenQuantity: string;
  setChosenQuantity: (v: string) => void;
  handleAddItem: () => void;
  selectedItems: CartItem[];
  handleRemoveItem: (id: string) => void;
  settings: StoreSettings;
}

export function OrderCreateProductsSection({
  isAddingCustom,
  setIsAddingCustom,
  customItemName,
  setCustomItemName,
  customItemPrice,
  setCustomItemPrice,
  customItemQuantity,
  setCustomItemQuantity,
  handleAddCustomItem,
  searchQuery,
  setSearchQuery,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  isLoadingProducts,
  filteredProducts,
  handleProductSelect,
  selectedProduct,
  setSelectedProduct,
  chosenSize,
  setChosenSize,
  chosenColor,
  setChosenColor,
  setChosenVariantId,
  customUnitPrice,
  setCustomUnitPrice,
  chosenQuantity,
  setChosenQuantity,
  handleAddItem,
  selectedItems,
  handleRemoveItem,
  settings,
}: OrderCreateProductsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Products & Items</span>
        <button
          type="button"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="text-xs font-bold text-[#e94560] hover:underline"
        >
          {isAddingCustom ? 'Search catalog' : 'Add custom item'}
        </button>
      </div>

      {isAddingCustom ? (
        <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase">New Custom Item Details</div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Item title (e.g. customized black shirt)"
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Price (PKR)"
                value={customItemPrice}
                onChange={(e) => setCustomItemPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={customItemQuantity}
                onChange={(e) => setCustomItemQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddCustomItem}
            className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Add Custom Item to Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search store catalog by product title/SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 py-1 text-xs">
                {isLoadingProducts ? (
                  <div className="py-3 text-center text-gray-400 flex items-center justify-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin text-[#e94560]" />
                    Loading...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-3 text-center text-gray-400">No products found</div>
                ) : (
                  filteredProducts.map(prod => {
                    const primaryImage = prod.images?.find((img: any) => img.isPrimary) || prod.images?.[0];
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleProductSelect(prod)}
                        className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            {primaryImage?.url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={primaryImage.url}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[8px] text-gray-400 font-bold flex items-center justify-center h-full w-full">N/A</span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white truncate">{prod.name}</span>
                        </div>
                        <span className="text-gray-400 font-bold flex-shrink-0">{formatPrice(prod.price, settings.currencySymbol)}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 dark:bg-gray-900/60 p-3 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedProduct.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedProduct.hasVariants && (
                <div className="space-y-3 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Select Options:</span>

                  {Array.from(new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))).length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-500">Size:</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))).map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setChosenSize(size || '');
                              const matched = selectedProduct.variants.find(v => v.size === size && (!chosenColor || v.color === chosenColor));
                              if (matched) {
                                setChosenVariantId(matched.id);
                                setCustomUnitPrice(matched.price !== undefined ? matched.price.toString() : selectedProduct.price.toString());
                              }
                            }}
                            className={`px-2 py-0.5 text-xs font-bold rounded border ${chosenSize === size
                                ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-200'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.from(new Set(selectedProduct.variants.map(v => v.color).filter(Boolean))).length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-500">Color:</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(selectedProduct.variants.map(v => v.color).filter(Boolean))).map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setChosenColor(color || '');
                              const matched = selectedProduct.variants.find(v => v.color === color && (!chosenSize || v.size === chosenSize));
                              if (matched) {
                                setChosenVariantId(matched.id);
                                setCustomUnitPrice(matched.price !== undefined ? matched.price.toString() : selectedProduct.price.toString());
                              }
                            }}
                            className={`px-2 py-0.5 text-xs font-bold rounded border ${chosenColor === color
                                ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-200'
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Negotiated Price</label>
                  <input
                    type="number"
                    value={customUnitPrice}
                    onChange={(e) => setCustomUnitPrice(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    value={chosenQuantity}
                    onChange={(e) => setChosenQuantity(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white rounded"
                    min="1"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-1.5 bg-[#e94560] hover:bg-[#d83f56] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Add Selection to Order
              </button>
            </div>
          )}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 dark:border-gray-800/60 pt-4">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider block">Order Items List</span>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-800 rounded-lg text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{item.product.name}</div>
                  {item.selectedVariant && (
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      {item.selectedVariant.size && `Size: ${item.selectedVariant.size}`}
                      {item.selectedVariant.color && ` | Color: ${item.selectedVariant.color}`}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {item.quantity} x {formatPrice(item.unitPrice, settings.currencySymbol)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(item.total, settings.currencySymbol)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
