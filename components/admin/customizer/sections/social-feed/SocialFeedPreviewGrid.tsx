'use client';

import React from 'react';
import { Trash2, Play } from '@/components/common/Icons';

interface SocialFeedPreviewGridProps {
  items: any[];
  editingItemId: string | null;
  onEditItemSelect: (item: any) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
}

export function SocialFeedPreviewGrid({
  items,
  editingItemId,
  onEditItemSelect,
  onDeleteItem,
}: SocialFeedPreviewGridProps) {
  return (
    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Feed Preview ({items.length} items)</label>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, idx) => {
          const itemId = item.id || item.imageUrl;
          const isEditing = editingItemId === itemId;
          return (
            <div 
              key={itemId || idx} 
              onClick={() => onEditItemSelect(item)}
              className={`relative group aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                isEditing 
                  ? 'border-[#e94560] ring-2 ring-[#e94560]/20 scale-[0.98]' 
                  : 'border-gray-250 dark:border-gray-800 hover:scale-[1.02]'
              }`}
            >
              {item.videoUrl && (
                <div className="absolute top-1.5 left-1.5 bg-[#e94560] text-white p-1 rounded-full shadow z-10">
                  <Play className="w-2.5 h-2.5 fill-current translate-x-[0.5px]" />
                </div>
              )}
              {isEditing && (
                <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                  EDITING
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt="Social post" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/75 flex flex-col justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={(e) => onDeleteItem(itemId, e)}
                  className="self-end text-red-500 hover:text-red-400 p-1 bg-white/10 rounded-md cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold text-white truncate">@{item.username}</p>
                  {item.caption && <p className="text-[7px] text-gray-300 truncate">{item.caption}</p>}
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full text-center py-4 text-[10px] text-gray-400">
            No feed posts added yet.
          </div>
        )}
      </div>
    </div>
  );
}
