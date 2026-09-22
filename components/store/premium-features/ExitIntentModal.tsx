'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { X, Tag, CheckCircle2 } from '@/components/common/Icons';

interface ExitIntentModalProps {
  settings: StoreSettings;
  subscribed: boolean;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onCopyCoupon: (code: string) => void;
}

export default function ExitIntentModal({
  settings,
  subscribed,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  onSubmit,
  onClose,
  onCopyCoupon,
}: ExitIntentModalProps) {
  if (!subscribed) {
    return (
      <div 
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 overscroll-contain animate-fade-in touch-none"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl transition-all scale-100 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mt-3">
            {settings.exit_intent_image_url ? (
              <div className="relative w-full h-44 sm:h-52 mb-4 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.exit_intent_image_url} alt="Promo banner" className="object-contain w-full h-full" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-full mb-4">
                <Tag className="w-7 h-7 text-amber-500" />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-serif">
              {settings.exit_intent_title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {settings.exit_intent_text}
            </p>
          </div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-950 dark:text-gray-50"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address (Optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-950 dark:text-gray-50"
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="WhatsApp Number (e.g. 03211234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-950 dark:text-gray-50"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#1a1a2e] dark:bg-amber-600 hover:bg-[#2a2a3e] dark:hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-all transform active:scale-95 shadow-md"
            >
              Claim Coupon Now
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-fade-in touch-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl text-center scale-up duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Here is your Coupon Code!
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Copy the code below and use it at checkout for special savings.
        </p>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-between">
          <span className="font-mono text-lg font-bold text-amber-500 uppercase tracking-wider">
            {settings.exit_intent_coupon}
          </span>
          <button
            onClick={() => onCopyCoupon(settings.exit_intent_coupon || 'WELCOME10')}
            className="px-4 py-2 bg-[#1a1a2e] dark:bg-amber-600 hover:bg-[#272740] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Send us a screenshot of this coupon on WhatsApp to claim your gift!
        </p>
      </div>
    </div>
  );
}
