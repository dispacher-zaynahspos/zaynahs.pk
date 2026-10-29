import React from 'react';
import { getOrders } from '@/lib/services/orders';
import { getProducts } from '@/lib/services/products';
import { getSettings } from '@/lib/services/settings';
import ReportingDashboard from '@/components/admin/ReportingDashboard';

export const revalidate = 0; // Dynamic server component

export default async function AdminReportingPage() {
  const [orders, products, settings] = await Promise.all([
    getOrders(),
    getProducts(),
    getSettings()
  ]);

  const cleanOrders = orders.filter(o => !o.deleted_at && (o.status as string) !== 'trash' && (o.status as string) !== 'deleted');
  const cleanProducts = products.filter(p => !p.deleted_at);

  return (
    <div className="space-y-6">
      <ReportingDashboard orders={cleanOrders} settings={settings} products={cleanProducts} />
    </div>
  );
}
