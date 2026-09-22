'use client';

import React from 'react';

interface AIPromptsAndTemplatesProps {
  categoryDefaultTemplate: string;
  setCategoryDefaultTemplate: (val: string) => void;
  productDefaultTemplate: string;
  setProductDefaultTemplate: (val: string) => void;
  categoryDescriptionPrompt: string;
  setCategoryDescriptionPrompt: (val: string) => void;
  categoryDescriptionLimit: number;
  setCategoryDescriptionLimit: (val: number) => void;
  productDescriptionPrompt: string;
  setProductDescriptionPrompt: (val: string) => void;
  productDescriptionLimit: number;
  setProductDescriptionLimit: (val: number) => void;
  productShortPrompt: string;
  setProductShortPrompt: (val: string) => void;
  productShortLimit: number;
  setProductShortLimit: (val: number) => void;
  collectionDefaultTemplate: string;
  setCollectionDefaultTemplate: (val: string) => void;
  collectionDescriptionPrompt: string;
  setCollectionDescriptionPrompt: (val: string) => void;
  collectionDescriptionLimit: number;
  setCollectionDescriptionLimit: (val: number) => void;
}

export function AIPromptsAndTemplates({
  categoryDefaultTemplate,
  setCategoryDefaultTemplate,
  productDefaultTemplate,
  setProductDefaultTemplate,
  categoryDescriptionPrompt,
  setCategoryDescriptionPrompt,
  categoryDescriptionLimit,
  setCategoryDescriptionLimit,
  productDescriptionPrompt,
  setProductDescriptionPrompt,
  productDescriptionLimit,
  setProductDescriptionLimit,
  productShortPrompt,
  setProductShortPrompt,
  productShortLimit,
  setProductShortLimit,
  collectionDescriptionPrompt,
  setCollectionDescriptionPrompt,
  collectionDescriptionLimit,
  setCollectionDescriptionLimit,
}: AIPromptsAndTemplatesProps) {
  return (
    <>
      {/* Custom prompt instructions & word limits */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors col-span-1 md:col-span-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Writing Prompts & Word Limits</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Configure target word limits and custom copywriting guidelines/prompts for category descriptions, product descriptions, and product short descriptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category Description */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Category Description</h4>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
              <textarea
                rows={4}
                value={categoryDescriptionPrompt}
                onChange={(e) => setCategoryDescriptionPrompt(e.target.value)}
                placeholder="e.g. Focus on fabric care instructions, sizing recommendations for kids age 1-14 years, and summer/festive styling tips."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
              <input
                type="number"
                value={categoryDescriptionLimit || ''}
                onChange={(e) => setCategoryDescriptionLimit(e.target.value ? Number(e.target.value) : 0)}
                placeholder="150"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Product Description</h4>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
              <textarea
                rows={4}
                value={productDescriptionPrompt}
                onChange={(e) => setProductDescriptionPrompt(e.target.value)}
                placeholder="e.g. Include detailed features, premium fabric quality, color choices, and wash instructions in list format."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
              <input
                type="number"
                value={productDescriptionLimit || ''}
                onChange={(e) => setProductDescriptionLimit(e.target.value ? Number(e.target.value) : 0)}
                placeholder="250"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560] transition-all"
              />
            </div>
          </div>

          {/* Product Short Description */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Product Short Description</h4>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
              <textarea
                rows={4}
                value={productShortPrompt}
                onChange={(e) => setProductShortPrompt(e.target.value)}
                placeholder="e.g. Write a catchy single paragraph highlight of the outfit to grab immediate attention with a call-to-action."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-855 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
              <input
                type="number"
                value={productShortLimit || ''}
                onChange={(e) => setProductShortLimit(e.target.value ? Number(e.target.value) : 0)}
                placeholder="100"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-855 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Collection Description */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500">Collection Description</h4>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Prompt Instructions</label>
              <textarea
                rows={4}
                value={collectionDescriptionPrompt}
                onChange={(e) => setCollectionDescriptionPrompt(e.target.value)}
                placeholder="e.g. Focus on premium quality, curated styles, and perfect fits."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">Word Limit</label>
              <input
                type="number"
                value={collectionDescriptionLimit || ''}
                onChange={(e) => setCollectionDescriptionLimit(e.target.value ? Number(e.target.value) : 0)}
                placeholder="100"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#16162a] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rich default templates */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors col-span-1 md:col-span-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Default HTML copy guidelines</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Provide default structured guidelines/HTML code skeleton wrappers that the AI Copywriter should follow when generating long description fields.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Category Default Template (HTML)</label>
            <textarea
              rows={4}
              value={categoryDefaultTemplate}
              onChange={(e) => setCategoryDefaultTemplate(e.target.value)}
              placeholder="e.g., <p>Discover premium {{category_name}} crafted for daily wear...</p>"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Product Default Template (HTML)</label>
            <textarea
              rows={4}
              value={productDefaultTemplate}
              onChange={(e) => setProductDefaultTemplate(e.target.value)}
              placeholder="e.g., <p>Get {{product_name}} with soft cotton fabric...</p>"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </>
  );
}
