'use client';

import React from 'react';
import { Plus, Download, Upload } from '@/components/common/Icons';
import { Category } from '@/lib/types';
import MediaSelectorModal from './MediaSelectorModal';
import { CategoryCard, CategoryFormModal, useCategoryManagerState } from './category-manager';

interface CategoryManagerProps {
  initialCategories: Category[];
  aiEnabled?: boolean;
  storeUrl?: string;
}

export default function CategoryManager({ initialCategories, aiEnabled, storeUrl }: CategoryManagerProps) {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isOpen,
    setIsOpen,
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
    isMediaModalOpen,
    setIsMediaModalOpen,
    isAiGenerating,
    isSubmitting,
    selectedCategoryIds,
    setSelectedCategoryIds,
    fileInputRef,
    aiConfigured,
    handleAICopywrite,
    handleOpenNew,
    handleOpenEdit,
    handleDelete,
    handleExportJSON,
    handleImportJSON,
    handleSubmit,
    filteredAndSortedCategories,
    flattenedCategories,
  } = useCategoryManagerState({ initialCategories, aiEnabled, storeUrl });

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1 lg:max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              placeholder="Search categories by name, slug or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#1a1a2e] text-gray-900 dark:text-white dark:bg-[#16162a] dark:border-gray-800"
            />
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#1a1a2e] cursor-pointer dark:text-gray-200 dark:bg-[#16162a] dark:border-gray-800"
            >
              <option value="sort-order">Sort Order (Default)</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
              <option value="alphabetical-asc">A to Z</option>
              <option value="alphabetical-desc">Z to A</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-[#1a1a30] border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer min-h-[44px]"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-[#1a1a30] border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer min-h-[44px]"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleOpenNew}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="flex items-center gap-3">
          {filteredAndSortedCategories.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const exportableCategories = filteredAndSortedCategories.filter(c => c.id !== '00000000-0000-4000-8000-000000000099');
                if (selectedCategoryIds.size === exportableCategories.length) {
                  setSelectedCategoryIds(new Set());
                } else {
                  setSelectedCategoryIds(new Set(exportableCategories.map(c => c.id)));
                }
              }}
              className="text-[10px] text-gray-550 dark:text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
            >
              {selectedCategoryIds.size > 0 && selectedCategoryIds.size === filteredAndSortedCategories.filter(c => c.id !== '00000000-0000-4000-8000-000000000099').length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedCategoryIds.size > 0 && (
            <span className="text-[10px] text-gray-450 dark:text-gray-400 font-semibold">{selectedCategoryIds.size} selected</span>
          )}
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flattenedCategories.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            selectedCategoryIds={selectedCategoryIds}
            setSelectedCategoryIds={setSelectedCategoryIds}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isOpen}
        editId={editId}
        name={name}
        setName={setName}
        slug={slug}
        setSlug={setSlug}
        description={description}
        setDescription={setDescription}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        active={active}
        setActive={setActive}
        aiConfigured={aiConfigured}
        isAiGenerating={isAiGenerating}
        isSubmitting={isSubmitting}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        onAICopywrite={handleAICopywrite}
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
      />

      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(urls) => {
          if (urls.length > 0) {
            setImageUrl(urls[0]);
          }
        }}
        multiple={false}
      />
    </div>
  );
}
