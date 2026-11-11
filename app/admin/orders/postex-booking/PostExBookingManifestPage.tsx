'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import PostExBookingManifestTable from '@/components/admin/PostExBookingManifestTable';
import { ManifestOrder } from '@/components/admin/postex-manifest/types';

interface Props {
  orders: ManifestOrder[];
  settings: StoreSettings;
}

export default function PostExBookingManifestPage({ orders, settings }: Props) {
  const router = useRouter();

  const handleGoBack = () => {
    // If opened for a single order, always return directly inside that order's detail view!
    if (orders.length === 1 && orders[0]?.id) {
      router.push(`/admin/orders/detail?id=${orders[0].id}`);
      return;
    }

    // Bulk orders: return to previous orders filter URL or fallback to /admin/orders
    if (typeof window !== 'undefined') {
      const returnUrl = sessionStorage.getItem('admin_orders_return_url');
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }
    }
    router.push('/admin/orders');
  };

  return (
    <PostExBookingManifestTable
      orders={orders}
      settings={settings}
      onGoBack={handleGoBack}
    />
  );
}
