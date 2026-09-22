import React from 'react';
import Link from 'next/link';
import { ShoppingBag, FolderOpen, ClipboardList, TrendingUp, ChevronRight } from '@/components/common/Icons';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { getOrders } from '@/lib/services/orders';
import { getSettings } from '@/lib/services/settings';
import { getAdminCustomers } from '@/lib/services/customers';
import { formatPrice } from '@/lib/utils/whatsapp';
import DashboardClient from '@/components/admin/DashboardClient';
import TrafficPanel from '@/components/admin/dashboard/TrafficPanel';

export const revalidate = 0;

export default async function DashboardPage() {
  const [products, categories, orders, settings, customers] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrders(),
    getSettings(),
    getAdminCustomers()
  ]);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { 
      label: 'Total Products', 
      value: products.length.toLocaleString(), 
      icon: ShoppingBag, 
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', 
      glow: 'from-blue-500/15 via-blue-500/5 to-transparent',
      href: '/admin/products' 
    },
    { 
      label: 'Total Categories', 
      value: categories.length.toLocaleString(), 
      icon: FolderOpen, 
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 
      glow: 'from-amber-500/15 via-amber-500/5 to-transparent',
      href: '/admin/categories' 
    },
    { 
      label: 'Orders Logged', 
      value: orders.length.toLocaleString(), 
      icon: ClipboardList, 
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 
      glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      href: '/admin/orders' 
    },
    { 
      label: 'All-Time Sales', 
      value: formatPrice(totalSales, settings.currencySymbol), 
      icon: TrendingUp, 
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', 
      glow: 'from-rose-500/15 via-rose-500/5 to-transparent',
      href: '/admin/orders' 
    },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="relative overflow-hidden bg-white dark:bg-[#16162a] p-5 md:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group text-gray-900 dark:text-white"
            >
              {/* Subtle gradient glow in the corner */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.glow} rounded-bl-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`} />
              
              <div className="space-y-1.5 relative z-10 min-w-0 pr-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {stat.label}
                  <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400" />
                </span>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight truncate">
                  {stat.value}
                </p>
              </div>

              <div className={`relative z-10 h-12 w-12 rounded-2xl border flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 flex-shrink-0 shadow-xs`}>
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Dashboard Client Hub */}
      <DashboardClient orders={orders} products={products} customers={customers} settings={settings} />

      {/* Real-time Traffic Panel */}
      <TrafficPanel />
    </div>
  );
}

