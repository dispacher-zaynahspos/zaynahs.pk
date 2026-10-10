'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { ChevronLeft, Monitor, Tablet, Smartphone, Check, RefreshCw, ChevronDown, RotateCcw } from '@/components/common/Icons';

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
  isDirty?: boolean;
  onDiscard?: () => void;
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
  isDirty = false,
  onDiscard,
  sectionsFirstId
}: CustomizerTopBarProps) {
  const router = useRouter();

  return (
    <header 
      className="h-16 text-white border-b border-white/10 flex items-center justify-between px-2 sm:px-4 lg:px-6 z-50 shadow-md flex-shrink-0 gap-2 overflow-hidden transition-colors"
      style={{ 
        backgroundColor: storeSettings.header_top_bar_bg || 
          storeSettings.theme_config?.colors?.headerTopBarBg || 
          storeSettings.theme_config?.colors?.primary || 
          '#1a1a2e' 
      }}
    >
      {/* Left: Back to Dashboard & Page Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-1 sm:gap-1.5 text-white/80 hover:text-white px-2 sm:px-2.5 py-1.5 hover:bg-white/10 rounded-xl transition-all font-bold text-xs cursor-pointer select-none shrink-0"
          title="Back to Dashboard"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Dashboard</span>
        </button>
        <div className="w-[1px] h-6 bg-white/15 hidden xl:block shrink-0" />
        <div className="hidden xl:flex flex-col items-start leading-none gap-0.5 mr-1 shrink-0">
          <span className="text-xs font-black tracking-wider text-white uppercase truncate max-w-[120px]">{storeSettings.store_name || 'OurStore'}</span>
          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Customizer</span>
        </div>
        <div className="w-[1px] h-6 bg-white/15 hidden sm:block shrink-0" />
        
        {/* Page Selector dropdown */}
        <div 
          className="flex items-center border px-2 sm:px-2.5 py-1 rounded-xl gap-1.5 text-xs font-bold text-white min-w-0 shrink shadow-inner"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <span className="text-white/80 hidden sm:inline shrink-0 text-[11px] font-semibold">Page:</span>
          <div className="relative flex items-center">
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
                  const blockId = firstBlock || 'details';
                  setActiveSectionId(blockId);
                  setActiveSubTab(blockId);
                } else if (newPage === 'shop') {
                  setActiveSectionId(null);
                  setActiveSubTab('layout');
                } else if (newPage === 'product_card') {
                  setActiveSectionId(null);
                  setActiveSubTab('style');
                } else if (newPage === 'global') {
                  setActiveSectionId(null);
                  setActiveSubTab('branding');
                } else if (newPage === 'appearance') {
                  setActiveSectionId(null);
                  setActiveSubTab('');
                }
              }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#ffffff',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
              className="customizer-page-select appearance-none bg-black/30 text-white font-bold cursor-pointer outline-none border border-white/20 rounded-lg pl-2.5 pr-6 py-1 text-xs truncate max-w-[110px] sm:max-w-[140px] md:max-w-[170px]"
            >
              <option value="home" className="bg-[#1a1a2e] text-white">Home Page</option>
              <option value="shop" className="bg-[#1a1a2e] text-white">Shop Page</option>
              <option value="product_detail" className="bg-[#1a1a2e] text-white">Product Details</option>
              <option value="product_card" className="bg-[#1a1a2e] text-white">Product Cards</option>
              <option value="global" className="bg-[#1a1a2e] text-white">Global Settings</option>
              <option value="appearance" className="bg-[#1a1a2e] text-white">Appearance / Presets</option>
            </select>
            <ChevronDown className="h-3 w-3 text-white/80 absolute right-1.5 pointer-events-none" />
          </div>
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

      {/* Right: Discard + Save */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {isDirty && (
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider" title="You have unsaved changes">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Unsaved
          </span>
        )}
        {isDirty && onDiscard && (
          <button
            onClick={onDiscard}
            disabled={isPending}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Discard unsaved changes"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Discard</span>
          </button>
        )}
        <button
          onClick={onSaveLayout}
          disabled={isPending || !isDirty}
          className={`relative flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer ${
            isDirty ? 'bg-[#e94560] hover:bg-[#d83550]' : 'bg-[#e94560]/70'
          }`}
          title={isDirty ? 'Save all changes' : 'No unsaved changes'}
        >
          {isPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
          ) : (
            <Check className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="hidden sm:inline">Save Layout</span>
          {isDirty && !isPending && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#1a1a2e]" />
          )}
        </button>
      </div>
    </header>
  );
}
