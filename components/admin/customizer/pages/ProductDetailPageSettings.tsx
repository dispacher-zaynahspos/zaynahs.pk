'use client';

import React from 'react';
import { StoreSettings, Product } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import ProductSaleSubTab from './product-detail/ProductSaleSubTab';
import ProductSocialFeedSubTab from './product-detail/ProductSocialFeedSubTab';
import ProductLayoutSubTab from './product-detail/ProductLayoutSubTab';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';
import { ATC_ANIMATION_OPTIONS } from '@/lib/constants/productCardOptions';
import { Star, MessageSquare } from '@/components/common/Icons';

interface ProductDetailPageSettingsProps {
  settings: StoreSettings;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  subTab: string;
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
  // 1. PRODUCT SALE SETTINGS
  if (subTab === 'product_sale') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Product Sale Settings</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Sale Price
          </span>
        </div>
        <ProductSaleSubTab
          settings={settings}
          currentProduct={currentProduct}
          onUpdateProduct={onUpdateProduct}
        />
      </div>
    );
  }

  // 2. SCROLLING ANNOUNCEMENT TICKER
  if (subTab === 'ticker') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Scrolling Announcement Ticker</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Ticker
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Enable Scrolling Ticker</span>
            <span className="text-[10px] text-gray-400">Show infinite scrolling marquee below product gallery</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.product_detail_enable_ticker}
              onChange={(e) => onUpdateSettings({ product_detail_enable_ticker: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.product_detail_enable_ticker && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Ticker Lines (One per line)</label>
            <textarea
              rows={4}
              value={settings.product_detail_ticker_text || ''}
              onChange={(e) => onUpdateSettings({ product_detail_ticker_text: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
              placeholder="Free returns within 30 days&#10;Unlimited delivery for only Rs. 175"
            />
          </div>
        )}
      </div>
    );
  }

  // 3. REVIEWS & FAQ FEED
  if (subTab === 'reviews') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Reviews &amp; FAQ Feed</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Reviews
          </span>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <h5 className="text-xs font-bold text-gray-900 dark:text-white">Customer Reviews &amp; Ratings Feed</h5>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Displays real customer review cards, verified buyer badges, rating breakdown bars, and interactive review submission directly on the product detail page.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-gray-200/60 dark:border-gray-800/60 text-xs">
            <span className="text-gray-600 dark:text-gray-400 font-semibold">Manage all customer reviews</span>
            <a
              href="/admin/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e94560] font-bold hover:underline inline-flex items-center gap-1"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Reviews Hub →</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. RELATED PRODUCTS GRID
  if (subTab === 'related') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Related Products Grid</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Related
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Related Products</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatureEnabled(settings, 'related_products')}
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

        {/* Responsive Columns per Device */}
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

  // 5. RECENTLY VIEWED PRODUCTS
  if (subTab === 'recently_viewed') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Recently Viewed Products</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Recent
          </span>
        </div>

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
                <span>Product Limit</span>
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

            {/* Responsive Columns per Device */}
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

  // 6. SOCIAL FEED RIBBON
  if (subTab === 'social_feed') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Social Feed Ribbon</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Social
          </span>
        </div>
        <ProductSocialFeedSubTab
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onSelectMedia={onSelectMedia}
        />
      </div>
    );
  }

  // 7. LAYOUT REORDER (Only when explicitly opened)
  if (subTab === 'layout') {
    return (
      <ProductLayoutSubTab
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />
    );
  }

  // 8. PRODUCT DETAILS COMPONENT (Default / Core block - subTab === 'details' or 'swatches' or 'urgency' or 'delivery')
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Block</span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Product Details Component</h4>
        </div>
        <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
          Details
        </span>
      </div>

      {/* Group 1: Action Buttons & Tactile Click Animation */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Button Actions &amp; Animations
        </label>

        <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">
              Button Tactile Click Animation (12 Styles)
            </label>
            <select
              value={settings.add_to_cart_animation || 'none'}
              onChange={(e) => onUpdateSettings({ add_to_cart_animation: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            >
              {ATC_ANIMATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400">
              Tactile click effect on PDP &amp; Quick Buy buttons (independent of fly-to-cart animation).
            </p>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/80 pt-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Fly &amp; Drop to Cart</span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                Animate product thumbnail flying into header cart with anticipation dip &amp; bounce
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enable_fly_to_cart !== false}
                onChange={(e) => onUpdateSettings({ enable_fly_to_cart: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/80 pt-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Quick WhatsApp Button</span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                Show direct WhatsApp order button on product page
              </span>
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

          <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800/80 pt-3">
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">
              Product Swatch Size
            </label>
            <select
              value={settings.product_swatch_size || 'md'}
              onChange={(e) => onUpdateSettings({ product_swatch_size: e.target.value as any })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            >
              {['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map((sz) => (
                <option key={sz} value={sz}>{sz.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Group 2: Urgency & Live Views */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Stock &amp; Social Urgency
        </label>

        <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Remaining Stock</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.show_stock}
                onChange={(e) => onUpdateSettings({ show_stock: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/80 pt-3">
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

          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/80 pt-3">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Simulated Views</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enable_fake_views}
                onChange={(e) => onUpdateSettings({ enable_fake_views: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {settings.enable_fake_views && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 dark:border-gray-800/80">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Min Views</label>
                <input
                  type="number"
                  value={settings.min_views}
                  onChange={(e) => onUpdateSettings({ min_views: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Max Views</label>
                <input
                  type="number"
                  value={settings.max_views}
                  onChange={(e) => onUpdateSettings({ max_views: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group 3: Delivery & Free Shipping */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Delivery &amp; Thresholds
        </label>

        <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
              Delivery Estimate Text
            </label>
            <textarea
              rows={2}
              value={settings.delivery_estimate_text}
              onChange={(e) => onUpdateSettings({ delivery_estimate_text: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
              Free Shipping Threshold (PKR)
            </label>
            <input
              type="number"
              value={settings.free_shipping_threshold || 2000}
              onChange={(e) => onUpdateSettings({ free_shipping_threshold: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Group 4: Trust Badges & Safe Checkout */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Trust &amp; Badges
        </label>

        <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Trust Badges</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enable_trust_badges}
                onChange={(e) => onUpdateSettings({ enable_trust_badges: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/80 pt-3">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Safe Checkout Info</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enable_safe_checkout}
                onChange={(e) => onUpdateSettings({ enable_safe_checkout: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
