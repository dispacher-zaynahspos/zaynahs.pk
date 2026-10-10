'use client';

import { Tag } from '@/components/common/Icons';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import { toast } from 'sonner';
import SectionStackRow from './SectionStackRow';

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
  const isFlashSaleDisabled = !isFeatureEnabled(storeSettings, 'flash_sale');
  const currentLayout = storeSettings.product_page_layout || [
    'details',
    'ticker',
    'reviews',
    'related',
    'recently_viewed',
    'social_feed',
  ];
  const hiddenBlocks = storeSettings.product_page_hidden_blocks || [];

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
          <Tag className="h-4 w-4 text-[#e94560]" />
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

        {/* Blocks List — shared SectionStackRow (locked core blocks: move + hide only) */}
        <div className="space-y-2">
          {currentLayout.map((blockId, idx, arr) => {
            const isFeatureDisabled =
              blockId === 'social_feed' && !isFeatureEnabled(storeSettings, 'social_feeds');
            const isHidden = hiddenBlocks.includes(blockId);
            const tabMap: Record<string, string> = {
              details: 'details',
              ticker: 'ticker',
              reviews: 'reviews',
              related: 'related',
              recently_viewed: 'recently_viewed',
              social_feed: 'social_feed',
            };
            const move = (dir: 'up' | 'down') => {
              const t = dir === 'up' ? idx - 1 : idx + 1;
              if (t < 0 || t > arr.length - 1) return;
              const newLayout = [...arr];
              const tmp = newLayout[idx];
              newLayout[idx] = newLayout[t];
              newLayout[t] = tmp;
              setStoreSettings((prev) => ({ ...prev, product_page_layout: newLayout }));
            };
            return (
              <SectionStackRow
                key={blockId}
                title={blockLabels[blockId] || blockId}
                subtitle={blockId.replace(/_/g, ' ')}
                isActive={activeSectionId === blockId}
                isDisabled={isFeatureDisabled}
                isVisible={!isHidden}
                isFirst={idx === 0}
                isLast={idx === arr.length - 1}
                renaming={false}
                renameValue=""
                onSelect={() => {
                  setActiveSectionId(blockId);
                  setActiveSubTab(tabMap[blockId] || blockId);
                }}
                onToggleVisible={() => {
                  const nextHidden = isHidden
                    ? hiddenBlocks.filter((b) => b !== blockId)
                    : [...hiddenBlocks, blockId];
                  setStoreSettings((prev) => ({ ...prev, product_page_hidden_blocks: nextHidden }));
                }}
                onStartRename={() => {}}
                onRenameChange={() => {}}
                onCommitRename={() => {}}
                onCancelRename={() => {}}
                onMoveUp={() => move('up')}
                onMoveDown={() => move('down')}
                onDelete={() => {}}
                lockActions
                hideMenu
              />
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
                block.id === 'social_feed' && !isFeatureEnabled(storeSettings, 'social_feeds');

              return (
                <button
                  key={block.id}
                  onClick={() => {
                    if (isFeatureDisabled) {
                      toast.error('🔒 Social Feeds is disabled! Enable it in Settings > Premium Tab.');
                      return;
                    }
                    const newLayout = [...currentLayout, block.id];
                    setStoreSettings((prev) => ({ ...prev, product_page_layout: newLayout }));
                    setActiveSectionId(block.id);
                    const tabMap: Record<string, string> = {
                      details: 'details',
                      ticker: 'ticker',
                      reviews: 'reviews',
                      related: 'related',
                      recently_viewed: 'recently_viewed',
                      social_feed: 'social_feed',
                    };
                    setActiveSubTab(tabMap[block.id] || block.id);
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
