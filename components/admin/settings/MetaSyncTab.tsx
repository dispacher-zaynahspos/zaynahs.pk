import React, { useEffect, useState } from 'react';
import { getCategories } from '@/lib/services/categories';
import { getMetaCategoryMappings, upsertMetaCategoryMapping } from '@/lib/services/metaCategory';
import { Category } from '@/lib/types';
import {
  Loader2,
  Save,
  Globe,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  RefreshCw
} from '@/components/common/Icons';
import { toast } from 'sonner';

const PRESETS = [
  'Apparel & Accessories > Clothing',
  'Apparel & Accessories > Clothing > Kids\' Clothing',
  'Apparel & Accessories > Clothing > Baby & Toddler Clothing',
  'Apparel & Accessories > Clothing > Activewear',
  'Apparel & Accessories > Clothing > Dresses',
  'Apparel & Accessories > Clothing > Outerwear',
  'Apparel & Accessories > Shoes',
  'Apparel & Accessories > Handbags, Wallets & Cases',
  'Apparel & Accessories > Jewelry',
  'Apparel & Accessories > Clothing Accessories',
  'Home & Garden',
];

export default function MetaSyncTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');

  useEffect(() => {
    // Resolve feed URL dynamically from client origin
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setFeedUrl(`${origin}/api/meta/catalog.xml`);

    async function loadData() {
      try {
        const [cats, maps] = await Promise.all([
          getCategories(),
          getMetaCategoryMappings()
        ]);
        
        setCategories(cats);
        
        const initialMaps: Record<string, string> = {};
        const initialCustoms: Record<string, string> = {};
        
        cats.forEach(cat => {
          const matched = maps.find(m => m.store_category_id === cat.id);
          if (matched) {
            initialMaps[cat.id] = matched.meta_category;
            if (!PRESETS.includes(matched.meta_category)) {
              initialCustoms[cat.id] = matched.meta_category;
            }
          } else {
            initialMaps[cat.id] = PRESETS[0]; // default fallback
          }
        });
        
        setMappings(initialMaps);
        setCustomInputs(initialCustoms);
      } catch (err) {
        toast.error('Failed to load category mappings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCopyFeed = async () => {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      toast.success('Feed URL copied to clipboard! Paste it in Meta Commerce Manager.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy automatically. Please copy the URL manually.');
    }
  };

  const handleSelectChange = (categoryId: string, value: string) => {
    setMappings(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleCustomInputChange = (categoryId: string, value: string) => {
    setCustomInputs(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(mappings).map(([catId, val]) => {
        const finalValue = val === 'custom' ? (customInputs[catId] || '').trim() : val;
        if (val === 'custom' && !finalValue) {
          throw new Error('Custom mapping value cannot be empty');
        }
        return upsertMetaCategoryMapping(catId, finalValue || 'Apparel & Accessories > Clothing');
      });

      await Promise.all(promises);
      toast.success('Meta category mappings saved successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save mappings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#1a1a2e] dark:text-[#e94560]" />
        <span className="ml-2 font-semibold text-sm">Loading Meta Catalog configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SECTION 1: Automated XML Catalog Data Feed */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Meta Catalog Data Feed (Auto-Sync XML)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Zero-token, 100% automated scheduled feed. Meta automatically fetches new products, prices, stock, discounts, and variants on an hourly schedule.
              </p>
            </div>
          </div>

          <a
            href="https://business.facebook.com/commerce_manager/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-all shrink-0 cursor-pointer"
          >
            <span>Open Commerce Manager</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Feed URL Field with One-Click Copy */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Your Live Catalog Feed URL</span>
            <span className="text-[11px] font-normal text-gray-400">Standard RSS 2.0 / Google & Meta compliant</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#0f0f1b]/70 px-3.5 py-2.5 text-xs font-mono font-medium text-gray-900 dark:text-gray-200 select-all focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFeed}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Feed URL</span>
                  </>
                )}
              </button>
              <a
                href={feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold transition-all cursor-pointer"
                title="Preview raw XML feed in a new browser tab"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="rounded-xl p-4 bg-gray-50/80 dark:bg-[#0f0f1b]/80 border border-gray-200/80 dark:border-gray-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
            <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
            <span>4-Step Quick Setup Guide (Only 1 Time Needed):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                1
              </span>
              <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mt-1">Copy Feed URL</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Upar diye gaye button <strong>"Copy Feed URL"</strong> par click karein.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                2
              </span>
              <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mt-1">Open Catalog</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                <strong>Meta Commerce Manager</strong> open karein aur apna Catalog select karein.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                3
              </span>
              <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mt-1">Select Data Feed</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Left menu me <strong>Data Sources</strong> ➔ <strong>Data Feeds</strong> ➔ <strong>Set a Schedule</strong> chunein.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                4
              </span>
              <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mt-1">Hourly Schedule</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Link paste karein aur frequency <strong>Hourly (Har ghante)</strong> rakh kar Save kar dein.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Developer App or Token Renewal required</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Real-time webhook sync + Hourly feed backup</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Meta Catalog Category Mapping */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Meta Catalog Category Taxonomy Mapping</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Map your store categories to Meta's official category taxonomy (Google Product Category path). The XML feed and real-time sync automatically use these mapped paths.
            </p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            No categories available to map. Add categories first.
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {categories.filter(c => c.slug !== 'shop').map(category => {
              const currentVal = mappings[category.id] || '';
              const isCustom = currentVal === 'custom' || (!PRESETS.includes(currentVal) && currentVal !== '');
              const selectValue = isCustom ? 'custom' : currentVal;

              return (
                <div key={category.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{category.name}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">Slug: {category.slug}</span>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={selectValue}
                      onChange={(e) => handleSelectChange(category.id, e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
                    >
                      {PRESETS.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                      <option value="custom">Custom Meta Category Path...</option>
                    </select>

                    {selectValue === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g. Apparel & Accessories > Clothing > Swimwear"
                        value={customInputs[category.id] || ''}
                        onChange={(e) => handleCustomInputChange(category.id, e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 justify-center rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] disabled:bg-[#1a1a2e]/50 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Mappings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
