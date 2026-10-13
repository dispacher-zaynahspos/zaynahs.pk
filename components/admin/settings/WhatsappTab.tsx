'use client';

import React from 'react';

interface WhatsappTabProps {
  whatsappGreeting: string;
  setWhatsappGreeting: (val: string) => void;
  whatsappFooter: string;
  setWhatsappFooter: (val: string) => void;
  enableWhatsappRedirect?: boolean;
  setEnableWhatsappRedirect?: (val: boolean) => void;
}

export default function WhatsappTab({
  whatsappGreeting,
  setWhatsappGreeting,
  whatsappFooter,
  setWhatsappFooter,
  enableWhatsappRedirect = true,
  setEnableWhatsappRedirect,
}: WhatsappTabProps) {
  return (
    <div className="space-y-8">
      {/* WhatsApp Redirect on Checkout Toggle */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Auto-Redirect to WhatsApp on Checkout</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose whether customers are redirected to WhatsApp after confirming their order
            </p>
          </div>
          {setEnableWhatsappRedirect && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableWhatsappRedirect}
                onChange={(e) => setEnableWhatsappRedirect(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          )}
        </div>
        <div className="p-3 bg-gray-50 dark:bg-[#0f0f1b]/60 rounded-xl border border-gray-100 dark:border-gray-800/60 text-xs text-gray-600 dark:text-gray-400">
          {enableWhatsappRedirect ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              ✅ <strong>Enabled:</strong> After clicking Confirm Order, customer is redirected to WhatsApp with order details pre-filled.
            </span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              ℹ️ <strong>Disabled:</strong> Customer stays on the store order confirmation page. Order is saved in database and WhatsApp is not automatically opened.
            </span>
          )}
        </div>
      </div>

      {/* WhatsApp Message Customization */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">WhatsApp Message Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Greeting / Header</label>
            <textarea
              value={whatsappGreeting}
              onChange={(e) => setWhatsappGreeting(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">This goes above the cart item list in the WhatsApp message text</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Footer / Confirmation line</label>
            <textarea
              value={whatsappFooter}
              onChange={(e) => setWhatsappFooter(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">This goes at the very end of the message as a confirmation prompt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
