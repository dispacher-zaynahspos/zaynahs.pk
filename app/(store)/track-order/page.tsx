import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/services/settings';
import TrackOrderClient from '@/components/store/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order',
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage() {
  const settings = await getSettings();
  return <TrackOrderClient currencySymbol={settings.currency_symbol} />;
}
