'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, CheckCircle, AlertCircle, Loader2, RotateCcw } from '@/components/common/Icons';
import type { UploadTask } from './hooks/useMediaManagerData';

const stageText = (t: UploadTask): string => {
  switch (t.stage) {
    case 'queued': return 'Queued';
    case 'optimizing': return 'Optimizing…';
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
  tasks: UploadTask[];
  onRetry: (t: UploadTask) => void;
  onCancel: (t: UploadTask) => void;
  onClear: () => void;
}

export default function UploadProgressPanel({ tasks, onRetry, onCancel, onClear }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  if (tasks.length === 0) return null;

  const active = tasks.filter(t => t.status === 'uploading');
  const done = tasks.filter(t => t.stage === 'completed');
  const total = tasks.length;
  const overall = Math.round(
    tasks.reduce((s, t) => s + (t.stage === 'completed' ? 100 : t.status === 'uploading' ? t.progress : 0), 0) / total
  );
  const allDone = active.length === 0;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto z-[200] w-auto sm:w-80 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <p className="text-xs font-black text-gray-900 dark:text-white truncate">
            {allDone ? `${done.length} of ${total} uploaded` : `Uploading ${done.length} of ${total} files`}
          </p>
          <div className="mt-1 h-1.5 w-40 sm:w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-[#e94560] transition-all duration-300" style={{ width: `${overall}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button type="button" onClick={() => setCollapsed(c => !c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer" aria-label={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {allDone && (
            <button type="button" onClick={onClear} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {!collapsed && (
        <div className="max-h-64 overflow-y-auto overscroll-contain divide-y divide-gray-50 dark:divide-gray-800/60">
          {tasks.map(t => {
            const isDone = t.stage === 'completed';
            const isFailed = t.status === 'failed' || t.stage === 'cancelled';
            return (
              <div key={t.id} className="flex items-center gap-2 px-3 py-2">
                <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {t.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.previewUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{t.file.name}</p>
                  <p className={`text-[10px] font-semibold truncate ${isFailed ? 'text-red-500' : isDone ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {stageText(t)}{t.slow && !isDone && !isFailed ? ' · slow' : ''}
                  </p>
                </div>
                <div className="shrink-0">
                  {isDone && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  {isFailed && (
                    <button type="button" onClick={() => onRetry(t)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-[#e94560] cursor-pointer" aria-label="Retry">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {!isDone && !isFailed && (
                    <button type="button" onClick={() => onCancel(t)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 cursor-pointer" aria-label="Cancel">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
