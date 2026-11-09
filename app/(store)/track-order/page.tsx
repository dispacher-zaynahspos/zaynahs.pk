import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/services/settings';
import TrackOrderClient from '@/components/store/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order',
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage() {
  const settings = await getSettings();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <TrackOrderClient currencySymbol={settings.currency_symbol} />
    </Suspense>
  );
}
