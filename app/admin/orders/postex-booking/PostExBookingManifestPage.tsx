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

  return (
    <PostExBookingManifestTable
      orders={orders}
      settings={settings}
      onGoBack={() => router.push('/admin/orders')}
    />
  );
}
