'use client';

import React from 'react';
import { ShoppingBag } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface TopProductItem {
  id: string;
  name: string;
  qty: number;
  sales: number;
  cost: number;
  profit: number;
}

interface TopProductsSectionProps {
  topProducts: TopProductItem[];
  currencySymbol: string;
}

export default function TopProductsSection({
  topProducts,
  currencySymbol,
}: TopProductsSectionProps) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 md:p-6 space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Top Products</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-800">
            By Revenue
          </span>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 font-medium">
            No items sold in the selected period.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-2 w-10 text-center">#</th>
                    <th className="py-3 px-2">Product</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-2 text-right">Revenue</th>
                    <th className="py-3 px-2 text-right">Cost</th>
                    <th className="py-3 px-2 text-right">Profit</th>
                    <th className="py-3 px-2 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 font-semibold text-gray-700 dark:text-gray-300">
                  {topProducts.map((p, idx) => {
                    const margin = p.sales > 0 ? (p.profit / p.sales) * 100 : 0;
                    return (
                      <tr key={p.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-black ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300/40'
                              : idx === 1
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/40'
                              : idx === 2
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-300/40'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={p.name}>
                          {p.name}
                        </td>
                        <td className="py-3 px-2 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[11px]">
                            {p.qty}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-black text-gray-900 dark:text-white">
                          {formatPrice(p.sales, currencySymbol)}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400">
                          {formatPrice(p.cost, currencySymbol)}
                        </td>
                        <td className="py-3 px-2 text-right text-emerald-600 dark:text-emerald-400 font-black">
                          {formatPrice(p.profit, currencySymbol)}
                        </td>
                        <td className="py-3 px-2 text-right font-black">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            margin >= 30
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : margin > 0
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}>
                            {p.sales > 0 ? `${margin.toFixed(1)}%` : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 mt-3">
              {topProducts.map((p, idx) => {
                const margin = p.sales > 0 ? (p.profit / p.sales) * 100 : 0;
                return (
                  <div
                    key={p.id || idx}
                    className="bg-gray-50/70 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-black flex items-center justify-center text-gray-700 dark:text-gray-200">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 truncate">{p.name}</span>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-200/80 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-black text-gray-800 dark:text-gray-200">
                        Qty: {p.qty}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 block">Rev</span>
                        <span className="font-black text-gray-900 dark:text-white text-[11px]">
                          {formatPrice(p.sales, currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 block">Cost</span>
                        <span className="font-bold text-gray-500 text-[11px]">{formatPrice(p.cost, currencySymbol)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 block">Profit</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-[11px]">
                          {formatPrice(p.profit, currencySymbol)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 block">Margin</span>
                        <span className="font-black text-[11px] text-gray-900 dark:text-white">{p.sales > 0 ? `${margin.toFixed(1)}%` : '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

