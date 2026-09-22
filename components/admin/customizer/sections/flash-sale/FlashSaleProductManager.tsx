import React, { useState } from 'react';
import { Product, HomepageSection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface FlashSaleProductManagerProps {
  section: HomepageSection;
  products: Product[];
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function FlashSaleProductManager({
  section,
  products,
  onUpdateSection,
}: FlashSaleProductManagerProps) {
  const contentData = section.content_data || {};
  const fsProducts = contentData.products || [];

  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountValue, setDiscountValue] = useState('');

  const handleProductsChange = (updatedProducts: any[]) => {
    onUpdateSection({
      content_data: { ...contentData, products: updatedProducts }
    });
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (fsProducts.some((p: any) => p.productId === selectedProductId)) {
      return;
    }

    const price = parseFloat(discountValue) || prod.price;
    const updated = [
      ...fsProducts,
      {
        productId: selectedProductId,
        discountValue: price
      }
    ];

    handleProductsChange(updated);
    setSelectedProductId('');
    setDiscountValue('');
  };

  const handleUpdateProductPrice = (productId: string, val: number) => {
    const updated = fsProducts.map((p: any) =>
      p.productId === productId ? { ...p, discountValue: val } : p
    );
    handleProductsChange(updated);
  };

  const handleRemoveProduct = (productId: string) => {
    const updated = fsProducts.filter((p: any) => p.productId !== productId);
    handleProductsChange(updated);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fsProducts.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fsProducts];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    handleProductsChange(updated);
  };

  const availableProducts = products.filter(
    p => !fsProducts.some((fsp: any) => fsp.productId === p.id)
  );

  return (
    <div className="space-y-4">
      {/* INDIVIDUAL PRODUCT MANAGER */}
      <div className="border border-gray-200 dark:border-gray-800 p-3.5 rounded-2xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">
          Add Specific Products
        </span>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400">Select Product</label>
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white"
          >
            <option value="">-- Choose Product --</option>
            {availableProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatPrice(p.price)})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400">Flash Sale Price (Rs.)</label>
          <input
            type="number"
            value={discountValue}
            onChange={e => setDiscountValue(e.target.value)}
            placeholder="e.g., 750"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          disabled={!selectedProductId}
          className="w-full py-1.5 bg-[#e94560] hover:bg-[#d83550] disabled:bg-gray-200 disabled:dark:bg-gray-800 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      {/* Selected Products with Up/Down Sorting */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
          Individual Flash Sale Products ({fsProducts.length})
        </label>
        
        {fsProducts.length === 0 ? (
          <p className="text-xs text-gray-500">No products added to flash sale yet.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {fsProducts.map((fsp: any, idx: number) => {
              const prod = products.find(p => p.id === fsp.productId);
              if (!prod) return null;

              return (
                <div
                  key={fsp.productId}
                  className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl relative group"
                >
                  {/* Sorting controls */}
                  <div className="flex items-center gap-0.5 border border-gray-100 dark:border-gray-800 rounded-lg p-0.5 bg-gray-50 dark:bg-white/5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveProduct(idx, 'up')}
                      className="text-gray-400 hover:text-[#e94560] disabled:opacity-20 transition-opacity p-0.5 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveProduct(idx, 'up')}
                      className="text-gray-400 hover:text-[#e94560] disabled:opacity-20 transition-opacity p-0.5 cursor-pointer"
                      title="Move left"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fsProducts.length - 1}
                      onClick={() => handleMoveProduct(idx, 'down')}
                      className="text-gray-400 hover:text-[#e94560] disabled:opacity-20 transition-opacity p-0.5 cursor-pointer"
                      title="Move right"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fsProducts.length - 1}
                      onClick={() => handleMoveProduct(idx, 'down')}
                      className="text-gray-400 hover:text-[#e94560] disabled:opacity-20 transition-opacity p-0.5 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {prod.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Original: {formatPrice(prod.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <label className="text-[9px] text-gray-400 whitespace-nowrap">Sale</label>
                    <input
                      type="number"
                      value={fsp.discountValue || ''}
                      onChange={e => handleUpdateProductPrice(fsp.productId, parseFloat(e.target.value) || 0)}
                      className="w-16 px-1.5 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(fsp.productId)}
                    className="p-1 hover:text-red-500 text-gray-400 transition-colors cursor-pointer"
                    title="Remove product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
