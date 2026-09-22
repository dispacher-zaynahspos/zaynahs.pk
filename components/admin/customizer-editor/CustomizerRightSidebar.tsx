'use client';

import React from 'react';
import { HomepageSection, StoreSettings, Category, Product, Collection, Review } from '@/lib/types';
import { Settings, X, Lock } from '@/components/common/Icons';
import HeroBannerSettings from '../customizer/sections/HeroBannerSettings';
import ProductGridSettings from '../customizer/sections/ProductGridSettings';
import CategoryListSettings from '../customizer/sections/CategoryListSettings';
import CategoryGridSettings from '../customizer/sections/CategoryGridSettings';
import CollectionsGridSettings from '../customizer/sections/CollectionsGridSettings';
import PromoBannerSettings from '../customizer/sections/PromoBannerSettings';
import RecentReviewsSettings from '../customizer/sections/RecentReviewsSettings';
import BrandsLogosSettings from '../customizer/sections/BrandsLogosSettings';
import SocialFeedSettings from '../customizer/sections/SocialFeedSettings';
import FlashSaleSettings from '../customizer/sections/FlashSaleSettings';

import ShopPageSettings from '../customizer/pages/ShopPageSettings';
import ProductDetailPageSettings from '../customizer/pages/ProductDetailPageSettings';
import GlobalSettings from '../customizer/pages/GlobalSettings';
import { AppearanceCustomizePanel } from '../customizer/pages/AppearanceSettings';
import ProductCardSettings from '../customizer/pages/ProductCardSettings';
import { AnnouncementBarSettings } from './sidebar/AnnouncementBarSettings';
import { TickerSectionSettings } from './sidebar/TickerSectionSettings';

interface CustomizerRightSidebarProps {
  mobileTab: 'preview' | 'sections' | 'settings';
  setMobileTab: (tab: 'preview' | 'sections' | 'settings') => void;
  activePage: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance';
  activeSectionId: string | null;
  activeSection: HomepageSection | null;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  categories: Category[];
  products: Product[];
  collections: Collection[];
  reviews: Review[];
  handleUpdateSection: (id: string, updates: Partial<HomepageSection>) => void;
  setMediaUploadTarget: (target: any) => void;
  setIsMediaModalOpen: (open: boolean) => void;
  setMediaSelectCallback: (cb: any) => void;
  activeSubTab: string;
  currentProduct?: Product | null;
  handleUpdateProductSale: (id: string, updates: Partial<Product>) => void;
}

export function CustomizerRightSidebar({
  mobileTab,
  setMobileTab,
  activePage,
  activeSectionId,
  activeSection,
  storeSettings,
  setStoreSettings,
  viewportMode,
  categories,
  products,
  collections,
  reviews,
  handleUpdateSection,
  setMediaUploadTarget,
  setIsMediaModalOpen,
  setMediaSelectCallback,
  activeSubTab,
  currentProduct,
  handleUpdateProductSale
}: CustomizerRightSidebarProps) {
  return (
    <aside className={`w-96 flex-shrink-0 flex flex-col bg-white dark:bg-[#16162a] border-l border-gray-200 dark:border-gray-800 overflow-hidden h-full ${mobileTab === 'settings' ? 'fixed inset-0 z-50' : 'hidden'} md:flex md:static md:z-auto`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/2 bg-surface-2 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-[#e94560]" />
          <h3 className="font-extrabold text-xs tracking-wider text-gray-900 dark:text-white uppercase">
            {activePage === 'home' ? 'Section Settings' : `${activePage.replace('_', ' ')} Settings`}
          </h3>
        </div>
        <button
          onClick={() => setMobileTab('preview')}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activePage === 'home' ? (
          activeSectionId === 'announcement_bar' ? (
            <AnnouncementBarSettings
              storeSettings={storeSettings}
              setStoreSettings={setStoreSettings}
            />
          ) : activeSection ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                    {activeSection.title || activeSection.section_type.replace('_', ' ')}
                  </h4>
                </div>
                <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
                  {activeSection.section_type.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  Section Title
                </label>
                <input
                  type="text"
                  value={activeSection.title || ''}
                  onChange={e => handleUpdateSection(activeSection.id, { title: e.target.value })}
                  placeholder="e.g. Featured Collection"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>

              {activeSection.section_type === 'hero_banner' && (
                <HeroBannerSettings
                  section={activeSection}
                  viewportMode={viewportMode}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                  onSelectMedia={(fieldPath, fieldKey, isSlide, slideId) => {
                    setMediaUploadTarget({ sectionId: activeSection.id, fieldPath, fieldKey, isSlide, slideId });
                    setIsMediaModalOpen(true);
                  }}
                />
              )}

              {activeSection.section_type === 'product_grid' && (
                <ProductGridSettings
                  section={activeSection}
                  categories={categories}
                  products={products}
                  viewportMode={viewportMode}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                />
              )}

              {activeSection.section_type === 'category_list' && (
                <CategoryListSettings
                  section={activeSection}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                />
              )}

              {activeSection.section_type === 'category_grid' && (
                <CategoryGridSettings
                  section={activeSection}
                  categories={categories}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                  onSelectMedia={(fieldPath, fieldKey, isGridItem, gridIndex) => {
                    setMediaUploadTarget({ sectionId: activeSection.id, fieldPath, fieldKey, isGridItem, gridIndex });
                    setIsMediaModalOpen(true);
                  }}
                />
              )}

              {activeSection.section_type === 'collections_grid' && (
                <CollectionsGridSettings
                  section={activeSection}
                  categories={categories}
                  collections={collections}
                  viewportMode={viewportMode}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                  onSelectMedia={(fieldPath, fieldKey, isGridItem, gridIndex) => {
                    setMediaUploadTarget({ sectionId: activeSection.id, fieldPath, fieldKey, isGridItem, gridIndex });
                    setIsMediaModalOpen(true);
                  }}
                />
              )}

              {activeSection.section_type === 'promo_banner' && (
                <PromoBannerSettings
                  section={activeSection}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                />
              )}

              {activeSection.section_type === 'trust_badges' && (
                <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-start gap-2">
                  <Lock className="h-4 w-4 text-[#e94560] flex-shrink-0 mt-0.5" />
                  <span>
                    Individual badges, descriptions, and icons are controlled in the General Settings &gt; Premium Features tab. Customize them there.
                  </span>
                </div>
              )}

              {activeSection.section_type === 'recent_reviews' && (
                <RecentReviewsSettings
                  section={activeSection}
                  reviews={reviews}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                />
              )}

              {activeSection.section_type === 'brands_logos' && (
                <BrandsLogosSettings
                  section={activeSection}
                  onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                />
              )}

              {activeSection.section_type === 'social_feed' && (
                storeSettings.social_feeds_enabled === false ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/2 py-12">
                    <span className="text-3xl">🔒</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Social Feed Locked</h4>
                    <p className="text-[11px] text-gray-500 leading-normal max-w-[200px]">
                      This feature is disabled in your store settings. Please enable &quot;Social Feeds Embeds&quot; in Settings &gt; Premium Tab first.
                    </p>
                  </div>
                ) : (
                  <SocialFeedSettings
                    section={activeSection}
                    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                    onSelectMedia={(onSelect) => {
                      setMediaSelectCallback(() => onSelect);
                      setIsMediaModalOpen(true);
                    }}
                  />
                )
              )}

              {activeSection.section_type === 'ticker' && (
                <TickerSectionSettings
                  activeSection={activeSection}
                  storeSettings={storeSettings}
                  setStoreSettings={setStoreSettings}
                  handleUpdateSection={handleUpdateSection}
                />
              )}

              {activeSection.section_type === 'flash_sale' && (
                storeSettings.flash_sale_enabled === false ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/2 py-12">
                    <span className="text-3xl">🔒</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Flash Sale Locked</h4>
                    <p className="text-[11px] text-gray-500 leading-normal max-w-[200px]">
                      This feature is disabled in your store settings. Please enable &quot;Flash Sale Timers&quot; in Settings &gt; Premium Tab first.
                    </p>
                  </div>
                ) : (
                  <FlashSaleSettings
                    section={activeSection}
                    products={products}
                    categories={categories}
                    onUpdateSection={(updates) => handleUpdateSection(activeSection.id, updates)}
                  />
                )
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <Settings className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">No Section Selected</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1.5 max-w-[220px] leading-relaxed">
                  Click a section in the left stack or directly on the live storefront preview to begin editing properties.
                </p>
              </div>
            </div>
          )
        ) : activePage === 'shop' ? (
          <ShopPageSettings
            settings={storeSettings}
            viewportMode={viewportMode}
            onUpdateSettings={(updates) => setStoreSettings(prev => ({ ...prev, ...updates }))}
            subTab={activeSubTab as 'swatches' | 'layout'}
          />
        ) : activePage === 'product_detail' ? (
          <ProductDetailPageSettings
            settings={storeSettings}
            viewportMode={viewportMode}
            onUpdateSettings={(updates) => setStoreSettings(prev => ({ ...prev, ...updates }))}
            subTab={activeSubTab as any}
            currentProduct={currentProduct}
            onUpdateProduct={handleUpdateProductSale}
            onSelectMedia={(onSelect) => {
              setMediaSelectCallback(() => onSelect);
              setIsMediaModalOpen(true);
            }}
          />
        ) : activePage === 'appearance' ? (
          <AppearanceCustomizePanel
            settings={storeSettings}
            onUpdateSettings={(updates) => setStoreSettings(prev => ({ ...prev, ...updates }))}
          />
        ) : activePage === 'product_card' ? (
          <ProductCardSettings
            settings={storeSettings}
            onUpdateSettings={(updates: Partial<StoreSettings>) => setStoreSettings(prev => ({ ...prev, ...updates }))}
          />
        ) : (
          <GlobalSettings
            settings={storeSettings}
            onUpdateSettings={(updates) => setStoreSettings(prev => ({ ...prev, ...updates }))}
            subTab={activeSubTab as 'header' | 'footer' | 'branding'}
            onSelectMedia={(fieldKey) => {
              setMediaUploadTarget({ sectionId: 'global', fieldPath: 'settings', fieldKey });
              setIsMediaModalOpen(true);
            }}
          />
        )}
      </div>
    </aside>
  );
}
