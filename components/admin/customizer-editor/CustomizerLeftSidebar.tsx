'use client';

import React from 'react';
import { HomepageSection, StoreSettings } from '@/lib/types';
import { X } from '@/components/common/Icons';
import HomeSectionsStack from './sidebar/HomeSectionsStack';
import ProductDetailBlocksStack from './sidebar/ProductDetailBlocksStack';

interface CustomizerLeftSidebarProps {
  activePage: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance';
  mobileTab: 'preview' | 'sections' | 'settings';
  setMobileTab: (tab: 'preview' | 'sections' | 'settings') => void;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  sections: HomepageSection[];
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  setActivePage: (page: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance') => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  handleAddSection: (type: string) => void;
  handleUpdateSection: (id: string, updates: Partial<HomepageSection>) => void;
  handleMoveSection: (idx: number, dir: 'up' | 'down') => void;
  handleDeleteSection: (id: string) => void;
  currentProduct?: { name: string } | null;
}

export function CustomizerLeftSidebar({
  activePage,
  mobileTab,
  setMobileTab,
  storeSettings,
  setStoreSettings,
  sections,
  activeSectionId,
  setActiveSectionId,
  setActivePage,
  activeSubTab,
  setActiveSubTab,
  handleAddSection,
  handleUpdateSection,
  handleMoveSection,
  handleDeleteSection,
  currentProduct
}: CustomizerLeftSidebarProps) {
  return (
    <aside className={`w-80 flex-shrink-0 flex flex-col bg-white dark:bg-[#16162a] border-r border-gray-200 dark:border-gray-800 overflow-hidden h-full ${mobileTab === 'sections' ? 'fixed inset-0 z-50' : 'hidden'} md:flex md:static md:z-auto`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/2 bg-surface-2 flex-shrink-0 flex items-center justify-between">
        <h3 className="font-extrabold text-xs tracking-wider text-gray-900 dark:text-white uppercase">
          {activePage === 'home' ? 'Sections Stack' : `${activePage.replace('_', ' ')} Properties`}
        </h3>
        <button
          onClick={() => setMobileTab('preview')}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activePage === 'home' ? (
          <HomeSectionsStack
            storeSettings={storeSettings}
            sections={sections}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            setActivePage={setActivePage}
            handleAddSection={handleAddSection}
            handleUpdateSection={handleUpdateSection}
            handleMoveSection={handleMoveSection}
            handleDeleteSection={handleDeleteSection}
          />
        ) : activePage === 'shop' ? (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              Shop Page Properties
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'swatches', label: 'Color Swatches', desc: 'Display product variant colors on list cards' },
                { id: 'layout', label: 'Product Layout', desc: 'Grid aspect ratio, line limit, hover style' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                    {tab.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : activePage === 'product_detail' ? (
          <ProductDetailBlocksStack
            storeSettings={storeSettings}
            setStoreSettings={setStoreSettings}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            currentProduct={currentProduct}
          />
        ) : activePage === 'product_card' ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                Product Cards Design
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                Choose templates and configure card layout preferences applied globally to all catalog grids, shop listings, and recommended sliders.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              Global Store Settings
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'branding', label: 'Store Branding', desc: 'Upload store logo and favicon details' },
                { id: 'header', label: 'Header & Topbar', desc: 'Stickiness, newsletter banners, phone/email' },
                { id: 'footer', label: 'Footer & Social', desc: 'Copyright messages, social handles links' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                    {tab.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
