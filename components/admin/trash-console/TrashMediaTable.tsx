'use client';

import React from 'react';
import { Images, RefreshCw, Trash2 } from '@/components/common/Icons';
import { TrashedMedia } from '@/lib/services/media';
import EmptyState from '@/components/common/EmptyState';

interface TrashMediaTableProps {
  media: TrashedMedia[];
  searchTerm: string;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  handleRestore: (id: string, type: 'media') => void;
  setConfirmDelete: (val: any) => void;
  isPending: boolean;
}

export const TrashMediaTable: React.FC<TrashMediaTableProps> = ({
  media,
  searchTerm,
  selectedIds,
  toggleSelect,
  handleRestore,
  setConfirmDelete,
  isPending,
}) => {
  if (media.length === 0) {
    return (
      <EmptyState
        title="No trashed media"
        description={searchTerm ? "No media items matching your search term." : "Your trash bin is clean of media files."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid view for media */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map(item => {
          const isSelected = selectedIds.includes(item.id);
          const name = item.title || item.original_filename || 'Untitled Media';
          return (
            <div
              key={item.id}
              className={`group relative rounded-2xl border bg-white dark:bg-[#16162a] overflow-hidden shadow-sm flex flex-col transition-all ${
                isSelected ? 'border-[#e94560] ring-2 ring-[#e94560]/20' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(item.id)}
                  className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
              </div>
              <div className="aspect-square relative bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                {item.file_url ? (
                  <img src={item.file_url} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <Images className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">{name}</span>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleRestore(item.id, 'media')}
                    disabled={isPending}
                    className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 hover:bg-gray-200 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" /> Restore
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ id: item.id, type: 'media', name, extraInfo: { fileUrl: item.file_url } })}
                    disabled={isPending}
                    className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center gap-1 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
