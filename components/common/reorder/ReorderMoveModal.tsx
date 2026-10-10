'use client';

/**
 * ReorderMoveModal — shared "Move" bottom-sheet / modal for the reorder system.
 *
 * Opened by long-press (500ms) OR by the row three-dots menu. Rendered through a
 * portal to document.body so it is never clipped by a transformed/overflow-hidden
 * admin sidebar or table container, and sits above the admin chrome (z-[120]).
 *
 * Actions: Move to Top, Move Up, Move Down, Move to Bottom, Move to position #.
 * Pagination-aware: position input is a GLOBAL 1-based index.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Portal } from '@/components/common/Portal';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import {
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  X,
} from '@/components/common/Icons';

export interface ReorderMoveModalProps {
  open: boolean;
  title?: string;
  currentPosition: number;
  totalCount: number;
  isFirst: boolean;
  isLast: boolean;
  onClose: () => void;
  onMoveTop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveBottom: () => void;
  onMoveToPosition: (position1Based: number) => void;
}

export function ReorderMoveModal({
  open,
  title = 'Move item',
  currentPosition,
  totalCount,
  isFirst,
  isLast,
  onClose,
  onMoveTop,
  onMoveUp,
  onMoveDown,
  onMoveBottom,
  onMoveToPosition,
}: ReorderMoveModalProps) {
  const [posInput, setPosInput] = useState(String(currentPosition));
  const inputRef = useRef<HTMLInputElement>(null);
  useBodyScrollLock(open);

  useEffect(() => {
    if (open) setPosInput(String(currentPosition));
  }, [open, currentPosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const commitPosition = () => {
    const n = parseInt(posInput, 10);
    if (!isNaN(n) && n >= 1 && n <= totalCount) {
      onMoveToPosition(n);
      onClose();
    }
  };

  const row =
    'w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1d1d36] rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer';

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          className="w-full sm:max-w-sm bg-white dark:bg-[#16162a] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-2 sm:p-3 animate-in slide-in-from-bottom duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {title} · #{currentPosition} of {totalCount}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1d1d36] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            <button type="button" className={row} disabled={isFirst} onClick={() => { onMoveTop(); onClose(); }}>
              <ChevronsUp className="h-4 w-4 shrink-0" /> Move to Top
            </button>
            <button type="button" className={row} disabled={isFirst} onClick={() => { onMoveUp(); onClose(); }}>
              <ChevronUp className="h-4 w-4 shrink-0" /> Move Up
            </button>
            <button type="button" className={row} disabled={isLast} onClick={() => { onMoveDown(); onClose(); }}>
              <ChevronDown className="h-4 w-4 shrink-0" /> Move Down
            </button>
            <button type="button" className={row} disabled={isLast} onClick={() => { onMoveBottom(); onClose(); }}>
              <ChevronsDown className="h-4 w-4 shrink-0" /> Move to Bottom
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Move to position</span>
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={totalCount}
              value={posInput}
              onChange={(e) => setPosInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitPosition(); }}
              className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={commitPosition}
              className="ml-auto bg-[var(--color-primary,#e94560)] text-white text-sm px-4 py-1.5 rounded-lg font-bold active:scale-95 cursor-pointer"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export default ReorderMoveModal;
