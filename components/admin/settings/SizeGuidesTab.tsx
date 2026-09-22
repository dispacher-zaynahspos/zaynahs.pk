'use client';

import React from 'react';
import { SizeGuide } from '@/lib/types';
import { SizeGuidePresetsList, SizeGuideFormCard } from './size-guides';

interface SizeGuidesTabProps {
  sizeGuides: SizeGuide[];
  selectedGuide: SizeGuide | null;
  guideName: string;
  setGuideName: (v: string) => void;
  guideImageUrl: string;
  setGuideImageUrl: (v: string) => void;
  guideColumns: string;
  setGuideColumns: (v: string) => void;
  guideRows: Array<Record<string, string>>;
  setGuideRows: React.Dispatch<React.SetStateAction<Array<Record<string, string>>>>;
  isEditingGuide: boolean;
  selectedGuideIds: Set<string>;
  setSelectedGuideIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  startEditSizeGuide: (guide: SizeGuide) => void;
  handleDeleteSizeGuide: (id: string) => void;
  handleSaveSizeGuide: (e: React.FormEvent) => void;
  resetSizeGuideForm: () => void;
  handleRemoveImage: (type: 'logo' | 'favicon' | 'banner' | 'exit_intent' | 'size_chart') => void;
}

export default function SizeGuidesTab({
  sizeGuides,
  selectedGuide,
  guideName,
  setGuideName,
  guideImageUrl,
  setGuideImageUrl,
  guideColumns,
  setGuideColumns,
  guideRows,
  setGuideRows,
  isEditingGuide,
  selectedGuideIds,
  setSelectedGuideIds,
  onExport,
  onImport,
  fileInputRef,
  startEditSizeGuide,
  handleDeleteSizeGuide,
  handleSaveSizeGuide,
  resetSizeGuideForm,
  handleRemoveImage
}: SizeGuidesTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <SizeGuidePresetsList
        sizeGuides={sizeGuides}
        selectedGuide={selectedGuide}
        selectedGuideIds={selectedGuideIds}
        setSelectedGuideIds={setSelectedGuideIds}
        onExport={onExport}
        onImport={onImport}
        fileInputRef={fileInputRef}
        startEditSizeGuide={startEditSizeGuide}
        handleDeleteSizeGuide={handleDeleteSizeGuide}
      />

      <SizeGuideFormCard
        guideName={guideName}
        setGuideName={setGuideName}
        guideImageUrl={guideImageUrl}
        setGuideImageUrl={setGuideImageUrl}
        guideColumns={guideColumns}
        setGuideColumns={setGuideColumns}
        guideRows={guideRows}
        setGuideRows={setGuideRows}
        isEditingGuide={isEditingGuide}
        handleSaveSizeGuide={handleSaveSizeGuide}
        resetSizeGuideForm={resetSizeGuideForm}
        handleRemoveImage={handleRemoveImage}
      />
    </div>
  );
}
