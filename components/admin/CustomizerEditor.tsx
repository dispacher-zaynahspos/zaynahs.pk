'use client';

import React from 'react';
import { Product, Category, StoreSettings, Review, HomepageSection, Collection } from '@/lib/types';
import { Settings, Smartphone } from '@/components/common/Icons';
import MediaSelectorModal from './MediaSelectorModal';
import {
  useCustomizerState,
  CustomizerTopBar,
  CustomizerLeftSidebar,
  CustomizerPreview,
  CustomizerRightSidebar
} from './customizer-editor';

interface CustomizerEditorProps {
  initialSections: HomepageSection[];
  products: Product[];
  categories: Category[];
  collections?: Collection[];
  settings: StoreSettings | null;
  reviews?: Review[];
}

export default function CustomizerEditor(props: CustomizerEditorProps) {
  const state = useCustomizerState(props);

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-hidden flex flex-col bg-gray-50 dark:bg-[#0f0f1b] select-none text-gray-900 dark:text-gray-100">
      
      {/* 1. TOP HEADER BAR */}
      <CustomizerTopBar
        storeSettings={state.storeSettings}
        activePage={state.activePage}
        setActivePage={state.setActivePage}
        setActiveSectionId={state.setActiveSectionId}
        setActiveSubTab={state.setActiveSubTab}
        viewportMode={state.viewportMode}
        setViewportMode={state.setViewportMode}
        isPending={state.isPending}
        onSaveLayout={state.handleSaveLayout}
        sectionsFirstId={state.sections[0]?.id || null}
      />

      {/* 2. THREE-COLUMN WORKSPACE */}
      <div className="flex-grow flex flex-row overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* LEFT COLUMN: Sections & Add Widgets */}
        <CustomizerLeftSidebar
          activePage={state.activePage}
          mobileTab={state.mobileTab}
          setMobileTab={state.setMobileTab}
          storeSettings={state.storeSettings}
          setStoreSettings={state.setStoreSettings}
          sections={state.sections}
          activeSectionId={state.activeSectionId}
          setActiveSectionId={state.setActiveSectionId}
          setActivePage={state.setActivePage}
          activeSubTab={state.activeSubTab}
          setActiveSubTab={state.setActiveSubTab}
          handleAddSection={state.handleAddSection}
          handleUpdateSection={state.handleUpdateSection}
          handleMoveSection={state.handleMoveSection}
          handleDeleteSection={state.handleDeleteSection}
          currentProduct={state.currentProduct}
        />

        {/* CENTER COLUMN: Fluid Live Preview */}
        <CustomizerPreview
          mobileTab={state.mobileTab}
          previewContainerRef={state.previewContainerRef}
          viewportMode={state.viewportMode}
          containerWidth={state.containerWidth}
          containerHeight={state.containerHeight}
          storeSettings={state.storeSettings}
          iframeRef={state.iframeRef}
        />

        {/* RIGHT COLUMN: Settings Adjustment Panel */}
        <CustomizerRightSidebar
          mobileTab={state.mobileTab}
          setMobileTab={state.setMobileTab}
          activePage={state.activePage}
          activeSectionId={state.activeSectionId}
          activeSection={state.activeSection}
          storeSettings={state.storeSettings}
          setStoreSettings={state.setStoreSettings}
          viewportMode={state.viewportMode}
          categories={props.categories}
          products={props.products}
          collections={props.collections || []}
          reviews={props.reviews || []}
          handleUpdateSection={state.handleUpdateSection}
          setMediaUploadTarget={state.setMediaUploadTarget}
          setIsMediaModalOpen={state.setIsMediaModalOpen}
          setMediaSelectCallback={state.setMediaSelectCallback}
          activeSubTab={state.activeSubTab}
          currentProduct={state.currentProduct}
          handleUpdateProductSale={state.handleUpdateProductSale}
        />

      </div>

      {/* 3. MOBILE BOTTOM TAB BAR */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-[#16162a] border-t border-gray-200 dark:border-gray-800 px-2 py-2 flex-shrink-0">
        <button
          onClick={() => state.setMobileTab('sections')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            state.mobileTab === 'sections' ? 'text-[#e94560] bg-[#e94560]/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="h-4 w-4" />
          Sections
        </button>
        <button
          onClick={() => state.setMobileTab('preview')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            state.mobileTab === 'preview' ? 'text-[#e94560] bg-[#e94560]/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Preview
        </button>
        <button
          onClick={() => state.setMobileTab('settings')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            state.mobileTab === 'settings' ? 'text-[#e94560] bg-[#e94560]/10' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* 4. MEDIA SELECTOR MODAL CONTAINER */}
      <MediaSelectorModal
        isOpen={state.isMediaModalOpen}
        onClose={() => state.setIsMediaModalOpen(false)}
        onSelect={state.handleMediaSelected}
        multiple={false}
      />
      
    </div>
  );
}
