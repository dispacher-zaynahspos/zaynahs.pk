'use client';

import React from 'react';
import {
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Edit2, Trash2, Plus
} from '@/components/common/Icons';
import { NavigationItem } from '@/lib/types';

interface MenuItemRowProps {
  item: NavigationItem;
  index: number;
  totalItems: number;
  depth: number;
  moveMenuItemUp: (id: string) => void;
  moveMenuItemDown: (id: string) => void;
  indentMenuItem: (id: string) => void;
  outdentMenuItem: (id: string) => void;
  openAddMenuModal: (parentId: string | null) => void;
  openEditMenuModal: (item: NavigationItem, depth: number, id: string) => void;
  deleteMenuItem: (id: string) => void;
}

export default function MenuItemRow({
  item,
  index,
  totalItems,
  depth,
  moveMenuItemUp,
  moveMenuItemDown,
  indentMenuItem,
  outdentMenuItem,
  openAddMenuModal,
  openEditMenuModal,
  deleteMenuItem,
}: MenuItemRowProps) {
  return (
    <div
      className="flex items-center justify-between p-4 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-white/1 border-t border-gray-100 dark:border-gray-800/50 transition-colors gap-4 relative"
      style={{ paddingLeft: `${16 + depth * 24}px` }}
    >
      {/* Guide connecting lines for nested items */}
      {depth > 0 && (
        <div
          className="absolute top-[-16px] bottom-1/2 w-[12px] border-l-2 border-b-2 border-gray-200 dark:border-gray-800 rounded-bl-lg"
          style={{ left: `${depth * 24 - 12}px` }}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {depth > 0 && (
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold shrink-0 border border-gray-200/50 dark:border-gray-800">
              Lvl {depth}
            </span>
          )}
          <span className="truncate">{item.label}</span>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate max-w-xs sm:max-w-md mt-0.5">{item.url}</div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Move Up */}
        <button
          type="button"
          disabled={index === 0}
          onClick={() => moveMenuItemUp(item.id)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Move Up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        {/* Move Down */}
        <button
          type="button"
          disabled={index === totalItems - 1}
          onClick={() => moveMenuItemDown(item.id)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Move Down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Indent (Nest) */}
        <button
          type="button"
          disabled={index === 0}
          onClick={() => indentMenuItem(item.id)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Indent (Nest under sibling)"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Outdent (Unnest) */}
        {depth > 0 && (
          <button
            type="button"
            onClick={() => outdentMenuItem(item.id)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
            title="Outdent (Move out a level)"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Add Child under this node */}
        <button
          type="button"
          onClick={() => openAddMenuModal(item.id)}
          className="p-1.5 rounded-lg border border-[#e94560]/20 bg-[#e94560]/10 text-[#e94560] hover:bg-[#e94560] hover:text-white transition-colors cursor-pointer"
          title="Add Nested Link"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {/* Edit */}
        <button
          type="button"
          onClick={() => openEditMenuModal(item, depth, item.id)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-amber-500 hover:border-amber-500 dark:hover:bg-amber-500 text-amber-500 hover:text-white transition-colors cursor-pointer"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => deleteMenuItem(item.id)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-500 text-red-500 hover:text-white transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
