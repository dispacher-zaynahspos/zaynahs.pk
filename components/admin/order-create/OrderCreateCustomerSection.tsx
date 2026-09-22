'use client';

import React from 'react';
import { Search, Loader2 } from '@/components/common/Icons';

interface OrderCreateCustomerSectionProps {
  customerSearchQuery: string;
  setCustomerSearchQuery: (v: string) => void;
  searchCustomer: (query: string) => void;
  isCustomerDropdownOpen: boolean;
  setIsCustomerDropdownOpen: (v: boolean) => void;
  customerResults: any[];
  isSearchingCustomer: boolean;
  handleCustomerSelect: (c: any) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerAddress: string;
  setCustomerAddress: (v: string) => void;
  customerCity: string;
  setCustomerCity: (v: string) => void;
}

export function OrderCreateCustomerSection({
  customerSearchQuery,
  setCustomerSearchQuery,
  searchCustomer,
  isCustomerDropdownOpen,
  setIsCustomerDropdownOpen,
  customerResults,
  isSearchingCustomer,
  handleCustomerSelect,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customerCity,
  setCustomerCity,
}: OrderCreateCustomerSectionProps) {
  return (
    <div className="space-y-3.5 border-t border-gray-100 dark:border-gray-800/60 pt-4">
      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider block">Customer Checkout Info</span>

      {/* Customer auto-fetch search */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search existing customer by phone/name..."
            value={customerSearchQuery}
            onChange={(e) => {
              setCustomerSearchQuery(e.target.value);
              searchCustomer(e.target.value);
            }}
            onFocus={() => customerResults.length > 0 && setIsCustomerDropdownOpen(true)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {isSearchingCustomer && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        {isCustomerDropdownOpen && customerResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 py-1 text-xs">
            {customerResults.map(c => (
              <div
                key={c.id}
                onClick={() => handleCustomerSelect(c)}
                className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div className="font-semibold text-gray-900 dark:text-white">{c.name || 'Unknown'}</div>
                <div className="text-gray-400">{c.phone || 'No phone'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Customer Name</span>
          <input
            type="text"
            required
            placeholder="Shoaib Khan"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp / Phone</span>
          <input
            type="text"
            required
            placeholder="03001234567"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Shipping Address</span>
          <input
            type="text"
            required
            placeholder="House 4, Street 2, Sector G-11"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">City</span>
          <input
            type="text"
            required
            placeholder="Islamabad"
            value={customerCity}
            onChange={(e) => setCustomerCity(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>
      </div>
    </div>
  );
}
