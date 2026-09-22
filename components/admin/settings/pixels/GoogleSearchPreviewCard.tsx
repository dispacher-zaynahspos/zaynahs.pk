'use client';

import React, { useState, useMemo } from 'react';
import { Smartphone, Monitor, Globe } from '@/components/common/Icons';

interface GoogleSearchPreviewCardProps {
  metaTitle: string;
  metaDescription: string;
  metaTitleSuffix: string;
  storeName: string;
  storeUrl: string;
  faviconUrl?: string;
}

export default function GoogleSearchPreviewCard({
  metaTitle,
  metaDescription,
  metaTitleSuffix,
  storeName,
  storeUrl,
  faviconUrl,
}: GoogleSearchPreviewCardProps) {
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');

  const cleanDomain = useMemo(() => {
    if (!storeUrl) return 'yourstore.com';
    try {
      const parsed = new URL(storeUrl);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return storeUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] || 'yourstore.com';
    }
  }, [storeUrl]);

  const finalTitle = (metaTitle || storeName) + (metaTitleSuffix || '');
  const finalDesc = metaDescription || 'Please enter a homepage meta description to preview how your website summary text will appear in search results.';

  const displayTitle = finalTitle.length > 60 ? finalTitle.slice(0, 58) + '...' : finalTitle;
  const displayDesc = finalDesc.length > 160 ? finalDesc.slice(0, 158) + '...' : finalDesc;

  const titleStatus = useMemo(() => {
    const len = finalTitle.length;
    if (len === 0) return { score: 'empty', label: 'Empty', color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' };
    if (len < 30) return { score: 'too_short', label: 'Too Short', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50' };
    if (len <= 60) return { score: 'perfect', label: 'Perfect Length', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' };
    return { score: 'too_long', label: 'Too Long (Trims on Google)', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50' };
  }, [finalTitle]);

  const descStatus = useMemo(() => {
    const len = finalDesc.length;
    if (!metaDescription) return { score: 'empty', label: 'Empty', color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' };
    if (len < 110) return { score: 'too_short', label: 'Too Short', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50' };
    if (len <= 160) return { score: 'perfect', label: 'Perfect Length', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' };
    return { score: 'too_long', label: 'Too Long (Trims on Google)', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50' };
  }, [finalDesc, metaDescription]);

  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            Google Search Preview
          </h3>
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
            Live simulation of how your store appears in Google search results.
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-[#0f0f1b] p-0.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewDevice === 'desktop'
                ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewDevice === 'mobile'
                ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>
      </div>

      <div className="border border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 p-5 rounded-2xl transition-all">
        {previewDevice === 'desktop' ? (
          <div className="font-sans text-left max-w-full overflow-hidden leading-normal">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200/65 dark:border-gray-700 shadow-sm shrink-0">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon" className="w-3.5 h-3.5 rounded-full object-contain" />
                ) : (
                  <Globe className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                  {storeName}
                </span>
                <span className="text-[11px] text-gray-450 dark:text-gray-500 leading-none">
                  {storeUrl || `https://${cleanDomain}`}
                </span>
              </div>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline block font-normal mb-1">
              {displayTitle}
            </a>
            <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed break-words font-normal">
              {displayDesc}
            </p>
          </div>
        ) : (
          <div className="font-sans text-left max-w-[340px] mx-auto overflow-hidden leading-normal">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200/65 dark:border-gray-700 shadow-sm shrink-0">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon" className="w-4.5 h-4.5 rounded-full object-contain" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight">
                  {storeName}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                  {storeUrl || `https://${cleanDomain}`}
                </span>
              </div>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[18px] text-[#15c] dark:text-[#8ab4f8] hover:underline block font-medium mb-1 leading-snug">
              {displayTitle}
            </a>
            <p className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-snug break-words font-normal">
              {displayDesc}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className={`p-3 rounded-xl border flex flex-col gap-1 ${titleStatus.color}`}>
          <div className="flex items-center justify-between font-bold">
            <span>Title Length</span>
            <span className="text-[10px] font-black uppercase tracking-wider">{titleStatus.label}</span>
          </div>
          <div className="flex justify-between items-baseline mt-1 text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-lg">{finalTitle.length} <span className="text-[10px] font-normal text-gray-500">chars</span></span>
            <span className="text-[10px] font-medium opacity-80">Ideal: 50-60</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex flex-col gap-1 ${descStatus.color}`}>
          <div className="flex items-center justify-between font-bold">
            <span>Description Length</span>
            <span className="text-[10px] font-black uppercase tracking-wider">{descStatus.label}</span>
          </div>
          <div className="flex justify-between items-baseline mt-1 text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-lg">{metaDescription ? finalDesc.length : 0} <span className="text-[10px] font-normal text-gray-500">chars</span></span>
            <span className="text-[10px] font-medium opacity-80">Ideal: 120-160</span>
          </div>
        </div>
      </div>
    </div>
  );
}
