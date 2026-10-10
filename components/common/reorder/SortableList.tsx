'use client';

/**
 * SortableList — THE single shared reorderable list (RULE SSOT1 + rule 15).
 *
 * Replaces every bespoke drag/chevron/move implementation across admin + store.
 * Combines dnd-kit vertical drag, up/down chevrons, a three-dots "Move" menu,
 * long-press Move modal, keyboard reorder, optimistic update + rollback, and a
 * disabled hint when reordering is off (sort != Manual).
 *
 * Rendering is "headless-ish": the caller provides `renderItem(item, api)` so it
 * can lay out its own row (card, pill) while the drag handle + controls come
 * from this component via `api`.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  MoreVertical,
} from '@/components/common/Icons';
import { useReorder, type ReorderableItem } from '@/lib/hooks/useReorder';
import { useLongPress } from '@/lib/hooks/useLongPress';
import { ReorderMoveModal } from './ReorderMoveModal';

export interface SortableRowApi {
  dragHandleProps: Record<string, unknown>;
  isDragging: boolean;
  isFirst: boolean;
  isLast: boolean;
  rank: number;
  moveUp: () => void;
  moveDown: () => void;
  openMoveMenu: () => void;
  enabled: boolean;
  Controls: React.FC<{ className?: string }>;
}

export interface SortableListProps<T extends ReorderableItem> {
  items: T[];
  onReorder: (next: T[]) => void | Promise<void>;
  renderItem: (item: T, api: SortableRowApi) => React.ReactNode;
  enabled?: boolean;
  getId?: (item: T) => string;
  disabledHint?: string;
  className?: string;
  rankOffset?: number;
  totalCount?: number;
  renderDragOverlay?: (item: T) => React.ReactNode;
}

interface InternalRowProps<T extends ReorderableItem> {
  item: T;
  index: number;
  total: number;
  rankOffset: number;
  enabled: boolean;
  getId: (item: T) => string;
  renderItem: (item: T, api: SortableRowApi) => React.ReactNode;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  onOpenMove: (id: string) => void;
}

function SortableRow<T extends ReorderableItem>({
  item,
  index,
  total,
  rankOffset,
  enabled,
  getId,
  renderItem,
  moveUp,
  moveDown,
  onOpenMove,
}: InternalRowProps<T>) {
  const id = getId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !enabled });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const longPress = useLongPress({
    onLongPress: () => onOpenMove(id),
    delay: 500,
    moveTolerance: 10,
    disabled: !enabled,
  });

  const dragHandleProps = enabled
    ? { ref: setActivatorNodeRef, ...attributes, ...listeners, style: { touchAction: 'none' as const } }
    : {};

  const Controls: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <button
        type="button"
        aria-label="Move up"
        disabled={!enabled || isFirst}
        onClick={() => moveUp(id)}
        className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-md"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={!enabled || isLast}
        onClick={() => moveDown(id)}
        className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-md"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <span
        {...(dragHandleProps as Record<string, unknown>)}
        aria-label="Drag to reorder"
        className={`h-7 w-7 flex items-center justify-center text-gray-400 ${enabled ? 'cursor-grab active:cursor-grabbing' : 'opacity-20 cursor-not-allowed'} select-none`}
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <button
        type="button"
        aria-label="Move options"
        disabled={!enabled}
        onClick={() => onOpenMove(id)}
        className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-md"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  );

  const api: SortableRowApi = {
    dragHandleProps,
    isDragging,
    isFirst,
    isLast,
    rank: rankOffset + index + 1,
    moveUp: () => moveUp(id),
    moveDown: () => moveDown(id),
    openMoveMenu: () => onOpenMove(id),
    enabled,
    Controls,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...longPress}
      className="[-webkit-touch-callout:none] select-none"
      role="option"
      aria-selected={false}
    >
      {renderItem(item, api)}
    </div>
  );
}

export function SortableList<T extends ReorderableItem>({
  items,
  onReorder,
  renderItem,
  enabled = true,
  getId = (item) => item.id,
  disabledHint = 'Switch to Manual Order to reorder',
  className = 'space-y-1',
  rankOffset = 0,
  totalCount,
  renderDragOverlay,
}: SortableListProps<T>) {
  const reorder = useReorder<T>({ items, onReorder, enabled, getId });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const portalRef = useRef<HTMLElement | null>(null);
  if (typeof document !== 'undefined' && !portalRef.current) {
    portalRef.current = document.body;
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 520, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => items.map((i) => getId(i)), [items, getId]);
  const activeItem = useMemo(
    () => items.find((i) => getId(i) === activeId) || null,
    [items, getId, activeId]
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      reorder.moveByDrag(active.id as string, over.id as string);
    },
    [reorder]
  );

  const moveTargetIndex = moveTargetId ? reorder.indexOf(moveTargetId) : -1;
  const total = totalCount ?? items.length;

  return (
    <div className="relative">
      {!enabled && disabledHint && (
        <div className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg px-3 py-1.5">
          {disabledHint}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className={className} role="listbox" aria-label="Reorderable list">
            {items.map((item, index) => (
              <SortableRow
                key={getId(item)}
                item={item}
                index={index}
                total={items.length}
                rankOffset={rankOffset}
                enabled={enabled}
                getId={getId}
                renderItem={renderItem}
                moveUp={reorder.moveUp}
                moveDown={reorder.moveDown}
                onOpenMove={setMoveTargetId}
              />
            ))}
          </div>
        </SortableContext>

        {portalRef.current &&
          createPortal(
            <DragOverlay dropAnimation={null} zIndex={999999}>
              {activeItem
                ? (renderDragOverlay
                    ? renderDragOverlay(activeItem)
                    : renderItem(activeItem, {
                        dragHandleProps: {},
                        isDragging: true,
                        isFirst: false,
                        isLast: false,
                        rank: 0,
                        moveUp: () => {},
                        moveDown: () => {},
                        openMoveMenu: () => {},
                        enabled,
                        Controls: () => null,
                      }))
                : null}
            </DragOverlay>,
            portalRef.current
          )}
      </DndContext>

      <ReorderMoveModal
        open={moveTargetIndex !== -1}
        currentPosition={rankOffset + moveTargetIndex + 1}
        totalCount={total}
        isFirst={moveTargetIndex === 0}
        isLast={moveTargetIndex === items.length - 1}
        onClose={() => setMoveTargetId(null)}
        onMoveTop={() => moveTargetId && reorder.moveToTop(moveTargetId)}
        onMoveUp={() => moveTargetId && reorder.moveUp(moveTargetId)}
        onMoveDown={() => moveTargetId && reorder.moveDown(moveTargetId)}
        onMoveBottom={() => moveTargetId && reorder.moveToBottom(moveTargetId)}
        onMoveToPosition={(pos: number) => moveTargetId && reorder.moveToPosition(moveTargetId, pos - rankOffset)}
      />
    </div>
  );
}

export default SortableList;
