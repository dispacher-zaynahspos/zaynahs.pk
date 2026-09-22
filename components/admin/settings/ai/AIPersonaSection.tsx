'use client';

import React, { useState } from 'react';
import { AI_TONES, AI_LANGUAGES, AUDIENCE_PRESETS, TYPE_PRESETS } from './aiModelsData';

interface AIPersonaSectionProps {
  aiPersonaConfig: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  };
  setAiPersonaConfig: (val: any) => void;
  autoContentSeo: boolean;
  setAutoContentSeo: (val: boolean) => void;
  autoMediaAi: boolean;
  setAutoMediaAi: (val: boolean) => void;
}

export function AIPersonaSection({
  aiPersonaConfig,
  setAiPersonaConfig,
  autoContentSeo,
  setAutoContentSeo,
  autoMediaAi,
  setAutoMediaAi,
}: AIPersonaSectionProps) {
  const [customAudience, setCustomAudience] = useState('');
  const [customType, setCustomType] = useState('');

  const audiencesList = aiPersonaConfig.targetAudiences || [];
  const typesList = aiPersonaConfig.productTypes || [];

  const toggleAudience = (aud: string) => {
    const updated = audiencesList.includes(aud)
      ? audiencesList.filter(a => a !== aud)
      : [...audiencesList, aud];
    setAiPersonaConfig({ ...aiPersonaConfig, targetAudiences: updated });
  };

  const addCustomAudience = () => {
    if (!customAudience.trim()) return;
    const clean = customAudience.trim();
    if (!audiencesList.includes(clean)) {
      setAiPersonaConfig({ ...aiPersonaConfig, targetAudiences: [...audiencesList, clean] });
    }
    setCustomAudience('');
  };

  const toggleProductType = (t: string) => {
    const updated = typesList.includes(t)
      ? typesList.filter(x => x !== t)
      : [...typesList, t];
    setAiPersonaConfig({ ...aiPersonaConfig, productTypes: updated });
  };

  const addCustomProductType = () => {
    if (!customType.trim()) return;
    const clean = customType.trim();
    if (!typesList.includes(clean)) {
      setAiPersonaConfig({ ...aiPersonaConfig, productTypes: [...typesList, clean] });
    }
    setCustomType('');
  };

  return (
    <div className="space-y-8">
      {/* Behavior configuration */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Copywriting Persona & Behavior</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Tone of Voice</label>
            <select
              value={aiPersonaConfig.tone}
              onChange={(e) => setAiPersonaConfig({ ...aiPersonaConfig, tone: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
            >
              {AI_TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Output Language</label>
            <select
              value={aiPersonaConfig.language}
              onChange={(e) => setAiPersonaConfig({ ...aiPersonaConfig, language: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
            >
              {AI_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audiences Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Target Audiences</label>
            <div className="flex flex-wrap gap-4 items-center mt-1">
              {AUDIENCE_PRESETS.map((aud) => (
                <label key={aud} className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={audiencesList.includes(aud)}
                    onChange={() => toggleAudience(aud)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                  />
                  {aud}
                </label>
              ))}
            </div>
            <div className="flex gap-2 items-center mt-2">
              <input
                type="text"
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                placeholder="Custom audience..."
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-[36px]"
              />
              <button
                type="button"
                onClick={addCustomAudience}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl text-xs font-bold h-[36px]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Product Types Presets */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Product Types</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {TYPE_PRESETS.map((t) => {
                const isActive = typesList.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleProductType(t)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'bg-white border-gray-200 text-gray-600 dark:bg-transparent dark:border-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 items-center mt-2">
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Custom product type..."
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none h-[36px]"
              />
              <button
                type="button"
                onClick={addCustomProductType}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl text-xs font-bold h-[36px]"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Custom System Instructions</label>
            <textarea
              rows={3}
              value={aiPersonaConfig.customInstructions}
              onChange={(e) => setAiPersonaConfig({ ...aiPersonaConfig, customInstructions: e.target.value })}
              placeholder="e.g. Always write descriptions targeting young Pakistani fashion enthusiasts..."
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Automation toggles */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Automation Switches</h4>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoContentSeo}
              onChange={(e) => setAutoContentSeo(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Enable auto-generation of SEO titles/meta descriptions on save
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoMediaAi}
              onChange={(e) => setAutoMediaAi(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Enable auto-tagging & description analysis for uploaded product media
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
