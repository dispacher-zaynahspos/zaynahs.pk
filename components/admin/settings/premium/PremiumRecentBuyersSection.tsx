'use client';

import React from 'react';
import { Product } from '@/lib/types';

interface PremiumRecentBuyersSectionProps {
  recentBuyersEnabled: boolean;
  setRecentBuyersEnabled: (v: boolean) => void;
  recentBuyersShowOnCheckout: boolean;
  setRecentBuyersShowOnCheckout: (v: boolean) => void;
  recentBuyersSource: 'simulated' | 'real';
  setRecentBuyersSource: (v: 'simulated' | 'real') => void;
  recentBuyersNames: string;
  setRecentBuyersNames: (v: string) => void;
  recentBuyersCities: string;
  setRecentBuyersCities: (v: string) => void;
  recentBuyersProductPool: 'any' | 'featured' | 'sale' | 'recent' | 'custom';
  setRecentBuyersProductPool: (v: 'any' | 'featured' | 'sale' | 'recent' | 'custom') => void;
  recentBuyersCustomProducts: string[];
  setRecentBuyersCustomProducts: React.Dispatch<React.SetStateAction<string[]>>;
  productsList: Product[];
  recentBuyersInitialDelay: number;
  setRecentBuyersInitialDelay: (v: number) => void;
  recentBuyersInterval: number;
  setRecentBuyersInterval: (v: number) => void;
  recentBuyersDisplayDuration: number;
  setRecentBuyersDisplayDuration: (v: number) => void;
}

export function PremiumRecentBuyersSection({
  recentBuyersEnabled,
  setRecentBuyersEnabled,
  recentBuyersShowOnCheckout,
  setRecentBuyersShowOnCheckout,
  recentBuyersSource,
  setRecentBuyersSource,
  recentBuyersNames,
  setRecentBuyersNames,
  recentBuyersCities,
  setRecentBuyersCities,
  recentBuyersProductPool,
  setRecentBuyersProductPool,
  recentBuyersCustomProducts,
  setRecentBuyersCustomProducts,
  productsList,
  recentBuyersInitialDelay,
  setRecentBuyersInitialDelay,
  recentBuyersInterval,
  setRecentBuyersInterval,
  recentBuyersDisplayDuration,
  setRecentBuyersDisplayDuration,
}: PremiumRecentBuyersSectionProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Recent Buyers Notification Ticker</h3>
      
      {/* Enabled / Disabled status */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Ticker Popups</label>
        <input
          type="checkbox"
          checked={recentBuyersEnabled}
          onChange={(e) => setRecentBuyersEnabled(e.target.checked)}
          className="w-4 h-4 rounded text-[#e94560] focus:ring-[#e94560] cursor-pointer"
        />
      </div>

      {/* Show on Checkout */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Show on Cart & Checkout Pages</label>
        <input
          type="checkbox"
          checked={recentBuyersShowOnCheckout}
          onChange={(e) => setRecentBuyersShowOnCheckout(e.target.checked)}
          className="w-4 h-4 rounded text-[#e94560] focus:ring-[#e94560] cursor-pointer"
        />
      </div>

      {/* Source logic: simulated vs real order data */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-750 dark:text-gray-300 block">Buyer Data Source</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="radio"
              name="recent_buyers_source"
              value="simulated"
              checked={recentBuyersSource === 'simulated'}
              onChange={() => setRecentBuyersSource('simulated')}
              className="text-[#e94560] focus:ring-[#e94560]"
            />
            <span>Simulated (Names & Cities lists)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="radio"
              name="recent_buyers_source"
              value="real"
              checked={recentBuyersSource === 'real'}
              onChange={() => setRecentBuyersSource('real')}
              className="text-[#e94560] focus:ring-[#e94560]"
            />
            <span>Real Orders (from Database)</span>
          </label>
        </div>
      </div>

      {/* If Simulated: render separate names and cities fields */}
      {recentBuyersSource === 'simulated' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Simulated Buyer Names (Comma/Newline-separated)
            </label>
            <textarea
              value={recentBuyersNames}
              onChange={(e) => setRecentBuyersNames(e.target.value)}
              rows={4}
              placeholder="Ahmad, Fatima, Zainab, Hamza, Ayesha..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Simulated Cities list (Comma/Newline-separated)
            </label>
            <textarea
              value={recentBuyersCities}
              onChange={(e) => setRecentBuyersCities(e.target.value)}
              rows={4}
              placeholder="Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>
        </div>
      )}

      {/* Product pool logic */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Product Notification Pool</label>
        <select
          value={recentBuyersProductPool}
          onChange={(e) => setRecentBuyersProductPool(e.target.value as any)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
        >
          <option value="any">Any Active Storefront Product</option>
          <option value="featured">Featured Products Only</option>
          <option value="sale">On Sale Products Only</option>
          <option value="recent">Recently Added Products Only</option>
          <option value="custom">Selected Custom Products</option>
        </select>
      </div>

      {/* Custom Products Checklist container */}
      {recentBuyersProductPool === 'custom' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Select Products to Show:
          </label>
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl max-h-60 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-[#0f0f1b] overscroll-contain">
            {productsList.length === 0 ? (
              <span className="text-xs text-gray-500">Loading products...</span>
            ) : (
              productsList.map((product) => {
                const isChecked = recentBuyersCustomProducts.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setRecentBuyersCustomProducts(prev => prev.filter(id => id !== product.id));
                        } else {
                          setRecentBuyersCustomProducts(prev => [...prev, product.id]);
                        }
                      }}
                      className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                    />
                    {product.images?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-850 dark:text-gray-200 truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Rs. {product.price}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Time Controls: Sliders for initial delay, interval, and display duration */}
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-350">
            <span>Initial delay before first popup</span>
            <span>{recentBuyersInitialDelay} seconds</span>
          </div>
          <input
            type="range"
            min="2"
            max="120"
            step="1"
            value={recentBuyersInitialDelay}
            onChange={(e) => setRecentBuyersInitialDelay(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-350">
            <span>Interval time between popups</span>
            <span>{recentBuyersInterval} seconds</span>
          </div>
          <input
            type="range"
            min="5"
            max="600"
            step="5"
            value={recentBuyersInterval}
            onChange={(e) => setRecentBuyersInterval(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-350">
            <span>Popup display duration visibility</span>
            <span>{recentBuyersDisplayDuration} seconds</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={recentBuyersDisplayDuration}
            onChange={(e) => setRecentBuyersDisplayDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
          />
        </div>
      </div>
    </div>
  );
}
