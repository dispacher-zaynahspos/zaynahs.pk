'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Eye, EyeOff, ChevronUp, ChevronDown, Trash2, Edit2, Check, MoreVertical, Copy, Lock,
} from '@/components/common/Icons';

/**
 * SectionStackRow — the ONE shared row for customizer stacks (home sections,
 * product-detail blocks, etc.). Fixes icon overflow by keeping only the eye
 * toggle + a kebab "more" menu inline; rename / move / delete live in the menu.
 * Layout: [drag] [title flex-1 min-w-0 truncate] [actions shrink-0].
 */
export interface SectionStackRowProps {
  title: string;
  subtitle: string;
  isActive: boolean;
  isDisabled?: boolean;
  isVisible: boolean;
  isFirst: boolean;
  isLast: boolean;
  renaming: boolean;
  renameValue: string;
  onSelect: () => void;
  onToggleVisible: () => void;
  onStartRename: () => void;
  onRenameChange: (v: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  /** Optional: Duplicate action in the kebab menu (omit to hide). */
  onDuplicate?: () => void;
  /** Core/locked rows: hide rename + delete (keep move + hide). Default false. */
  lockActions?: boolean;
  /** Hide the kebab menu entirely (e.g. core blocks with no menu actions). */
  hideMenu?: boolean;
}

export default function SectionStackRow({
  title, subtitle, isActive, isDisabled, isVisible, isFirst, isLast,
  renaming, renameValue, onSelect, onToggleVisible, onStartRename,
  onRenameChange, onCommitRename, onCancelRename, onMoveUp, onMoveDown, onDelete,
  onDuplicate, lockActions = false, hideMenu = false,
}: SectionStackRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const menuItem = (label: string, icon: React.ReactNode, onClick: () => void, opts?: { danger?: boolean; disabled?: boolean }) => (
    <button
      type="button"
      disabled={opts?.disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); setMenuOpen(false); }}
      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        opts?.danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 h-12 px-2.5 border rounded-xl transition-all cursor-pointer ${
        isActive
          ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {/* Title block */}
      <div className="min-w-0 flex-1">
        {renaming ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename();
              if (e.key === 'Escape') onCancelRename();
            }}
            className="w-full px-2 py-1 rounded-lg border border-blue-400 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-xs focus:outline-none"
          />
        ) : (
          <div onDoubleClick={(e) => { e.stopPropagation(); onStartRename(); }}>
            <div className={`text-xs font-bold truncate ${
              isDisabled
                ? 'text-gray-450 dark:text-gray-500 line-through'
                : !isVisible
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
            }`}>
              <span className="inline-flex items-center gap-1">
                {isDisabled && <Lock className="h-3 w-3 shrink-0" />}
                <span className="truncate">{title}</span>
              </span>
            </div>
            <span className="block truncate text-[9px] text-gray-455 dark:text-gray-500 font-bold uppercase tracking-wider">
              {subtitle}{isDisabled && ' (Disabled)'}{!isVisible && !isDisabled && ' (Hidden)'}
            </span>
          </div>
        )}
      </div>

      {/* Actions: always-visible eye + kebab (rename/move/delete) */}
      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        {renaming ? (
          <button
            onClick={onCommitRename}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-green-600 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
            title="Save name"
          >
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={onToggleVisible}
              className={`flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer ${
                isVisible ? 'text-[#e94560]' : 'text-gray-400'
              }`}
              title={isVisible ? 'Hide section' : 'Show section'}
            >
              {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            {!hideMenu && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer ${
                    menuOpen ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10' : 'text-gray-400'
                  }`}
                  title="More actions"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 z-50 w-40 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] shadow-xl overflow-hidden"
                  >
                    {!lockActions && menuItem('Rename', <Edit2 className="h-3.5 w-3.5" />, onStartRename)}
                    {onDuplicate && menuItem('Duplicate', <Copy className="h-3.5 w-3.5" />, onDuplicate)}
                    {!lockActions && (
                      <>
                        <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                        {menuItem('Delete', <Trash2 className="h-3.5 w-3.5" />, onDelete, { danger: true })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
