'use client';

import React, { useState } from 'react';
import { Copy, Check, Sparkles, ChevronDown, ChevronUp, Info, HelpCircle } from '@/components/common/Icons';
import { toast } from 'sonner';

interface ProductSEOHelperProps {
  currentTitle?: string;
  onApplyTitle?: (title: string) => void;
}

export function ProductSEOHelper({ currentTitle = '', onApplyTitle }: ProductSEOHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const titleLength = currentTitle.length;
  const isOptimalLength = titleLength > 0 && titleLength <= 60;
  const isTooLong = titleLength > 60;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const copyablePrompt = `Generate an SEO-optimized product title, meta description, and image alt text for Pakistani e-commerce:

1. Product Title Formula (Under 60 chars):
[Gender] [Product] [Fabric] [Age Range] – [Season] | [Brand]
Examples:
- Boys Fleece Tracksuit 2-12 Years – Winter | Store.pk
- Girls Cord Set Cotton 1-10 Years – Summer | Store.pk
- Kids Night Suit Jersey 2-12 Years – COD Pakistan

2. Image Alt Text Formula:
[Gender] [Color] [Product] [Age Range] Pakistan
Example: Boys black fleece tracksuit 2-12 years Pakistan

3. Meta Description (150-160 chars):
[Keyword] in Pakistan. [Fabric/Quality]. Sizes [Age]. ✔ Cash on Delivery ✔ Free Delivery ✔ Easy Exchange. Order now!`;

  return (
    <div className="rounded-xl border border-blue-150 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 sm:p-3 text-xs transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3 h-3" /> SEO Formula
          </span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] sm:text-xs">
            Title SERP Limit:
          </span>
          <span
            className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
              titleLength === 0
                ? 'text-gray-400 bg-gray-150 dark:bg-gray-800'
                : isOptimalLength
                ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50'
                : 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50'
            }`}
          >
            {titleLength}/60 chars {isTooLong ? '(Over Google limit)' : isOptimalLength ? '✓ Optimal' : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
        >
          <span>{isOpen ? 'Hide Guide' : 'SEO Guide & Prompt'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable SEO Formula & Prompt Content */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/50 space-y-3 animate-in fade-in duration-150">
          {/* Formula Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {/* Title Formula */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#111124] border border-blue-100 dark:border-blue-900/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white uppercase text-[9px] tracking-wider text-blue-600 dark:text-blue-400">
                  Product Title Formula (&le;60 chars)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('[Gender] [Product] [Fabric] [Age] – [Season] | [Brand]', 'title_formula')}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  title="Copy Formula"
                >
                  {copiedType === 'title_formula' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="font-mono text-[10px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded">
                [Gender] [Product] [Fabric] [Age] – [Season] | [Brand]
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Example: <span className="text-gray-700 dark:text-gray-200 font-medium">Boys Fleece Tracksuit 2-12 Years – Winter | Store.pk</span>
              </p>
            </div>

            {/* Image SEO Formula */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#111124] border border-blue-100 dark:border-blue-900/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white uppercase text-[9px] tracking-wider text-purple-600 dark:text-purple-400">
                  Image Alt & File Formula
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('[Gender] [Color] [Product] [Age] Pakistan', 'img_formula')}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  title="Copy Formula"
                >
                  {copiedType === 'img_formula' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="font-mono text-[10px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded">
                Alt: [Gender] [Color] [Product] [Age] Pakistan
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                File: <span className="text-gray-700 dark:text-gray-200 font-medium">boys-black-fleece-tracksuit-2-12y.webp</span> (&le;100KB WebP)
              </p>
            </div>
          </div>

          {/* Master Copyable AI Prompt */}
          <div className="p-2.5 rounded-lg bg-white dark:bg-[#111124] border border-blue-100 dark:border-blue-900/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                1-Click Master SEO Copywriting Prompt (For ChatGPT / AI / Copywriter)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(copyablePrompt, 'master_prompt')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
              >
                {copiedType === 'master_prompt' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Prompt
                  </>
                )}
              </button>
            </div>
            <pre className="text-[9.5px] font-mono text-gray-600 dark:text-gray-400 bg-gray-50/70 dark:bg-gray-900/50 p-2 rounded max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-gray-150 dark:border-gray-800">
              {copyablePrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
