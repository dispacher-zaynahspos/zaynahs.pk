'use client';

import React from 'react';
import { CheckCircle, AlertCircle, RotateCcw, X, Loader2 } from '@/components/common/Icons';
import type { UploadTask } from './hooks/useMediaManagerData';

const fmt = (b?: number) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

const stageLabel = (t: UploadTask): string => {
  switch (t.stage) {
    case 'queued': return 'Waiting in queue';
    case 'optimizing': return 'Optimizing to WebP…';
    case 'uploading': return `Uploading ${t.progress}%`;
    case 'saving': return 'Saving…';
    case 'tagging': return 'Tagging…';
    case 'completed': return 'Done';
    case 'failed': return t.error || 'Failed';
    case 'cancelled': return 'Cancelled';
    default: return 'Uploading…';
  }
};

interface Props {
  task: UploadTask;
  onRetry: (t: UploadTask) => void;
  onRemove: (t: UploadTask) => void;
}

export default function UploadTileCard({ task, onRetry, onRemove }: Props) {
  const isFailed = task.status === 'failed' || task.stage === 'cancelled';
  const isDone = task.stage === 'completed';
  const indeterminate = task.stage === 'optimizing' || task.stage === 'saving' || task.stage === 'tagging' || task.stage === 'queued';

  return (
    <div
      className={`relative aspect-square rounded-2xl overflow-hidden border transition-all ${
        isFailed
          ? 'border-red-400 dark:border-red-500/60'
          : isDone
            ? 'border-emerald-400 dark:border-emerald-500/60 ring-2 ring-emerald-400/40'
            : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      {task.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={task.previewUrl} alt={task.file.name} className={`w-full h-full object-cover ${isDone ? '' : 'opacity-40'}`} />
      ) : (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        {/* Top status icon */}
        <div className="absolute top-1.5 right-1.5">
          {isDone && <CheckCircle className="h-5 w-5 text-emerald-400 drop-shadow" />}
          {isFailed && <AlertCircle className="h-5 w-5 text-red-400 drop-shadow" />}
          {!isDone && !isFailed && <Loader2 className="h-4 w-4 text-white animate-spin motion-reduce:animate-none drop-shadow" />}
        </div>

        <p className="text-[10px] font-bold text-white truncate drop-shadow">{task.file.name}</p>
        <p className="text-[9px] font-semibold text-white/85 drop-shadow">{stageLabel(task)}</p>
        {isDone && task.sizeBefore && task.sizeAfter && (
          <p className="text-[8px] font-semibold text-emerald-300 drop-shadow">{fmt(task.sizeBefore)} → {fmt(task.sizeAfter)}</p>
        )}
        {task.slow && !isDone && !isFailed && (
          <p className="text-[8px] font-semibold text-amber-300 drop-shadow">Slow connection. Keep this page open.</p>
        )}

        {/* Progress bar */}
        {!isDone && !isFailed && (
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
            {indeterminate ? (
              <div className="h-full w-1/3 rounded-full bg-white/80 animate-[indeterminate_1.2s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:w-full" />
            ) : (
              <div className="h-full rounded-full bg-white transition-all duration-200" style={{ width: `${task.progress}%` }} />
            )}
          </div>
        )}

        {/* Error actions */}
        {isFailed && (
          <div className="mt-1 flex gap-1">
            <button type="button" onClick={() => onRetry(task)} className="flex-1 flex items-center justify-center gap-1 min-h-[32px] rounded-lg bg-white/90 text-gray-900 text-[10px] font-bold hover:bg-white cursor-pointer">
              <RotateCcw className="h-3 w-3" /> Retry
            </button>
            <button type="button" onClick={() => onRemove(task)} className="flex items-center justify-center min-h-[32px] px-2 rounded-lg bg-white/20 text-white text-[10px] font-bold hover:bg-white/30 cursor-pointer">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
