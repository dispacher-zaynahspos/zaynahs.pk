'use client';

import React from 'react';
import { StoreSettings, Product } from '@/lib/types';
import ProductSaleSubTab from './product-detail/ProductSaleSubTab';
import ProductSocialFeedSubTab from './product-detail/ProductSocialFeedSubTab';
import ProductLayoutSubTab from './product-detail/ProductLayoutSubTab';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';

interface ProductDetailPageSettingsProps {
  settings: StoreSettings;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  subTab: 'swatches' | 'urgency' | 'delivery' | 'layout' | 'ticker' | 'recently_viewed' | 'related' | 'social_feed' | 'product_sale';
  currentProduct?: Product | null;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  onSelectMedia: (onSelect: (url: string) => void) => void;
}

export default function ProductDetailPageSettings({
  settings,
  viewportMode = 'desktop',
  onUpdateSettings,
  subTab,
  currentProduct = null,
  onUpdateProduct = () => {},
  onSelectMedia,
}: ProductDetailPageSettingsProps) {
  if (subTab === 'product_sale') {
    return (
      <ProductSaleSubTab
        settings={settings}
        currentProduct={currentProduct}
        onUpdateProduct={onUpdateProduct}
      />
    );
  }

  if (subTab === 'related') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Related Products</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.related_products_enabled !== false}
              onChange={(e) => onUpdateSettings({ related_products_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Section Title</label>
          <input
            type="text"
            value={settings.related_products_title || 'Related Products'}
            onChange={(e) => onUpdateSettings({ related_products_title: e.target.value })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Section Subtitle</label>
          <input
            type="text"
            value={settings.related_products_subtitle || 'You might also like these handpicked recommendations'}
            onChange={(e) => onUpdateSettings({ related_products_subtitle: e.target.value })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-500">
            <span>Product Limit</span>
            <span className="text-[#e94560]">{settings.related_products_limit || 4} items</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={settings.related_products_limit || 4}
            onChange={(e) => onUpdateSettings({ related_products_limit: parseInt(e.target.value) })}
            className="w-full accent-[#e94560]"
          />
        </div>

        {/* Responsive Columns per Device (Mobile: 1-3, Tablet: 2-4, Desktop: 3-8) */}
        <ResponsiveGridColumnsControl
          label="Related Grid Columns"
          viewportMode={viewportMode}
          desktopCols={settings.related_columns_desktop || 4}
          tabletCols={settings.related_columns_tablet || 3}
          mobileCols={settings.related_columns_mobile || 2}
          onChangeDesktop={(cols: number) => onUpdateSettings({ related_columns_desktop: cols })}
          onChangeTablet={(cols: number) => onUpdateSettings({ related_columns_tablet: cols })}
          onChangeMobile={(cols: number) => onUpdateSettings({ related_columns_mobile: cols })}
        />
      </div>
    );
  }

  if (subTab === 'recently_viewed') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Recently Viewed</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.recently_viewed_limit !== 0}
              onChange={(e) => onUpdateSettings({ recently_viewed_limit: e.target.checked ? 4 : 0 })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.recently_viewed_limit !== 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Section Title</label>
              <input
                type="text"
                value={settings.recently_viewed_title || 'Recently Viewed'}
                onChange={(e) => onUpdateSettings({ recently_viewed_title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Section Subtitle</label>
              <input
                type="text"
                value={settings.recently_viewed_subtitle || 'Products you have recently browsed'}
                onChange={(e) => onUpdateSettings({ recently_viewed_subtitle: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span>Display Limit</span>
                <span className="text-[#e94560]">{settings.recently_viewed_limit || 4} items</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={settings.recently_viewed_limit || 4}
                onChange={(e) => onUpdateSettings({ recently_viewed_limit: parseInt(e.target.value) })}
                className="w-full accent-[#e94560]"
              />
            </div>

            {/* Responsive Columns per Device (Mobile: 1-3, Tablet: 2-4, Desktop: 3-8) */}
            <ResponsiveGridColumnsControl
              label="Recently Viewed Grid Columns"
              viewportMode={viewportMode}
              desktopCols={settings.recently_viewed_columns_desktop || 4}
              tabletCols={settings.recently_viewed_columns_tablet || 3}
              mobileCols={settings.recently_viewed_columns_mobile || 2}
              onChangeDesktop={(cols: number) => onUpdateSettings({ recently_viewed_columns_desktop: cols })}
              onChangeTablet={(cols: number) => onUpdateSettings({ recently_viewed_columns_tablet: cols })}
              onChangeMobile={(cols: number) => onUpdateSettings({ recently_viewed_columns_mobile: cols })}
            />
          </div>
        )}
      </div>
    );
  }

  if (subTab === 'social_feed') {
    return (
      <ProductSocialFeedSubTab
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onSelectMedia={onSelectMedia}
      />
    );
  }

  if (subTab === 'ticker') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Scrolling Ticker</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.productDetailEnableTicker}
              onChange={(e) => onUpdateSettings({ productDetailEnableTicker: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.productDetailEnableTicker && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Ticker Lines (One per line)</label>
            <textarea
              rows={4}
              value={settings.productDetailTickerText || ''}
              onChange={(e) => onUpdateSettings({ productDetailTickerText: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
              placeholder="Free returns within 30 days&#10;Unlimited delivery for only Rs. 175"
            />
          </div>
        )}
      </div>
    );
  }

  if (subTab === 'swatches') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Product Swatch Size</label>
          <select
            value={settings.productSwatchSize || 'md'}
            onChange={(e) => onUpdateSettings({ productSwatchSize: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((sz) => (
              <option key={sz} value={sz}>{sz.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-3">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Quick WhatsApp Button</span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Show direct WhatsApp order button on product page</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.enable_product_quick_whatsapp !== false}
              onChange={(e) => onUpdateSettings({ enable_product_quick_whatsapp: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>
      </div>
    );
  }

  if (subTab === 'urgency') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Remaining Stock</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showStock}
              onChange={(e) => onUpdateSettings({ showStock: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Stock Urgency Bar</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.stock_urgency_enabled}
              onChange={(e) => onUpdateSettings({ stock_urgency_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Simulated Views</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.enableFakeViews}
              onChange={(e) => onUpdateSettings({ enableFakeViews: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.enableFakeViews && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Min Views</label>
              <input
                type="number"
                value={settings.minViews}
                onChange={(e) => onUpdateSettings({ minViews: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Max Views</label>
              <input
                type="number"
                value={settings.maxViews}
                onChange={(e) => onUpdateSettings({ maxViews: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (subTab === 'layout') {
    return (
      <ProductLayoutSubTab
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Delivery Estimate Text</label>
        <textarea
          rows={2}
          value={settings.deliveryEstimateText}
          onChange={(e) => onUpdateSettings({ deliveryEstimateText: e.target.value })}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Free Shipping Threshold (PKR)</label>
        <input
          type="number"
          value={settings.free_shipping_threshold || 2000}
          onChange={(e) => onUpdateSettings({ free_shipping_threshold: Number(e.target.value) })}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Trust Badges</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.enableTrustBadges}
            onChange={(e) => onUpdateSettings({ enableTrustBadges: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Safe Checkout Info</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.enableSafeCheckout}
            onChange={(e) => onUpdateSettings({ enableSafeCheckout: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>
    </div>
  );
}
