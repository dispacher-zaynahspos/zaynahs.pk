'use client';

import React, { useState, useMemo } from 'react';
import { HomepageSection, Review } from '@/lib/types';
import { ChevronUp, ChevronDown, GripVertical, Trash2, Search, X } from '@/components/common/Icons';

interface RecentReviewsSettingsProps {
  section: HomepageSection;
  reviews?: (Review & { productName?: string; productSlug?: string })[];
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function RecentReviewsSettings({
  section,
  reviews = [],
  onUpdateSection
}: RecentReviewsSettingsProps) {
  const settings = section.settings || {};

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  const sortMethod = settings.sortMethod || 'newest';
  const manualReviewIds: string[] = settings.manualReviewIds || [];

  const [pickerSearch, setPickerSearch] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Filter reviews for manual picker search
  const filteredPickerReviews = useMemo(() => {
    let list = reviews;
    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      list = list.filter(r =>
        r.customerName.toLowerCase().includes(q) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        (r.productName && r.productName.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 50);
  }, [pickerSearch, reviews]);

  // Resolve manual review objects from IDs
  const manualReviews = useMemo(() => {
    return manualReviewIds
      .map(id => reviews.find(r => r.id === id))
      .filter((r): r is (Review & { productName?: string; productSlug?: string }) => !!r);
  }, [manualReviewIds, reviews]);

  const addReview = (reviewId: string) => {
    handleSettingsChange('manualReviewIds', [...manualReviewIds, reviewId]);
    setPickerSearch('');
  };

  const removeReview = (reviewId: string) => {
    handleSettingsChange('manualReviewIds', manualReviewIds.filter(id => id !== reviewId));
  };

  const moveReview = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= manualReviewIds.length) return;
    const copy = [...manualReviewIds];
    const [removed] = copy.splice(index, 1);
    copy.splice(newIndex, 0, removed);
    handleSettingsChange('manualReviewIds', copy);
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', manualReviewIds[idx]);
    setDraggingId(manualReviewIds[idx]);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (!draggingId) return;
    const tgtId = manualReviewIds[idx];
    if (draggingId === tgtId) return;
    const srcIdx = manualReviewIds.indexOf(draggingId);
    const tgtIdx = manualReviewIds.indexOf(tgtId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const copy = [...manualReviewIds];
    const [dragged] = copy.splice(srcIdx, 1);
    copy.splice(tgtIdx, 0, dragged);
    handleSettingsChange('manualReviewIds', copy);
  };

  const handleDrop = () => setDraggingId(null);
  const handleDragEnd = () => setDraggingId(null);

  // Star display helper
  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="space-y-4">
      {/* Sort Method */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Sort Method
        </label>
        <select
          value={sortMethod}
          onChange={e => {
            handleSettingsChange('sortMethod', e.target.value);
            if (e.target.value === 'manual' && !settings.manualReviewIds) {
              handleSettingsChange('manualReviewIds', []);
            }
          }}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_stars">Most Stars (5→1)</option>
          <option value="least_stars">Least Stars (1→5)</option>
          <option value="manual">Manual Pick & Sort</option>
        </select>
      </div>

      {/* Manual Picker — only when sortMethod is manual */}
      {sortMethod === 'manual' && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, comment, product..."
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              style={{ borderWidth: 1 }}
            />
            {pickerSearch && (
              <button onClick={() => setPickerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Review list to pick from */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#0f0f1b] divide-y divide-gray-100 dark:divide-gray-800 max-h-40 overflow-y-auto overscroll-contain">
            {filteredPickerReviews.map(r => {
              const isChecked = manualReviewIds.includes(r.id);
              return (
                <label
                  key={r.id}
                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${isChecked ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addReview(r.id);
                      } else {
                        removeReview(r.id);
                      }
                    }}
                    className="shrink-0 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {r.customerName}
                      <span className="text-[10px] text-amber-500 ml-1">{renderStars(r.rating)}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {r.productName || 'General Review'} — {r.comment ? `"${r.comment.slice(0, 40)}..."` : 'No comment'}
                    </div>
                  </div>
                </label>
              );
            })}
            {filteredPickerReviews.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-4">No reviews found</div>
            )}
          </div>

          {/* Selected manual reviews with drag-and-drop sorting */}
          {manualReviews.length > 0 && (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {manualReviews.map((r, idx) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-2 p-2 bg-white dark:bg-[#0f0f1b] rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 ${draggingId === r.id ? 'opacity-50 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                >
                  <div className="text-xs font-semibold text-slate-400 w-5 text-center shrink-0">#{idx + 1}</div>
                  <GripVertical className="h-3.5 w-3.5 text-gray-400 cursor-grab shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                      {r.customerName}
                      <span className="text-[10px] text-amber-500 ml-1">{renderStars(r.rating)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveReview(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveReview(idx, 'down')} disabled={idx === manualReviews.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeReview(r.id)} className="p-0.5 text-red-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Reviews Limit */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Reviews Limit
          </label>
          <span className="text-xs font-bold text-[#e94560]">
            {settings.limit || 3}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          step="1"
          value={settings.limit || 3}
          onChange={e => handleSettingsChange('limit', parseInt(e.target.value))}
          className="w-full accent-[#e94560]"
        />
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Show Images Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Show Review Images
        </label>
        <button
          type="button"
          onClick={() => handleSettingsChange('showImages', !(settings.showImages !== false))}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            settings.showImages !== false ? 'bg-[#e94560]' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
            settings.showImages !== false ? 'translate-x-4.5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Show View All Button Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Show &quot;View All&quot; Button
        </label>
        <button
          type="button"
          onClick={() => handleSettingsChange('showViewAll', !(settings.showViewAll !== false))}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            settings.showViewAll !== false ? 'bg-[#e94560]' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
            settings.showViewAll !== false ? 'translate-x-4.5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>
    </div>
  );
}
