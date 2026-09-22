import React from 'react';
import { StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { Tag, Truck } from '@/components/common/Icons';

interface OrderFinancialSummaryProps {
  subtotal: number;
  total: number;
  settings: StoreSettings;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountType: 'fixed' | 'percentage';
  setDiscountType: (type: 'fixed' | 'percentage') => void;
  discountAmount: number;
  setDiscountAmount: (amt: number) => void;
  discountPercent: number;
  setDiscountPercent: (pct: number) => void;
  shippingAmount: number;
  setShippingAmount: (amt: number) => void;
}

export default function OrderFinancialSummary({
  subtotal,
  total,
  settings,
  discountCode,
  setDiscountCode,
  discountType,
  setDiscountType,
  discountAmount,
  setDiscountAmount,
  discountPercent,
  setDiscountPercent,
  shippingAmount,
  setShippingAmount,
}: OrderFinancialSummaryProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/30 -mx-5 -mb-5 px-5 py-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
        <span className="font-bold text-gray-900 dark:text-white">{formatPrice(subtotal, settings.currencySymbol)}</span>
      </div>
      
      <div className="flex justify-between items-center text-sm gap-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
          <Tag className="w-4 h-4" /> Discount
          <input 
            type="text"
            placeholder="Code (optional)"
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value)}
            className="w-28 text-xs px-2 py-1 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <select 
            value={discountType}
            onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')}
            className="text-xs bg-transparent border-none text-gray-500 focus:ring-0 p-0 pr-4"
          >
            <option value="fixed">{settings.currencySymbol}</option>
            <option value="percentage">%</option>
          </select>
          <input 
            type="number" 
            min="0"
            value={discountType === 'percentage' ? discountPercent || '' : discountAmount || ''}
            onChange={e => {
              const val = parseFloat(e.target.value) || 0;
              if (discountType === 'percentage') {
                setDiscountPercent(val);
              } else {
                setDiscountAmount(val);
              }
            }}
            className="w-20 text-right px-2 py-1 text-sm bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-700 rounded-md font-bold focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-sm gap-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
          <Truck className="w-4 h-4" /> Shipping
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">+ {settings.currencySymbol}</span>
          <input 
            type="number" 
            min="0"
            value={shippingAmount || ''}
            onChange={e => setShippingAmount(parseFloat(e.target.value) || 0)}
            className="w-20 text-right px-2 py-1 text-sm bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-700 rounded-md font-bold focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
        <span className="font-bold text-gray-900 dark:text-white">Total</span>
        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
          {formatPrice(total, settings.currencySymbol)}
        </span>
      </div>
    </div>
  );
}
