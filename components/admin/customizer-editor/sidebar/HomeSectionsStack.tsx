'use client';

import { MessageSquare } from '@/components/common/Icons';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HomepageSection, StoreSettings } from '@/lib/types';
import { isSectionEnabled, sectionPremiumFeature, PREMIUM_FEATURE_LABEL } from '@/lib/features/premium';
import { SECTION_PALETTE } from '@/lib/theme-schema/sections';
import { toast } from 'sonner';
import { useLongPress } from '@/lib/hooks/useLongPress';
import { ReorderMoveModal } from '@/components/common/reorder';
import SectionStackRow from './SectionStackRow';

interface HomeSectionsStackProps {
  storeSettings: StoreSettings;
  sections: HomepageSection[];
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  setActivePage: (page: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance') => void;
  handleAddSection: (type: string) => void;
  handleUpdateSection: (id: string, updates: Partial<HomepageSection>) => void;
  handleMoveSection: (idx: number, dir: 'up' | 'down') => void;
  handleReorderSections?: (fromId: string, toId: string) => void;
  handleMoveSectionToPosition?: (id: string, position1Based: number) => void;
  handleDeleteSection: (id: string) => void;
  handleDuplicateSection?: (id: string) => void;
}

export default function HomeSectionsStack({
  storeSettings,
  sections,
  activeSectionId,
  setActiveSectionId,
  setActivePage,
  handleAddSection,
  handleUpdateSection,
  handleMoveSection,
  handleReorderSections,
  handleMoveSectionToPosition,
  handleDeleteSection,
  handleDuplicateSection,
}: HomeSectionsStackProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 520, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const startRename = (section: HomepageSection) => {
    setRenamingId(section.id);
    setRenameValue(section.title || '');
  };
  const commitRename = (id: string) => {
    const next = renameValue.trim();
    if (next) handleUpdateSection(id, { title: next });
    setRenamingId(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id || !handleReorderSections) return;
    handleReorderSections(active.id as string, over.id as string);
  };

  const moveTargetIdx = moveTargetId ? sections.findIndex((s) => s.id === moveTargetId) : -1;

  return (
    <>
      {/* Add section widget */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          + Add Layout Section
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SECTION_PALETTE.map((item) => {
            const isFeatureDisabled = !isSectionEnabled(storeSettings, item.type);

            return (
              <button
                key={item.type}
                title={item.description}
                onClick={() => {
                  if (isFeatureDisabled) {
                    const feature = sectionPremiumFeature(item.type);
                    const featureName = feature ? PREMIUM_FEATURE_LABEL[feature] : 'This feature';
                    toast.error(`🔒 ${featureName} is disabled! Enable it in Settings > Premium Tab.`);
                    return;
                  }
                  handleAddSection(item.type);
                }}
                className={`px-2.5 py-1.5 text-left border rounded-xl transition-all text-xs font-bold ${
                  isFeatureDisabled
                    ? 'bg-gray-100/50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-650 cursor-not-allowed'
                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800/80 hover:border-[#e94560] dark:hover:border-[#e94560] text-gray-700 dark:text-gray-300 active:scale-97 cursor-pointer'
                }`}
              >
                {isFeatureDisabled ? `🔒 ${item.label}` : item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcement Bar Widget Shortcut */}
      <div
        onClick={() => {
          setActiveSectionId('announcement_bar');
          setActivePage('home');
        }}
        className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer mb-4 ${
          activeSectionId === 'announcement_bar'
            ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#e94560]" />
          <div className="min-w-0 flex-grow">
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              Announcement News Bar
            </div>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Permanent Header Banner
            </span>
          </div>
        </div>
      </div>

      {/* Section Stack */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Section Layout Order
        </label>

        {sections.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-semibold text-gray-400">
            No custom sections added yet.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((section, idx) => (
                  <SortableSectionRow
                    key={section.id}
                    section={section}
                    idx={idx}
                    total={sections.length}
                    isActive={activeSectionId === section.id}
                    isDisabled={!isSectionEnabled(storeSettings, section.section_type)}
                    renaming={renamingId === section.id}
                    renameValue={renameValue}
                    onSelect={() => setActiveSectionId(section.id)}
                    onToggleVisible={() => handleUpdateSection(section.id, { active: !section.active })}
                    onStartRename={() => startRename(section)}
                    onRenameChange={setRenameValue}
                    onCommitRename={() => commitRename(section.id)}
                    onCancelRename={() => setRenamingId(null)}
                    onMoveUp={() => handleMoveSection(idx, 'up')}
                    onMoveDown={() => handleMoveSection(idx, 'down')}
                    onDelete={() => handleDeleteSection(section.id)}
                    onDuplicate={handleDuplicateSection ? () => handleDuplicateSection(section.id) : undefined}
                    onOpenMove={handleMoveSectionToPosition ? () => setMoveTargetId(section.id) : undefined}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {handleMoveSectionToPosition && (
        <ReorderMoveModal
          open={moveTargetIdx !== -1}
          title="Move section"
          currentPosition={moveTargetIdx + 1}
          totalCount={sections.length}
          isFirst={moveTargetIdx === 0}
          isLast={moveTargetIdx === sections.length - 1}
          onClose={() => setMoveTargetId(null)}
          onMoveTop={() => moveTargetId && handleMoveSectionToPosition(moveTargetId, 1)}
          onMoveUp={() => moveTargetIdx > 0 && handleMoveSection(moveTargetIdx, 'up')}
          onMoveDown={() => moveTargetIdx < sections.length - 1 && handleMoveSection(moveTargetIdx, 'down')}
          onMoveBottom={() => moveTargetId && handleMoveSectionToPosition(moveTargetId, sections.length)}
          onMoveToPosition={(pos: number) => moveTargetId && handleMoveSectionToPosition(moveTargetId, pos)}
        />
      )}
    </>
  );
}

interface SortableSectionRowProps {
  section: HomepageSection;
  idx: number;
  total: number;
  isActive: boolean;
  isDisabled: boolean;
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
  onDuplicate?: () => void;
  onOpenMove?: () => void;
}

function SortableSectionRow({
  section, idx, total, isActive, isDisabled, renaming, renameValue,
  onSelect, onToggleVisible, onStartRename, onRenameChange, onCommitRename,
  onCancelRename, onMoveUp, onMoveDown, onDelete, onDuplicate, onOpenMove,
}: SortableSectionRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const longPress = useLongPress({
    onLongPress: () => onOpenMove?.(),
    delay: 500,
    moveTolerance: 10,
    disabled: !onOpenMove,
  });

  const dragHandleProps = { ref: setActivatorNodeRef, ...attributes, ...listeners };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionStackRow
        title={section.title || section.section_type}
        subtitle={section.section_type.replace('_', ' ')}
        isActive={isActive}
        isDisabled={isDisabled}
        isVisible={section.active !== false}
        isFirst={idx === 0}
        isLast={idx === total - 1}
        renaming={renaming}
        renameValue={renameValue}
        onSelect={onSelect}
        onToggleVisible={onToggleVisible}
        onStartRename={onStartRename}
        onRenameChange={onRenameChange}
        onCommitRename={onCommitRename}
        onCancelRename={onCancelRename}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        dragHandleProps={dragHandleProps as Record<string, unknown>}
        longPressProps={onOpenMove ? (longPress as unknown as Record<string, unknown>) : undefined}
      />
    </div>
  );
}
