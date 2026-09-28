import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByToken } from '@/lib/services/orders';
import { getSettings } from '@/lib/services/settings';
import OrderResultCard from '@/components/store/OrderResultCard';
import { Package } from '@/components/common/Icons';

// The token is the secret (like a receipt URL) — never index these pages.
export const metadata: Metadata = {
  title: 'Your Order',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function OrderTokenPage({ params }: PageProps) {
  const { token } = await params;
  const [order, settings] = await Promise.all([
    getOrderByToken(token),
    getSettings(),
  ]);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="text-center mb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}>
          <Package className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Your Order</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bookmark this page to check your order status anytime.
        </p>
      </div>

      <OrderResultCard order={order} currencySymbol={settings.currency_symbol || 'Rs.'} />

      <p className="mt-4 text-center text-[12px] text-gray-400">
        Need help?{' '}
        <Link href="/track-order" className="font-bold text-[#e94560] hover:underline">Track another order</Link>
      </p>
    </div>
  );
}
