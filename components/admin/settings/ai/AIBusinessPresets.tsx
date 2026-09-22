'use client';

import React, { useState } from 'react';
import { BUSINESS_PRESETS, BusinessPreset } from './aiModelsData';

interface AIBusinessPresetsProps {
  aiPersonaConfig: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  };
  setAiPersonaConfig: (val: any) => void;
  setCategoryDescriptionPrompt: (val: string) => void;
  setCategoryDescriptionLimit: (val: number) => void;
  setProductDescriptionPrompt: (val: string) => void;
  setProductDescriptionLimit: (val: number) => void;
  setProductShortPrompt: (val: string) => void;
  setProductShortLimit: (val: number) => void;
  setCategoryDefaultTemplate: (val: string) => void;
  setProductDefaultTemplate: (val: string) => void;
}

export function AIBusinessPresets({
  aiPersonaConfig,
  setAiPersonaConfig,
  setCategoryDescriptionPrompt,
  setCategoryDescriptionLimit,
  setProductDescriptionPrompt,
  setProductDescriptionLimit,
  setProductShortPrompt,
  setProductShortLimit,
  setCategoryDefaultTemplate,
  setProductDefaultTemplate,
}: AIBusinessPresetsProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const applyPreset = (presetId: string) => {
    const preset = BUSINESS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setAiPersonaConfig({
      ...aiPersonaConfig,
      targetAudiences: preset.audiences,
      productTypes: preset.productTypes,
      tone: preset.tone,
    });
    setCategoryDescriptionPrompt(preset.categoryPrompt);
    setCategoryDescriptionLimit(preset.categoryLimit);
    setProductDescriptionPrompt(preset.productPrompt);
    setProductDescriptionLimit(preset.productLimit);
    setProductShortPrompt(preset.shortPrompt);
    setProductShortLimit(preset.shortLimit);
    setCategoryDefaultTemplate(preset.categoryTemplate);
    setProductDefaultTemplate(preset.productTemplate);
    setSelectedPresetId(presetId);
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e]/5 to-[#e94560]/5 dark:from-[#1a1a2e] dark:to-[#16162a] p-6 rounded-2xl border border-[#e94560]/20 dark:border-[#e94560]/30 shadow-sm space-y-4 transition-colors">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚡</span> Business Type Presets
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select your business type to auto-fill all AI prompts, word limits, target audiences, product types, and HTML templates.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {BUSINESS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setSelectedPresetId(selectedPresetId === preset.id ? '' : preset.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedPresetId === preset.id
                ? 'bg-[#e94560] border-[#e94560] text-white shadow-md'
                : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560]'
            }`}
          >
            <span>{preset.emoji}</span>
            {preset.name}
          </button>
        ))}
      </div>
      {selectedPresetId && (
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => applyPreset(selectedPresetId)}
            className="flex items-center gap-2 px-4 py-2 bg-[#e94560] hover:bg-[#c73652] text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            ✅ Apply &ldquo;{BUSINESS_PRESETS.find(p => p.id === selectedPresetId)?.name}&rdquo; Preset
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Will auto-fill audiences, product types, prompts, word limits &amp; HTML templates below.
          </span>
        </div>
      )}
    </div>
  );
}
