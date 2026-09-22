import React from 'react';
import { Search, Zap, Loader2 } from '@/components/common/Icons';
import { SizeGuide } from '@/lib/types';
import { ProductDescriptionEditor } from './ProductDescriptionEditor';

interface ProductFormBasicInfoProps {
  name: string;
  setName: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  sku: string;
  setSku: (val: string) => void;
  categorySearchQuery: string;
  setCategorySearchQuery: (val: string) => void;
  flattenedCategories: any[];
  selectedCategoryIds: string[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
  visibleCategoryCount: number;
  setVisibleCategoryCount: React.Dispatch<React.SetStateAction<number>>;
  sizeGuideId: string;
  setSizeGuideId: (val: string) => void;
  sizeGuidesList: SizeGuide[];
  tagInput: string;
  setTagInput: (val: string) => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  isHtmlMode: boolean;
  setIsHtmlMode: (val: boolean) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  execCommand: (cmd: string, val?: string) => void;
  aiConfigured: boolean;
  isAiGenerating: boolean;
  onAICopywrite: () => void;
  onShowAiNotice: () => void;
}

export const ProductFormBasicInfo: React.FC<ProductFormBasicInfoProps> = ({
  name,
  setName,
  slug,
  setSlug,
  sku,
  setSku,
  categorySearchQuery,
  setCategorySearchQuery,
  flattenedCategories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  visibleCategoryCount,
  setVisibleCategoryCount,
  sizeGuideId,
  setSizeGuideId,
  sizeGuidesList,
  tagInput,
  setTagInput,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  isHtmlMode,
  setIsHtmlMode,
  editorRef,
  execCommand,
  aiConfigured,
  isAiGenerating,
  onAICopywrite,
  onShowAiNotice,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Product Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Slug (URL friendly) *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
          {slug && (
            <p className="mt-1 text-[10px] text-gray-550 dark:text-gray-400 font-bold">
              Preview Path:{' '}
              <a
                href={`/product/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e94560] font-mono underline hover:text-[#e94560]/80 transition-colors cursor-pointer"
              >
                /product/{slug}
              </a>
            </p>
          )}
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">SKU / Code</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Categories</label>
          <div className="relative mb-1.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white transition-all dark:border-gray-800 dark:bg-[#111124] text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-[#111124] max-h-48 overflow-y-auto">
            {(() => {
              const filteredCats = flattenedCategories.filter(cat => cat.slug !== 'shop' && cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()));
              if (filteredCats.length === 0) {
                return <span className="text-xs text-gray-500">No categories found.</span>;
              }
              const visibleCats = filteredCats.slice(0, visibleCategoryCount);
              const hasMore = filteredCats.length > visibleCategoryCount;
              return (
                <>
                  {visibleCats.map(cat => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <div key={cat.id} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategoryIds(prev => [...prev, cat.id]);
                              } else {
                                setSelectedCategoryIds(prev => prev.filter(id => id !== cat.id));
                              }
                            }}
                            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer flex-shrink-0"
                          />
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 flex-wrap">
                            {cat._level > 0 && (
                              <span className="text-gray-400">{'—'.repeat(cat._level)} </span>
                            )}
                            {cat.name}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setVisibleCategoryCount(prev => prev + 20)}
                      className="w-full py-1.5 mt-1 text-center text-xs font-bold text-[#e94560] hover:text-[#d63d55] bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Load More Categories (+{filteredCats.length - visibleCategoryCount} remaining)
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Size Guide Preset</label>
          <select
            value={sizeGuideId}
            onChange={(e) => setSizeGuideId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124] text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="">No Size Guide</option>
            {sizeGuidesList.map(sg => (
              <option key={sg.id} value={sg.id}>{sg.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="new, sale, cotton"
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all dark:border-gray-800 dark:bg-[#111124]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Short Description</label>
          {name.trim() !== '' && (
            <button
              type="button"
              onClick={aiConfigured ? onAICopywrite : onShowAiNotice}
              disabled={isAiGenerating}
              className={`relative overflow-hidden flex items-center gap-1 px-2 py-0.5 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-xs select-none active:scale-[0.98] ${aiConfigured
                  ? isAiGenerating
                    ? 'bg-purple-700 bg-linear-to-r from-purple-700 to-indigo-700 disabled:cursor-not-allowed'
                    : 'bg-purple-600 bg-linear-to-r from-purple-600 to-indigo-600 hover:bg-purple-700'
                  : 'bg-gray-400 hover:bg-gray-500'
                }`}
              title={aiConfigured ? 'Generate AI copy' : 'Enable AI in Settings → AI Copywriter'}
            >
              {isAiGenerating && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] pointer-events-none z-10 bg-inherit">
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <div className="flex items-center gap-1 relative z-10">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </div>
                </div>
              )}
              <div className={`flex items-center gap-1 transition-opacity ${isAiGenerating ? 'opacity-0' : 'opacity-100'}`}>
                <Zap className="w-3 h-3 fill-current" />
                <span>AI Copy</span>
              </div>
            </button>
          )}
        </div>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={2}
          placeholder="A brief overview of the product (shown above variations)"
          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white focus:outline-none transition-all resize-none dark:border-gray-800 dark:bg-[#111124]"
        />
      </div>

      <ProductDescriptionEditor
        description={description}
        setDescription={setDescription}
        isHtmlMode={isHtmlMode}
        setIsHtmlMode={setIsHtmlMode}
        editorRef={editorRef}
        execCommand={execCommand}
      />
    </div>
  );
};
