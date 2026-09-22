'use client';

import React from 'react';
import { StoreSettings, Product } from '@/lib/types';

interface ProductDetailTabsProps {
  product: Product;
  settings: StoreSettings;
  activeDetailTab: 'description' | 'faq' | 'returns';
  setActiveDetailTab: (tab: 'description' | 'faq' | 'returns') => void;
  isDescExpanded: boolean;
  setIsDescExpanded: (expanded: boolean) => void;
}

const isHtml = (str: string) => /<[a-z][\s\S]*>/i.test(str);

export default function ProductDetailTabs({
  product,
  settings,
  activeDetailTab,
  setActiveDetailTab,
  isDescExpanded,
  setIsDescExpanded,
}: ProductDetailTabsProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 overflow-x-auto scrollbar-none pb-2">
        <button
          type="button"
          onClick={() => setActiveDetailTab('description')}
          className={`text-sm font-bold pb-2 transition-all cursor-pointer relative shrink-0 ${activeDetailTab === 'description'
            ? 'text-[#e94560] border-b-2 border-[#e94560]'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
          }`}
        >
          Description
        </button>

        {settings.faqContent && (
          <button
            type="button"
            onClick={() => setActiveDetailTab('faq')}
            className={`text-sm font-bold pb-2 transition-all cursor-pointer relative shrink-0 ${activeDetailTab === 'faq'
              ? 'text-[#e94560] border-b-2 border-[#e94560]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            FAQ
          </button>
        )}

        {settings.returnPolicyContent && (
          <button
            type="button"
            onClick={() => setActiveDetailTab('returns')}
            className={`text-sm font-bold pb-2 transition-all cursor-pointer relative shrink-0 ${activeDetailTab === 'returns'
              ? 'text-[#e94560] border-b-2 border-[#e94560]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            Return & Exchange
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="py-6 text-sm text-gray-650 dark:text-gray-300 leading-relaxed font-medium animate-fade-in prose dark:prose-invert max-w-none">
        {activeDetailTab === 'description' && product.description && (
          <div>
            <div className={`relative transition-all duration-300 overflow-hidden ${!isDescExpanded ? 'max-h-48' : 'max-h-none'}`}>
              {isHtml(product.description) ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <div className="whitespace-pre-wrap">{product.description}</div>
              )}
              {/* Gradient overlay for fading out when collapsed */}
              {!isDescExpanded && product.description.length > 300 && (
                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white dark:from-[#16162a] to-transparent pointer-events-none" />
              )}
            </div>
            {product.description.length > 300 && (
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-3 text-xs font-bold text-[#e94560] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isDescExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        {activeDetailTab === 'faq' && settings.faqContent && (
          isHtml(settings.faqContent) ? (
            <div dangerouslySetInnerHTML={{ __html: settings.faqContent }} />
          ) : (
            <div className="whitespace-pre-wrap">{settings.faqContent}</div>
          )
        )}

        {activeDetailTab === 'returns' && settings.returnPolicyContent && (
          isHtml(settings.returnPolicyContent) ? (
            <div dangerouslySetInnerHTML={{ __html: settings.returnPolicyContent }} />
          ) : (
            <div className="whitespace-pre-wrap">{settings.returnPolicyContent}</div>
          )
        )}
      </div>
    </div>
  );
}
