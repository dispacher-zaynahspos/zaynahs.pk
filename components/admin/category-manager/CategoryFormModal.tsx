'use client';

import React from 'react';
import { Plus, X, Image as ImageIcon, Zap, Loader2 } from '@/components/common/Icons';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface CategoryFormModalProps {
  isOpen: boolean;
  editId: string | null;
  name: string;
  setName: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  sortOrder: string;
  setSortOrder: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;
  aiConfigured: boolean;
  isAiGenerating: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onAICopywrite: () => void;
  onOpenMediaModal: () => void;
}

export default function CategoryFormModal({
  isOpen,
  editId,
  name,
  setName,
  slug,
  setSlug,
  description,
  setDescription,
  imageUrl,
  setImageUrl,
  sortOrder,
  setSortOrder,
  active,
  setActive,
  aiConfigured,
  isAiGenerating,
  isSubmitting,
  onClose,
  onSubmit,
  onAICopywrite,
  onOpenMediaModal,
}: CategoryFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#16162a] w-full max-w-3xl max-h-[90vh] rounded-2xl border border-gray-250 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col animate-scale-in text-gray-900 dark:text-white overscroll-contain">
        
        {/* Sticky Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-800 shrink-0 bg-white dark:bg-[#16162a] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
              {editId ? 'Edit Category' : 'Create New Category'}
            </h3>
            {name.trim() !== '' && (
              <button
                type="button"
                onClick={onAICopywrite}
                disabled={isAiGenerating}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${
                  aiConfigured
                    ? 'bg-purple-600 bg-linear-to-r from-purple-600 to-indigo-600 hover:bg-purple-700 hover:from-purple-700 hover:to-indigo-700'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
                title={aiConfigured ? 'Generate AI copy' : 'Enable AI in Settings → AI Copywriter'}
              >
                {isAiGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
                <span>AI Generate Copy</span>
              </button>
            )}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-650 dark:hover:text-white cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm font-medium focus:border-[#e94560] focus:bg-white focus:outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-255 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm font-medium focus:border-[#e94560] focus:bg-white focus:outline-none transition-all dark:text-white"
                />
                {slug && (
                  <p className="mt-1 text-[10px] text-gray-550 dark:text-gray-400 font-bold">
                    Preview Path:{' '}
                    <a
                      href={`/shop?category=${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e94560] font-mono underline hover:text-[#e94560]/80 transition-colors cursor-pointer"
                    >
                      /shop?category={slug}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category Image</label>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-gray-250 dark:border-gray-850 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
                  {imageUrl ? (
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="relative h-14 w-14 border border-gray-200 dark:border-gray-850 rounded-lg overflow-hidden bg-white dark:bg-[#0f0f1b] flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Category Image Preview" className="h-full w-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 shrink-0">
                      <Plus className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={onOpenMediaModal}
                      className="relative self-start flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Select Media
                    </button>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Select or upload WebP &lt; 50 KB</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2.5 text-sm font-medium focus:border-[#e94560] focus:bg-white focus:outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="cat-active" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Active (Show to customers)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                {name.trim() !== '' && (
                  <button
                    type="button"
                    onClick={onAICopywrite}
                    disabled={isAiGenerating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${
                      aiConfigured
                        ? 'bg-purple-600 bg-linear-to-r from-purple-600 to-indigo-600 hover:bg-purple-700 hover:from-purple-700 hover:to-indigo-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                    title={aiConfigured ? 'Generate AI copy' : 'Enable AI in Settings → AI Copywriter'}
                  >
                    {isAiGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>AI Generate Copy</span>
                  </button>
                )}
              </div>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe your category..."
                minHeight="180px"
              />
            </div>
          </div>

          {/* Action Buttons (Sticky Footer) */}
          <div className="p-6 pt-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-[#11111e] shrink-0">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-center border border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-350 bg-white dark:bg-transparent rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`relative overflow-hidden flex-1 flex items-center justify-center text-center rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer transition-all active:scale-[0.98] ${
                  isSubmitting
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-[#1a1a2e] dark:bg-[#e94560] hover:opacity-90 text-white'
                }`}
              >
                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] pointer-events-none z-10 bg-inherit">
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span className="text-white">Saving...</span>
                    </div>
                  </div>
                )}
                <span className={isSubmitting ? 'opacity-0' : ''}>
                  {editId ? 'Save Changes' : 'Create Category'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
