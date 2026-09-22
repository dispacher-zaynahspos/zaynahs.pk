import React from 'react';
import { Users, DollarSign, TrendingUp, ShoppingBag } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface CustomerStatsProps {
  stats: {
    total: number;
    totalSpent: number;
    avgSpent: number;
    totalOrders: number;
  };
}

export default function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Customers</span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{stats.total}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Users className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">LTV Revenue</span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{formatPrice(stats.totalSpent)}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Avg Spent / User</span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{formatPrice(stats.avgSpent)}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Orders</span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{stats.totalOrders}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
