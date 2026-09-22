'use client';

import React from 'react';
import { StoreSettings, Product } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';

interface StyleGuideProps {
  settings: StoreSettings;
  products: Product[];
}

export default function StyleGuide({ settings, products }: StyleGuideProps) {
  const activeProduct = products[0];
  const currencySymbol = settings.currencySymbol || 'Rs.';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Title Header */}
      <div 
        style={{ borderColor: 'var(--color-border)' }}
        className="border-b pb-6"
      >
        <h1 className="text-3xl font-black font-heading tracking-tight">
          Theme Style Guide
        </h1>
        <p className="text-sm font-body mt-1 opacity-70">
          This preview dynamically adapts to your theme fonts, colors, and border styles in real-time.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Colors Palette Section */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)'
          }}
          className="p-6 rounded-2xl border space-y-4 shadow-sm"
        >
          <h3 className="text-lg font-bold font-heading">Theme Palette</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div 
              style={{ borderColor: 'var(--color-border)' }}
              className="p-3 rounded-xl border flex flex-col gap-1.5 opacity-90"
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">Primary Color</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--color-primary)' }} />
                <span className="text-xs font-mono font-medium">Primary</span>
              </div>
            </div>

            <div 
              style={{ borderColor: 'var(--color-border)' }}
              className="p-3 rounded-xl border flex flex-col gap-1.5 opacity-90"
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">Accent Color</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--color-accent)' }} />
                <span className="text-xs font-mono font-medium">Accent</span>
              </div>
            </div>

            <div 
              style={{ borderColor: 'var(--color-border)' }}
              className="p-3 rounded-xl border flex flex-col gap-1.5 opacity-90"
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">Price Color</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--color-price)' }} />
                <span className="text-xs font-mono font-medium">Price</span>
              </div>
            </div>

            <div 
              style={{ borderColor: 'var(--color-border)' }}
              className="p-3 rounded-xl border flex flex-col gap-1.5 opacity-90"
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">Secondary</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--color-secondary)' }} />
                <span className="text-xs font-mono font-medium">Secondary</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 text-xs opacity-60 font-body">
            Colors map to Tailwind utility styles automatically.
          </div>
        </div>

        {/* Typography Section */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)'
          }}
          className="p-6 rounded-2xl border space-y-4 shadow-sm"
        >
          <h3 className="text-lg font-bold font-heading">Typography & Fonts</h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-[10px] block mb-1 font-mono opacity-50">Heading Font (H2 / H3)</span>
              <h2 className="text-2xl font-black font-heading leading-tight">
                Fashion That Inspires
              </h2>
            </div>
            
            <div className="pt-2">
              <span className="text-[10px] block mb-1 font-mono opacity-50">Body Font (Paragraph / Description)</span>
              <p className="text-sm font-body leading-relaxed opacity-85">
                Premium quality eastern and fusion clothing designed for modern convenience. Order directly on WhatsApp with fast nationwide delivery.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] block mb-1 font-mono opacity-50">Muted Info / Subtitles</span>
              <p className="text-xs font-body opacity-60">
                Nationwide flat shipping rate of Rs. 200. Delivery in 3-5 working days.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons & Roundness Section */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)'
          }}
          className="p-6 rounded-2xl border space-y-5 shadow-sm"
        >
          <h3 className="text-lg font-bold font-heading">Buttons & Corner Radii</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] block mb-1.5 font-mono opacity-50">Primary Button (WhatsApp Checkout)</span>
              <button 
                type="button"
                className="w-full py-3 px-4 font-bold text-center transition-colors shadow-sm duration-200 active:scale-95"
                style={{
                  backgroundColor: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  borderRadius: 'var(--border-radius-btn)',
                }}
              >
                Order on WhatsApp
              </button>
            </div>

            <div>
              <span className="text-[10px] block mb-1.5 font-mono opacity-50">Accent Badges / Urgency Elements</span>
              <div className="flex gap-3 items-center">
                <span className="rounded-md bg-[#e94560]/10 dark:bg-[#e94560]/20 px-2.5 py-1 text-xs font-black text-[#e94560] tracking-wide uppercase">
                  Save 20%
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  In Stock
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] block mb-1 font-mono opacity-50">Button Radius</span>
                <div 
                  style={{ borderColor: 'var(--color-border)' }}
                  className="text-xs border p-2 text-center rounded-xl font-semibold bg-[var(--color-primary)]/5"
                >
                  {settings.theme_config?.buttons?.borderRadius ?? 12}px
                </div>
              </div>
              <div>
                <span className="text-[10px] block mb-1 font-mono opacity-50">Card Radius</span>
                <div 
                  style={{ borderColor: 'var(--color-border)' }}
                  className="text-xs border p-2 text-center rounded-xl font-semibold bg-[var(--color-primary)]/5"
                >
                  {settings.theme_config?.cards?.borderRadius ?? 16}px
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Selection Display */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)'
          }}
          className="p-6 rounded-2xl border space-y-4 shadow-sm"
        >
          <h3 className="text-lg font-bold font-heading">Product Pricing Displays</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] block mb-1 font-mono opacity-50">Catalog Price / Range (Price Color Customization)</span>
              <div className="text-xl font-bold product-price">
                {currencySymbol} 2,499 – {currencySymbol} 3,299
              </div>
            </div>

            <div>
              <span className="text-[10px] block mb-1.5 font-mono opacity-50">Selected Variant Price Badge (Product Details Page)</span>
              <div 
                style={{ borderColor: 'var(--color-border)' }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary)]/5 border text-sm font-semibold w-fit"
              >
                <span className="opacity-70">Selected option:</span>
                <span className="product-price text-base font-black leading-none">
                  {currencySymbol} 2,899
                </span>
                <span className="inline-flex items-center gap-1.5 ml-1">
                  <span className="text-xs text-gray-400 line-through font-semibold font-body">
                    {currencySymbol} 3,500
                  </span>
                  <span className="rounded-md bg-[#e94560]/10 dark:bg-[#e94560]/20 px-1.5 py-0.5 text-[9px] font-black text-[#e94560] tracking-wide leading-none">
                    -17%
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] block mb-1 font-mono opacity-50">Standard Item price (With Compare)</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold product-price">
                  {currencySymbol} 1,850
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {currencySymbol} 2,500
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Catalog Card Preview */}
      {activeProduct && (
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)'
          }}
          className="p-6 rounded-2xl border space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold font-heading">Sample Product Card</h3>
            <span className="text-xs font-mono opacity-50">Active Catalog Grid Styles</span>
          </div>
          
          <div className="max-w-[280px] sm:max-w-[320px] mx-auto">
            <ProductCard 
              product={activeProduct} 
              currencySymbol={currencySymbol} 
              settings={settings} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
