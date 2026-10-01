'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { ChevronLeft, Monitor, Tablet, Smartphone, Check, RefreshCw } from '@/components/common/Icons';

interface CustomizerTopBarProps {
  storeSettings: StoreSettings;
  activePage: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance';
  setActivePage: (page: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance') => void;
  setActiveSectionId: (id: string | null) => void;
  setActiveSubTab: (tab: string) => void;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  isPending: boolean;
  onSaveLayout: () => void;
  sectionsFirstId: string | null;
}

export function CustomizerTopBar({
  storeSettings,
  activePage,
  setActivePage,
  setActiveSectionId,
  setActiveSubTab,
  viewportMode,
  setViewportMode,
  isPending,
  onSaveLayout,
  sectionsFirstId
}: CustomizerTopBarProps) {
  const router = useRouter();

  return (
    <header className="h-16 bg-[#1a1a2e] text-white border-b border-white/10 flex items-center justify-between px-2 sm:px-4 lg:px-6 z-50 shadow-md flex-shrink-0 gap-2 overflow-hidden">
      {/* Left: Back to Dashboard & Page Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-1 sm:gap-1.5 text-white/80 hover:text-white px-2 sm:px-2.5 py-1.5 hover:bg-white/5 rounded-xl transition-all font-bold text-xs cursor-pointer select-none shrink-0"
          title="Back to Dashboard"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Dashboard</span>
        </button>
        <div className="w-[1px] h-6 bg-white/10 hidden xl:block shrink-0" />
        <div className="hidden xl:flex flex-col items-start leading-none gap-0.5 mr-1 shrink-0">
          <span className="text-xs font-black tracking-wider text-white uppercase truncate max-w-[120px]">{storeSettings.store_name || 'OurStore'}</span>
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Customizer</span>
        </div>
        <div className="w-[1px] h-6 bg-white/10 hidden sm:block shrink-0" />
        
        {/* Page Selector dropdown */}
        <div 
          className="flex items-center border px-2 sm:px-2.5 py-1.5 rounded-xl gap-1 sm:gap-1.5 text-xs font-bold text-white min-w-0 shrink"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', borderColor: 'rgba(0, 0, 0, 0.15)' }}
        >
          <span className="text-white/70 hidden sm:inline shrink-0 text-[11px]">Page:</span>
          <select
            value={activePage}
            onChange={(e) => {
              const newPage = e.target.value as 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance';
              setActivePage(newPage);
              if (newPage === 'home') {
                setActiveSectionId(sectionsFirstId);
                setActiveSubTab('');
              } else if (newPage === 'product_detail') {
                const firstBlock = (storeSettings.product_page_layout || ['details', 'ticker', 'reviews', 'related', 'recently_viewed', 'social_feed'])[0];
                setActiveSectionId(firstBlock);
                const tabMap: Record<string, string> = {
                  details: 'swatches',
                  ticker: 'ticker',
                  reviews: 'urgency',
                  related: 'delivery'
                };
                setActiveSubTab(tabMap[firstBlock] || 'swatches');
              } else if (newPage === 'shop') {
                setActiveSectionId(null);
                setActiveSubTab('swatches');
              } else if (newPage === 'product_card') {
                setActiveSectionId(null);
                setActiveSubTab('');
              } else if (newPage === 'global') {
                setActiveSectionId(null);
                setActiveSubTab('branding');
              } else if (newPage === 'appearance') {
                setActiveSectionId(null);
                setActiveSubTab('');
              }
            }}
            className="bg-transparent border-none focus:ring-0 text-white font-black cursor-pointer outline-none truncate max-w-[90px] sm:max-w-[120px] md:max-w-[150px] text-xs"
          >
            <option value="home" className="bg-[#1a1a2e] text-white">Home Page</option>
            <option value="shop" className="bg-[#1a1a2e] text-white">Shop Page</option>
            <option value="product_detail" className="bg-[#1a1a2e] text-white">Product Details</option>
            <option value="product_card" className="bg-[#1a1a2e] text-white">Product Cards</option>
            <option value="global" className="bg-[#1a1a2e] text-white">Global Settings</option>
            <option value="appearance" className="bg-[#1a1a2e] text-white">Appearance / Presets</option>
          </select>
        </div>
      </div>

      {/* Center: Viewport Switcher */}
      <div 
        className="flex border p-0.5 rounded-xl shrink-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', borderColor: 'rgba(0, 0, 0, 0.15)' }}
      >
        <button
          onClick={() => setViewportMode('desktop')}
          className={`px-2 lg:px-3 py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            viewportMode === 'desktop'
              ? 'bg-[#e94560] text-white shadow-sm'
              : 'text-white/75 hover:text-white'
          }`}
          title="Desktop View"
        >
          <Monitor className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline">Desktop</span>
        </button>
        <button
          onClick={() => setViewportMode('tablet')}
          className={`px-2 lg:px-3 py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            viewportMode === 'tablet'
              ? 'bg-[#e94560] text-white shadow-sm'
              : 'text-white/75 hover:text-white'
          }`}
          title="Tablet View"
        >
          <Tablet className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline">Tablet</span>
        </button>
        <button
          onClick={() => setViewportMode('mobile')}
          className={`px-2 lg:px-3 py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            viewportMode === 'mobile'
              ? 'bg-[#e94560] text-white shadow-sm'
              : 'text-white/75 hover:text-white'
          }`}
          title="Mobile View"
        >
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline">Mobile</span>
        </button>
      </div>

      {/* Right: Save Button */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onSaveLayout}
          disabled={isPending}
          className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-[#e94560] hover:bg-[#d83550] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
          ) : (
            <Check className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="hidden sm:inline">Save Layout</span>
        </button>
      </div>
    </header>
  );
}
