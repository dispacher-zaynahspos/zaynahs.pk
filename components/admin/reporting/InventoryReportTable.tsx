'use client';

import React, { useMemo, useState } from 'react';
import { Package, Search } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { InventoryItem } from './types';

interface InventoryReportTableProps {
  inventoryData: InventoryItem[];
  currencySymbol: string;
}

type StockFilter = 'all' | 'in' | 'low' | 'out';
type SortKey = 'sale' | 'cost' | 'profit' | 'stock' | 'name';

const PAGE = 20;

export default function InventoryReportTable({ inventoryData, currencySymbol }: InventoryReportTableProps) {
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('sale');
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = inventoryData.filter((i) => {
      if (q && !(i.name.toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q))) return false;
      if (stockFilter === 'in' && i.stockUnits <= 0) return false;
      if (stockFilter === 'out' && i.stockUnits > 0) return false;
      if (stockFilter === 'low' && !i.lowStock) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'cost') return b.costValue - a.costValue;
      if (sortKey === 'profit') return b.potentialProfit - a.potentialProfit;
      if (sortKey === 'stock') return b.stockUnits - a.stockUnits;
      return b.saleValue - a.saleValue;
    });
    return list;
  }, [inventoryData, query, stockFilter, sortKey]);

  // Reset paging when the filtered set changes shape
  React.useEffect(() => { setVisible(PAGE); }, [query, stockFilter, sortKey]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Totals reflect the FILTERED set (not just the visible page).
  const totals = useMemo(() => filtered.reduce(
    (acc, i) => ({
      stock: acc.stock + i.stockUnits,
      cost: acc.cost + i.costValue,
      sale: acc.sale + i.saleValue,
      profit: acc.profit + i.potentialProfit,
    }),
    { stock: 0, cost: 0, sale: 0, profit: 0 }
  ), [filtered]);

  if (inventoryData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
      <div className="flex flex-col gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-black text-gray-900 dark:text-white">Inventory Report</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product / SKU"
              className="w-44 pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="sale">Sort: Sale Value</option>
            <option value="cost">Sort: Cost Value</option>
            <option value="profit">Sort: Profit</option>
            <option value="stock">Sort: Stock Units</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
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
            {shown.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-white/2 transition-colors">
                <td className="py-3 font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{item.name}</td>
                <td className="py-3 text-center text-gray-500">{item.variants}</td>
                <td className="py-3 text-right font-bold">{item.stockUnits}</td>
                <td className="py-3 text-right text-gray-500">{formatPrice(item.costValue, currencySymbol)}</td>
                <td className="py-3 text-right font-black text-gray-900 dark:text-white">{formatPrice(item.saleValue, currencySymbol)}</td>
                <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">{formatPrice(item.potentialProfit, currencySymbol)}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold">No products match your filters.</td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 dark:border-gray-700">
            <tr className="font-black text-gray-900 dark:text-white text-xs">
              <td className="py-3">Total ({filtered.length} products)</td>
              <td></td>
              <td className="py-3 text-right">{totals.stock}</td>
              <td className="py-3 text-right">{formatPrice(totals.cost, currencySymbol)}</td>
              <td className="py-3 text-right">{formatPrice(totals.sale, currencySymbol)}</td>
              <td className="py-3 text-right text-emerald-600">{formatPrice(totals.profit, currencySymbol)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            Load More ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
