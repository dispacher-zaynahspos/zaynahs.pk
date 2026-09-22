'use client';

import React from 'react';
import { ShoppingBag } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { TopProduct } from './types';

interface TopProductsSectionProps {
  topProducts: TopProduct[];
  currencySymbol: string;
}

export default function TopProductsSection({ topProducts, currencySymbol }: TopProductsSectionProps) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/80">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4.5 w-4.5 text-gray-400" />
          <h3 className="text-sm font-black text-gray-900 dark:text-white">Top Products</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase">By Revenue</span>
      </div>

      {topProducts.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">No items sold in the selected period.</div>
      ) : (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <th className="py-3">Product</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Revenue</th>
                <th className="py-3 text-right">Cost</th>
                <th className="py-3 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 font-semibold text-gray-700 dark:text-gray-300">
              {topProducts.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-gray-50/30 dark:hover:bg-white/2 transition-colors">
                  <td className="py-3 font-bold text-gray-900 dark:text-white truncate max-w-xs">{p.name}</td>
                  <td className="py-3 text-center font-bold">{p.qty}</td>
                  <td className="py-3 text-right font-black text-gray-900 dark:text-white">{formatPrice(p.sales, currencySymbol)}</td>
                  <td className="py-3 text-right text-gray-500">{formatPrice(p.cost, currencySymbol)}</td>
                  <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-black">{formatPrice(p.profit, currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="md:hidden space-y-3">
        {topProducts.map((p, idx) => (
          <div key={p.id || idx} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-2">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">{p.name}</span>
              <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 text-[9px] font-bold text-gray-700 dark:text-gray-300">Qty: {p.qty}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-100/50 dark:border-gray-800/50">
              <div><span className="text-[9px] font-bold text-gray-400 block">Revenue</span><span className="font-extrabold text-gray-900 dark:text-white">{formatPrice(p.sales, currencySymbol)}</span></div>
              <div><span className="text-[9px] font-bold text-gray-400 block">Cost</span><span className="font-extrabold text-gray-500">{formatPrice(p.cost, currencySymbol)}</span></div>
              <div className="text-right"><span className="text-[9px] font-bold text-gray-400 block">Profit</span><span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatPrice(p.profit, currencySymbol)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
