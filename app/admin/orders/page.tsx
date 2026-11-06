import React from 'react';
import OrderLog from '@/components/admin/OrderLog';
import { getOrders, getFailedOrderAttempts } from '@/lib/services/orders';
import { getSettings } from '@/lib/services/settings';

export const revalidate = 0; // Dynamic server rendering

export default async function AdminOrdersPage() {
  const [orders, settings, failedAttempts] = await Promise.all([
    getOrders(),
    getSettings(),
    getFailedOrderAttempts(),
  ]);

  return (
    <React.Suspense fallback={null}>
      <OrderLog
        initialOrders={orders}
        settings={settings}
        initialFailedAttempts={failedAttempts}
      />
    </React.Suspense>
  );
}
