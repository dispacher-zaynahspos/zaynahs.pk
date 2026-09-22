'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { GripVertical, EyeOff, ChevronUp, ChevronDown } from '@/components/common/Icons';
import { toast } from 'sonner';

interface ProductDetailBlocksStackProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  currentProduct?: { name: string } | null;
}

export default function ProductDetailBlocksStack({
  storeSettings,
  setStoreSettings,
  activeSectionId,
  setActiveSectionId,
  activeSubTab,
  setActiveSubTab,
  currentProduct,
}: ProductDetailBlocksStackProps) {
  const isFlashSaleDisabled = storeSettings.flash_sale_enabled === false;
  const currentLayout = storeSettings.productPageLayout || [
    'details',
    'ticker',
    'reviews',
    'related',
    'recently_viewed',
    'social_feed',
  ];

  const blockLabels: Record<string, string> = {
    details: 'Product Details Component',
    ticker: 'Scrolling Announcement Ticker',
    reviews: 'Reviews & FAQ Feed',
    related: 'Related Products Grid',
    recently_viewed: 'Recently Viewed Products',
    social_feed: 'Social Feed Ribbon',
  };

  const availableBlocks = [
    { id: 'details', label: 'Product Details Component' },
    { id: 'ticker', label: 'Scrolling Announcement Ticker' },
    { id: 'reviews', label: 'Reviews & FAQ Feed' },
    { id: 'related', label: 'Related Products Grid' },
    { id: 'recently_viewed', label: 'Recently Viewed Products' },
    { id: 'social_feed', label: 'Social Feed Ribbon' },
  ].filter((b) => !currentLayout.includes(b.id));

  return (
    <div className="space-y-4">
      {/* Product Sale Configuration Tab */}
      <div
        onClick={() => {
          setActiveSectionId(null);
          setActiveSubTab('product_sale');
        }}
        className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer mb-4 ${
          activeSubTab === 'product_sale'
            ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🏷️</span>
          <div className="min-w-0 flex-grow">
            <div
              className={`text-xs font-bold ${
                isFlashSaleDisabled
                  ? 'text-gray-450 dark:text-gray-500 line-through font-semibold'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {isFlashSaleDisabled ? '🔒 ' : ''}Product Sale Settings
            </div>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block truncate max-w-[150px]">
              {isFlashSaleDisabled ? 'Disabled' : currentProduct?.name || 'No Product Active'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Product Detail Blocks Stack
        </label>

        {/* Blocks List */}
        <div className="space-y-2">
          {currentLayout.map((blockId, idx, arr) => {
            const isActive = activeSectionId === blockId;
            return (
              <div
                key={blockId}
                onClick={() => {
                  setActiveSectionId(blockId);
                  const tabMap: Record<string, string> = {
                    details: 'swatches',
                    ticker: 'ticker',
                    reviews: 'urgency',
                    related: 'related',
                    recently_viewed: 'recently_viewed',
                    social_feed: 'social_feed',
                  };
                  setActiveSubTab(tabMap[blockId] || 'swatches');
                }}
                className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {(() => {
                    const isFeatureDisabled =
                      blockId === 'social_feed' && storeSettings.social_feeds_enabled === false;

                    return (
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs font-bold truncate ${
                            isFeatureDisabled
                              ? 'text-gray-450 dark:text-gray-500 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {isFeatureDisabled ? '🔒 ' : ''}
                          {blockLabels[blockId] || blockId}
                        </div>
                        <span className="text-[9px] text-gray-455 dark:text-gray-500 font-bold uppercase tracking-wider">
                          {blockId} {isFeatureDisabled && '(Disabled)'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      const newLayout = arr.filter((b) => b !== blockId);
                      setStoreSettings((prev) => ({ ...prev, productPageLayout: newLayout }));
                      if (activeSectionId === blockId) {
                        setActiveSectionId(null);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer animate-none"
                    title="Hide block"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={idx === 0}
                    onClick={() => {
                      const newLayout = [...arr];
                      const temp = newLayout[idx];
                      newLayout[idx] = newLayout[idx - 1];
                      newLayout[idx - 1] = temp;
                      setStoreSettings((prev) => ({ ...prev, productPageLayout: newLayout }));
                    }}
                    className="p-1 text-gray-400 hover:text-gray-650 dark:hover:text-white disabled:opacity-30 cursor-pointer animate-none"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={idx === arr.length - 1}
                    onClick={() => {
                      const newLayout = [...arr];
                      const temp = newLayout[idx];
                      newLayout[idx] = newLayout[idx + 1];
                      newLayout[idx + 1] = temp;
                      setStoreSettings((prev) => ({ ...prev, productPageLayout: newLayout }));
                    }}
                    className="p-1 text-gray-400 hover:text-gray-650 dark:hover:text-white disabled:opacity-30 cursor-pointer animate-none"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Block Widget */}
      {availableBlocks.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            + Add Page Block
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {availableBlocks.map((block) => {
              const isFeatureDisabled =
                block.id === 'social_feed' && storeSettings.social_feeds_enabled === false;

              return (
                <button
                  key={block.id}
                  onClick={() => {
                    if (isFeatureDisabled) {
                      toast.error('🔒 Social Feeds is disabled! Enable it in Settings > Premium Tab.');
                      return;
                    }
                    const newLayout = [...currentLayout, block.id];
                    setStoreSettings((prev) => ({ ...prev, productPageLayout: newLayout }));
                    setActiveSectionId(block.id);
                    const tabMap: Record<string, string> = {
                      details: 'swatches',
                      ticker: 'ticker',
                      reviews: 'urgency',
                      related: 'delivery',
                      recently_viewed: 'recently_viewed',
                      social_feed: 'social_feed',
                    };
                    setActiveSubTab(tabMap[block.id] || 'swatches');
                  }}
                  className={`px-2.5 py-1.5 text-left border rounded-xl transition-all text-[10px] font-bold truncate ${
                    isFeatureDisabled
                      ? 'bg-gray-105/50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-650 cursor-not-allowed'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800/80 hover:border-[#e94560] dark:hover:border-[#e94560] text-gray-700 dark:text-gray-300 cursor-pointer'
                  }`}
                >
                  {isFeatureDisabled ? '🔒 ' : ''}
                  {block.label.replace(' Component', '').replace(' Grid', '').replace(' Feed', '')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
