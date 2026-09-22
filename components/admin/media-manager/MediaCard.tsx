'use client';

import React from 'react';
import { MediaItem } from './hooks/useMediaManagerData';
import { Check, Play, Eye, Copy, Edit, Trash2, CheckCircle2, Loader2, Zap, X } from '@/components/common/Icons';

interface MediaCardProps {
  item: MediaItem;
  isSelected: boolean;
  onToggle: () => void;
  mode: 'library' | 'selector';
  generatingId: string | null;
  bulkGenerating: boolean;
  bulkCompletedIds: string[];
  bulkFailedIds: string[];
  setPreviewItem: (item: MediaItem) => void;
  handleCopyUrl: (url: string) => void;
  setEditingItem: (item: MediaItem | null) => void;
  handleDelete: (id: string, url: string) => void;
  handleSingleGenerate: (item: MediaItem) => void;
  formatBytes: (bytes?: number) => string;
  showCheckbox?: boolean;
  showBadge?: boolean;
  showActions?: boolean;
}

export function MediaCard({
  item,
  isSelected,
  onToggle,
  mode,
  generatingId,
  bulkGenerating,
  bulkCompletedIds,
  bulkFailedIds,
  setPreviewItem,
  handleCopyUrl,
  setEditingItem,
  handleDelete,
  handleSingleGenerate,
  formatBytes,
  showCheckbox = true,
  showBadge = true,
  showActions = true,
}: MediaCardProps) {
  const isGenerating = generatingId === item.id;
  const isVideo = item.mime_type?.startsWith('video/') || item.file_url.match(/\.(mp4|mov|webm)$/i);
  const isBulkDone = bulkCompletedIds.includes(item.id);
  const isBulkFailed = bulkFailedIds.includes(item.id);
  const isBulkPending = bulkGenerating && !isBulkDone && !isBulkFailed && generatingId !== item.id;

  return (
    <div
      onClick={() => {
        if (mode === 'library') {
          setPreviewItem(item);
        } else {
          onToggle();
        }
      }}
      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer flex flex-col justify-end transition-all ${
        isSelected
          ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
          : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {/* Checkbox */}
      {showCheckbox && (
        mode === 'selector' ? (
          isSelected && (
            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center z-10">
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          )
        ) : (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            onClick={e => e.stopPropagation()}
            className="absolute top-3 left-3 h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer z-20 accent-blue-600"
          />
        )
      )}

      {/* Media */}
      {isVideo ? (
        <>
          <video
            src={item.file_url}
            className="absolute inset-0 w-full h-full object-cover z-0"
            muted
            playsInline
            loop
            onMouseOver={e => { try { e.currentTarget.play(); } catch { } }}
            onMouseOut={e => { try { e.currentTarget.pause(); e.currentTarget.currentTime = 0; } catch { } }}
          />
          <div className="absolute bottom-3 left-3 z-10 bg-black/60 px-1.5 py-0.5 rounded text-white text-[8px] font-bold tracking-wider">VIDEO</div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="p-1 rounded-full bg-black/50 text-white"><Play className="h-4 w-4 fill-white" /></div>
          </div>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.file_url} alt={item.alt_text} className="absolute inset-0 w-full h-full object-cover z-0" />
      )}

      {/* AI Badge */}
      {showBadge && mode === 'library' && !bulkGenerating && (
        <div className="absolute top-3 right-3 z-10">
          {item.ai_generated
            ? <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white shadow-sm"><CheckCircle2 className="w-2.5 h-2.5" />AI</span>
            : <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-500/80 text-white shadow-sm">None</span>
          }
        </div>
      )}

      {/* Bulk Progress Overlay */}
      {bulkGenerating && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          {isBulkDone && (
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg ring-2 ring-emerald-300">
              <Check className="h-6 w-6 text-white" />
            </div>
          )}
          {isBulkFailed && (
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg ring-2 ring-red-300">
              <X className="h-6 w-6 text-white" />
            </div>
          )}
          {!isBulkDone && !isBulkFailed && isGenerating && (
            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg ring-2 ring-amber-300">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          {isBulkPending && (
            <div className="absolute inset-0 bg-black/30 rounded-2xl" />
          )}
        </div>
      )}

      {/* Hover Actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-10">
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={e => { e.stopPropagation(); setPreviewItem(item); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]" title="Preview & Edit Image">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={e => { e.stopPropagation(); handleCopyUrl(item.file_url); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]" title="Copy URL">
              <Copy className="w-3.5 h-3.5" />
            </button>
            {mode === 'library' && (
              <>
                <button type="button" onClick={e => { e.stopPropagation(); setEditingItem(item); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]" title="Edit metadata">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={e => { e.stopPropagation(); handleDelete(item.id, item.file_url); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-all cursor-pointer min-h-[32px]" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] text-white font-mono line-clamp-1 w-full bg-black/40 p-1 rounded flex justify-between">
              <span className="truncate mr-1">Alt: {item.alt_text || 'None'}</span>
              <span className="flex-shrink-0 text-gray-300">{formatBytes(item.file_size)}</span>
            </div>
            {mode === 'library' && !isVideo && (
              <button type="button" onClick={e => { e.stopPropagation(); handleSingleGenerate(item); }} disabled={isGenerating}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:bg-gray-600 text-[10px] transition-all cursor-pointer">
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                <span>Write Vision AI</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
