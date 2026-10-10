'use client';

/**
 * useReorder — SINGLE SOURCE OF TRUTH for list reordering behavior (RULE SSOT1).
 *
 * Powers the shared <SortableList /> everywhere items are reordered:
 *  - admin category products table (/admin/categories/[id])
 *  - customizer manual product list + section stack
 *  - any future reorderable list (collections, variants, banners, FAQ)
 *
 * Features: adjacent up/down, move-to-top/bottom, move-to-position (pagination
 * aware via global index), multi-select move, optimistic update + rollback,
 * keyboard move, long-press "Move" modal state.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { arrayMove } from '@/lib/utils/arrayMove';

export interface ReorderableItem {
  id: string;
}

export interface UseReorderOptions<T extends ReorderableItem> {
  items: T[];
  onReorder: (next: T[]) => void | Promise<void>;
  enabled?: boolean;
  getId?: (item: T) => string;
}

export interface UseReorderResult<T extends ReorderableItem> {
  items: T[];
  enabled: boolean;
  isSaving: boolean;
  indexOf: (id: string) => number;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  moveToTop: (id: string) => void;
  moveToBottom: (id: string) => void;
  moveToPosition: (id: string, position1Based: number) => void;
  moveByDrag: (fromId: string, toId: string) => void;
  moveSelectedToPosition: (ids: string[], position1Based: number) => void;
  reset: (next: T[]) => void;
}

export function useReorder<T extends ReorderableItem>({
  items,
  onReorder,
  enabled = true,
  getId = (item) => item.id,
}: UseReorderOptions<T>): UseReorderResult<T> {
  const [isSaving, setIsSaving] = useState(false);
  const prevRef = useRef<T[]>(items);
  prevRef.current = items;

  const idList = useMemo(() => items.map((i) => getId(i)), [items, getId]);
  const indexOf = useCallback((id: string) => idList.indexOf(id), [idList]);

  const commit = useCallback(
    async (next: T[]) => {
      const prev = prevRef.current;
      try {
        const result = onReorder(next);
        if (result instanceof Promise) {
          setIsSaving(true);
          await result;
        }
      } catch {
        onReorder(prev);
      } finally {
        setIsSaving(false);
      }
    },
    [onReorder]
  );

  const apply = useCallback(
    (fn: (arr: T[]) => T[]) => {
      if (!enabled) return;
      const next = fn([...items]);
      if (next === items) return;
      void commit(next);
    },
    [enabled, items, commit]
  );

  const moveUp = useCallback(
    (id: string) => apply((arr) => {
      const i = arr.findIndex((x) => getId(x) === id);
      return i > 0 ? arrayMove(arr, i, i - 1) : arr;
    }),
    [apply, getId]
  );

  const moveDown = useCallback(
    (id: string) => apply((arr) => {
      const i = arr.findIndex((x) => getId(x) === id);
      return i >= 0 && i < arr.length - 1 ? arrayMove(arr, i, i + 1) : arr;
    }),
    [apply, getId]
  );

  const moveToTop = useCallback(
    (id: string) => apply((arr) => {
      const i = arr.findIndex((x) => getId(x) === id);
      return i > 0 ? arrayMove(arr, i, 0) : arr;
    }),
    [apply, getId]
  );

  const moveToBottom = useCallback(
    (id: string) => apply((arr) => {
      const i = arr.findIndex((x) => getId(x) === id);
      return i >= 0 && i < arr.length - 1 ? arrayMove(arr, i, arr.length - 1) : arr;
    }),
    [apply, getId]
  );

  const moveToPosition = useCallback(
    (id: string, position1Based: number) => apply((arr) => {
      const i = arr.findIndex((x) => getId(x) === id);
      if (i === -1) return arr;
      const target = Math.max(0, Math.min(position1Based - 1, arr.length - 1));
      return i === target ? arr : arrayMove(arr, i, target);
    }),
    [apply, getId]
  );

  const moveByDrag = useCallback(
    (fromId: string, toId: string) => apply((arr) => {
      const from = arr.findIndex((x) => getId(x) === fromId);
      const to = arr.findIndex((x) => getId(x) === toId);
      if (from === -1 || to === -1 || from === to) return arr;
      return arrayMove(arr, from, to);
    }),
    [apply, getId]
  );

  const moveSelectedToPosition = useCallback(
    (ids: string[], position1Based: number) => apply((arr) => {
      if (ids.length === 0) return arr;
      const idSet = new Set(ids);
      const selected = arr.filter((x) => idSet.has(getId(x)));
      const rest = arr.filter((x) => !idSet.has(getId(x)));
      const target = Math.max(0, Math.min(position1Based - 1, rest.length));
      const next = [...rest];
      next.splice(target, 0, ...selected);
      return next;
    }),
    [apply, getId]
  );

  const reset = useCallback((next: T[]) => onReorder(next), [onReorder]);

  return {
    items,
    enabled,
    isSaving,
    indexOf,
    moveUp,
    moveDown,
    moveToTop,
    moveToBottom,
    moveToPosition,
    moveByDrag,
    moveSelectedToPosition,
    reset,
  };
}
