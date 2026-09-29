'use client';

import React, { useState } from 'react';
import { Search, Package } from '@/components/common/Icons';
import PhoneInput from '@/components/store/PhoneInput';
import { trackOrder, type TrackOrderResult } from '@/lib/services/orders';
import { isValidPkMobile } from '@/lib/phone';
import OrderResultCard from '@/components/store/OrderResultCard';

export default function TrackOrderClient({ currencySymbol = 'Rs.' }: { currencySymbol?: string }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackOrderResult | null>(null);

  const canSubmit = orderNumber.trim().length > 0 && isValidPkMobile(phone);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await trackOrder(orderNumber, phone));
    } finally {
      setLoading(false);
    }
  };

  const order = result?.order;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 sm:pt-32 pb-16">
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}>
          <Package className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Track Your Order</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Order number aur WhatsApp number daalein.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-5 shadow-sm">
        <div>
          <label htmlFor="track-order-number" className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
            Order Number<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id="track-order-number"
            type="text"
            inputMode="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ZN-10234"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal placeholder:italic focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <PhoneInput value={phone} onChange={setPhone} label="WhatsApp / Phone (order par diya tha)" />

        <button
          type="submit"
          disabled={!canSubmit || loading}
          style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <><Search className="h-4 w-4" /> Track Order</>
          )}
        </button>

        {result && !result.ok && (
          <p role="alert" className="text-center text-[13px] font-semibold text-red-500">{result.error}</p>
        )}
      </form>

      {order && <OrderResultCard order={order} currencySymbol={currencySymbol} />}
    </div>
  );
}
