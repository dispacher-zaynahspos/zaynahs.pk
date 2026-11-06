import React from 'react';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { getOrders } from '@/lib/services/orders';
import { getSettings } from '@/lib/services/settings';
import { getAdminCustomers } from '@/lib/services/customers';
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

  // Filter out any trashed orders, products, and categories defense-in-depth
  const cleanOrders = orders.filter(o => !o.deleted_at && (o.status as string) !== 'trash' && (o.status as string) !== 'deleted');
  const cleanProducts = products.filter(p => !p.deleted_at);
  const cleanCategories = categories.filter(c => !c.deleted_at);

  return (
    <div className="space-y-8">
      {/* Main Dashboard Client Hub - Fully Synchronized with Dynamic Filters */}
      <DashboardClient 
        orders={cleanOrders} 
        products={cleanProducts} 
        categories={cleanCategories} 
        customers={customers} 
        settings={settings} 
      />

      {/* Real-time Traffic Panel */}
      <TrafficPanel />
    </div>
  );
}

