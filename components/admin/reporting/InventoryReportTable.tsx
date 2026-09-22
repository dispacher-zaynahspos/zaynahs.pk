'use client';

import React from 'react';
import { Package } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { InventoryItem } from './types';

interface InventoryReportTableProps {
  inventoryData: InventoryItem[];
  currencySymbol: string;
}

export default function InventoryReportTable({ inventoryData, currencySymbol }: InventoryReportTableProps) {
  if (inventoryData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800/80">
        <Package className="h-4.5 w-4.5 text-gray-400" />
        <h3 className="text-sm font-black text-gray-900 dark:text-white">Inventory Report</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <th className="py-3">Product</th>
              <th className="py-3 text-center">Variants</th>
              <th className="py-3 text-right">Stock Units</th>
              <th className="py-3 text-right">Cost Value</th>
              <th className="py-3 text-right">Sale Value</th>
              <th className="py-3 text-right">Potential Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 font-semibold text-gray-700 dark:text-gray-300">
            {inventoryData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-white/2 transition-colors">
                <td className="py-3 font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{item.name}</td>
                <td className="py-3 text-center text-gray-500">{item.variants}</td>
                <td className="py-3 text-right font-bold">{item.stockUnits}</td>
                <td className="py-3 text-right text-gray-500">{formatPrice(item.costValue, currencySymbol)}</td>
                <td className="py-3 text-right font-black text-gray-900 dark:text-white">{formatPrice(item.saleValue, currencySymbol)}</td>
                <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">{formatPrice(item.potentialProfit, currencySymbol)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 dark:border-gray-700">
            <tr className="font-black text-gray-900 dark:text-white text-xs">
              <td className="py-3">Total ({inventoryData.length} products)</td>
              <td></td>
              <td className="py-3 text-right">{inventoryData.reduce((s, i) => s + i.stockUnits, 0)}</td>
              <td className="py-3 text-right">{formatPrice(inventoryData.reduce((s, i) => s + i.costValue, 0), currencySymbol)}</td>
              <td className="py-3 text-right">{formatPrice(inventoryData.reduce((s, i) => s + i.saleValue, 0), currencySymbol)}</td>
              <td className="py-3 text-right text-emerald-600">{formatPrice(inventoryData.reduce((s, i) => s + i.potentialProfit, 0), currencySymbol)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
