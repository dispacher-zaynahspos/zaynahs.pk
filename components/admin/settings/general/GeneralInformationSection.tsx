'use client';

import React from 'react';

interface GeneralInformationSectionProps {
  storeName: string;
  setStoreName: (val: string) => void;
  storeUrl: string;
  setStoreUrl: (val: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  currencySymbol: string;
  setCurrencySymbol: (val: string) => void;
  orderPrefix: string;
  setOrderPrefix: (val: string) => void;
  nextOrderSequence: number;
  setNextOrderSequence: (val: number) => void;
  setNextOrderSequenceDirty: (val: boolean) => void;
  tagline: string;
  setTagline: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

export function GeneralInformationSection({
  storeName,
  setStoreName,
  storeUrl,
  setStoreUrl,
  whatsappNumber,
  setWhatsappNumber,
  currency,
  setCurrency,
  currencySymbol,
  setCurrencySymbol,
  orderPrefix,
  setOrderPrefix,
  nextOrderSequence,
  setNextOrderSequence,
  setNextOrderSequenceDirty,
  tagline,
  setTagline,
  address,
  setAddress,
}: GeneralInformationSectionProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">General Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Store Name *</label>
          <input
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Store URL (e.g. https://www.ourstore.com)</label>
          <input
            type="url"
            placeholder="e.g. https://www.ourstore.com"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Number * (Format: 923001234567)</label>
          <input
            type="text"
            required
            placeholder="e.g. 923001234567"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Currency Code</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Currency Symbol</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Order Serial Prefix</label>
          <input
            type="text"
            value={orderPrefix}
            onChange={(e) => setOrderPrefix(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            placeholder="TV-"
          />
          <span className="mt-1 block text-[10px] text-gray-400 dark:text-gray-500">
            Any text/characters allowed. Keep it short (2-5 chars) — e.g. <strong className="text-gray-700 dark:text-gray-300">TV-</strong>, <strong className="text-gray-700 dark:text-gray-300">ZE-</strong>, <strong className="text-gray-700 dark:text-gray-300">ORD-</strong>. Letters, numbers, hyphens all work.
            <br /><span className="text-green-500 font-semibold">✓ Existing order numbers are auto-skipped — no need to worry about duplicates.</span>
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Next Order Serial Number</label>
          <input
            type="number"
            value={nextOrderSequence}
            onChange={(e) => {
              setNextOrderSequence(parseInt(e.target.value) || 1);
              setNextOrderSequenceDirty(true);
            }}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
            min="1"
          />
          <span className="mt-1 block text-[10px] text-gray-400 dark:text-gray-500">
            Positive number only. Serial starts from here. <strong className="text-green-500">Duplicate are automatically skipped</strong> — system finds the next free number and continues the sequence from there.
            <br /><span className="text-green-500 font-semibold">✓ No more 23505 errors — auto-skip handles everything.</span>
            <br />Next order preview: <strong className="text-gray-700 dark:text-gray-300">{orderPrefix || 'TV-'}{(nextOrderSequence || 0).toString().padStart(4, '0')}</strong> (if available)
          </span>
        </div>

        <div className="pt-1">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100/70 dark:bg-[#0f0f1b]/70 border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Preview:</span>
            <span className="text-sm font-black text-[#1a1a2e] dark:text-white font-mono tracking-wider">
              {orderPrefix || 'TV-'}{(nextOrderSequence || 0).toString().padStart(4, '0')}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tagline / Subheading</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
