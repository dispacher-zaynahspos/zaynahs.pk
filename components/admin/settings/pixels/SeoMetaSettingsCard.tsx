'use client';

import React, { useMemo } from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle } from '@/components/common/Icons';

interface SeoMetaSettingsCardProps {
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  metaTitleSuffix: string;
  setMetaTitleSuffix: (val: string) => void;
  twitterHandle: string;
  setTwitterHandle: (val: string) => void;
  storeName: string;
}

export default function SeoMetaSettingsCard({
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  metaTitleSuffix,
  setMetaTitleSuffix,
  twitterHandle,
  setTwitterHandle,
  storeName,
}: SeoMetaSettingsCardProps) {
  const finalTitle = (metaTitle || storeName) + (metaTitleSuffix || '');
  const finalDesc = metaDescription || 'Please enter a homepage meta description to preview how your website summary text will appear in search results.';

  const titleStatusScore = useMemo(() => {
    const len = finalTitle.length;
    if (len === 0) return 'empty';
    if (len >= 30 && len <= 60) return 'perfect';
    return 'other';
  }, [finalTitle]);

  const descStatusScore = useMemo(() => {
    if (!metaDescription) return 'empty';
    const len = finalDesc.length;
    if (len >= 110 && len <= 160) return 'perfect';
    return 'other';
  }, [finalDesc, metaDescription]);

  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">SEO & Social Meta</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Configure how your site title is displayed in search results and social cards.
      </p>

      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Homepage Meta Title (SEO Title)
              </label>
              <div className="relative group inline-block text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-[11px] leading-relaxed text-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-800">
                  The main title of your homepage shown in search results. Include your brand name and key products. Recommendation: 50-60 characters.
                </div>
              </div>
            </div>
            {titleStatusScore === 'perfect' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {titleStatusScore === 'empty' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="e.g. OurStore E-Store | Kids Premium Clothing"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
          <span className="text-[10px] text-gray-450 dark:text-gray-500 mt-1 block">
            Leave blank to default to Store Name (e.g. "{metaTitle || storeName || 'OurStore'}").
          </span>
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Homepage Meta Description (SEO Description)
              </label>
              <div className="relative group inline-block text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-[11px] leading-relaxed text-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-800">
                  A summary text that displays under your title in search results. Mention discounts, collections, and WhatsApp ordering. Ideal length: 120-160 characters.
                </div>
              </div>
            </div>
            {descStatusScore === 'perfect' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {descStatusScore === 'empty' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="e.g. Shop the best premium quality kids wear, boys and girls clothing in Pakistan. Best fabric and designs with fast WhatsApp checkout."
            rows={4}
            maxLength={160}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
          />
          <div className="flex justify-between text-[10px] text-gray-450 dark:text-gray-500 mt-1">
            <span>Google search snippets main show hone wali summary text.</span>
            <span className={metaDescription.length > 160 ? 'text-red-500 font-bold' : ''}>
              {metaDescription.length} / 160 chars
            </span>
          </div>
        </div>

        {/* Meta Title Suffix */}
        <div>
          <div className="flex items-center gap-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Meta Title Suffix (e.g. " | OurStore")
            </label>
            <div className="relative group inline-block text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help">
              <HelpCircle className="w-3.5 h-3.5" />
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-[11px] leading-relaxed text-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-800">
                A branding suffix appended automatically to every product page and collection page title (e.g., 'Product Name | BrandName').
              </div>
            </div>
          </div>
          <input
            type="text"
            value={metaTitleSuffix}
            onChange={(e) => setMetaTitleSuffix(e.target.value)}
            placeholder="e.g.  | OurStore"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        {/* Twitter Handle */}
        <div>
          <div className="flex items-center gap-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Twitter / X Handle (e.g. "@zaynahs_pk")
            </label>
            <div className="relative group inline-block text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help">
              <HelpCircle className="w-3.5 h-3.5" />
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-[11px] leading-relaxed text-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-800">
                The Twitter creator/site handle for meta tag cards (e.g. @my_brand) used when users share your links on Twitter/X.
              </div>
            </div>
          </div>
          <input
            type="text"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="e.g. @zaynahs_pk"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
