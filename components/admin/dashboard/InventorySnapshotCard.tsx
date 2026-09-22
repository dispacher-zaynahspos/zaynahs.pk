'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Layers, Tag } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface InventorySnapshot {
  totalSKUs: number;
  totalStockUnits: number;
  totalCostValue: number;
  totalSaleValue: number;
}

interface InventorySnapshotCardProps {
  inventorySnapshot: InventorySnapshot;
  currencySymbol: string;
}

export default function InventorySnapshotCard({
  inventorySnapshot,
  currencySymbol,
}: InventorySnapshotCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Package className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Inventory Snapshot</h3>
        </div>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-[11px] font-black text-[#e94560] hover:text-[#d33a53] group"
        >
          Manage Inventory
          <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-2">
        <div className="bg-gray-50/70 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Active SKUs</span>
          <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white block mt-1">
            {inventorySnapshot.totalSKUs}
          </span>
        </div>
        <div className="bg-gray-50/70 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Units in Stock</span>
          <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white block mt-1">
            {inventorySnapshot.totalStockUnits.toLocaleString()}
          </span>
        </div>
        <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
          <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Cost Value (COGS)</span>
          <span className="text-lg md:text-xl font-black text-amber-600 dark:text-amber-400 block mt-1">
            {formatPrice(inventorySnapshot.totalCostValue, currencySymbol)}
          </span>
        </div>
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Retail Sale Value</span>
          <span className="text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
            {formatPrice(inventorySnapshot.totalSaleValue, currencySymbol)}
          </span>
        </div>
      </div>
    </div>
  );
}

