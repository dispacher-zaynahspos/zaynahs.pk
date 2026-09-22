'use client';

import React from 'react';

interface OrderCreatePaymentSectionProps {
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  paymentMethods: { name: string; code: string }[];
  shippingFee: string;
  setShippingFee: (v: string) => void;
  discountAmount: string;
  setDiscountAmount: (v: string) => void;
  staffNotes: string;
  setStaffNotes: (v: string) => void;
}

export function OrderCreatePaymentSection({
  paymentMethod,
  setPaymentMethod,
  paymentMethods,
  shippingFee,
  setShippingFee,
  discountAmount,
  setDiscountAmount,
  staffNotes,
  setStaffNotes,
}: OrderCreatePaymentSectionProps) {
  return (
    <div className="space-y-3.5 border-t border-gray-100 dark:border-gray-800/60 pt-4">
      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider block">Payments & Adjustments</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Payment Method</span>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] cursor-pointer"
          >
            {paymentMethods.length > 0 ? (
              paymentMethods.map(pm => (
                <option key={pm.code} value={pm.name}>{pm.name}</option>
              ))
            ) : (
              <>
                <option value="Cash on delivery">Cash on delivery (COD)</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="NayaPay">NayaPay</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
              </>
            )}
          </select>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Shipping Cost</span>
          <input
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Discount Amount</span>
          <input
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase">Staff Notes (Internal)</span>
        <textarea
          placeholder="Negotiated discount over WhatsApp. Ship urgent."
          value={staffNotes}
          onChange={(e) => setStaffNotes(e.target.value)}
          className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] h-16 resize-none"
        />
      </div>
    </div>
  );
}
