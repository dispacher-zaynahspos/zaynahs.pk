'use client';

import React, { useState } from 'react';
import { Zap } from '@/components/common/Icons';
import { AIModelsSection } from './ai/AIModelsSection';
import { AIBusinessPresets } from './ai/AIBusinessPresets';
import { AIPersonaSection } from './ai/AIPersonaSection';
import { AIPromptsAndTemplates } from './ai/AIPromptsAndTemplates';

interface AITabProps {
  aiEnabled: boolean;
  setAiEnabled: (val: boolean) => void;
  contentProvider: string;
  setContentProvider: (val: string) => void;
  contentModel: string;
  setContentModel: (val: string) => void;
  aiModelCredentials: Record<string, Record<string, string>>;
  setAiModelCredentials: (val: Record<string, Record<string, string>>) => void;
  visionProvider: string;
  setVisionProvider: (val: string) => void;
  visionModel: string;
  setVisionModel: (val: string) => void;
  aiPersonaConfig: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  };
  setAiPersonaConfig: (val: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  }) => void;
  autoContentSeo: boolean;
  setAutoContentSeo: (val: boolean) => void;
  autoMediaAi: boolean;
  setAutoMediaAi: (val: boolean) => void;
  categoryDefaultTemplate: string;
  setCategoryDefaultTemplate: (val: string) => void;
  productDefaultTemplate: string;
  setProductDefaultTemplate: (val: string) => void;
  categoryDescriptionPrompt: string;
  setCategoryDescriptionPrompt: (val: string) => void;
  categoryDescriptionLimit: number;
  setCategoryDescriptionLimit: (val: number) => void;
  productDescriptionPrompt: string;
  setProductDescriptionPrompt: (val: string) => void;
  productDescriptionLimit: number;
  setProductDescriptionLimit: (val: number) => void;
  productShortPrompt: string;
  setProductShortPrompt: (val: string) => void;
  productShortLimit: number;
  setProductShortLimit: (val: number) => void;
  collectionDefaultTemplate: string;
  setCollectionDefaultTemplate: (val: string) => void;
  collectionDescriptionPrompt: string;
  setCollectionDescriptionPrompt: (val: string) => void;
  collectionDescriptionLimit: number;
  setCollectionDescriptionLimit: (val: number) => void;
}

export default function AITab({
  aiEnabled,
  setAiEnabled,
  contentProvider,
  setContentProvider,
  contentModel,
  setContentModel,
  aiModelCredentials,
  setAiModelCredentials,
  visionProvider,
  setVisionProvider,
  visionModel,
  setVisionModel,
  aiPersonaConfig,
  setAiPersonaConfig,
  autoContentSeo,
  setAutoContentSeo,
  autoMediaAi,
  setAutoMediaAi,
  categoryDefaultTemplate,
  setCategoryDefaultTemplate,
  productDefaultTemplate,
  setProductDefaultTemplate,
  categoryDescriptionPrompt,
  setCategoryDescriptionPrompt,
  categoryDescriptionLimit,
  setCategoryDescriptionLimit,
  productDescriptionPrompt,
  setProductDescriptionPrompt,
  productDescriptionLimit,
  setProductDescriptionLimit,
  productShortPrompt,
  setProductShortPrompt,
  productShortLimit,
  setProductShortLimit,
  collectionDefaultTemplate,
  setCollectionDefaultTemplate,
  collectionDescriptionPrompt,
  setCollectionDescriptionPrompt,
  collectionDescriptionLimit,
  setCollectionDescriptionLimit,
}: AITabProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return (
      <div className="space-y-8 col-span-1 md:col-span-2">
        <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 col-span-1 md:col-span-2">
      {/* Master Switch Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 transition-colors">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Enable AI Copilot globally
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Turn the AI system ON or OFF. When disabled, "Write AI" description generators and background indexing checks will be suspended.
          </p>
        </div>
        <input
          type="checkbox"
          checked={aiEnabled}
          onChange={(e) => setAiEnabled(e.target.checked)}
          className="w-10 h-6 rounded-full bg-gray-200 checked:bg-[#e94560] appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all shrink-0"
        />
      </div>

      {aiEnabled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Panel: Models & Credentials */}
          <AIModelsSection
            contentProvider={contentProvider}
            setContentProvider={setContentProvider}
            contentModel={contentModel}
            setContentModel={setContentModel}
            visionProvider={visionProvider}
            setVisionProvider={setVisionProvider}
            visionModel={visionModel}
            setVisionModel={setVisionModel}
            aiModelCredentials={aiModelCredentials}
            setAiModelCredentials={setAiModelCredentials}
          />

          {/* Right Panel: Presets & Persona & Toggles */}
          <div className="space-y-8">
            <AIBusinessPresets
              aiPersonaConfig={aiPersonaConfig}
              setAiPersonaConfig={setAiPersonaConfig}
              setCategoryDescriptionPrompt={setCategoryDescriptionPrompt}
              setCategoryDescriptionLimit={setCategoryDescriptionLimit}
              setProductDescriptionPrompt={setProductDescriptionPrompt}
              setProductDescriptionLimit={setProductDescriptionLimit}
              setProductShortPrompt={setProductShortPrompt}
              setProductShortLimit={setProductShortLimit}
              setCategoryDefaultTemplate={setCategoryDefaultTemplate}
              setProductDefaultTemplate={setProductDefaultTemplate}
            />

            <AIPersonaSection
              aiPersonaConfig={aiPersonaConfig}
              setAiPersonaConfig={setAiPersonaConfig}
              autoContentSeo={autoContentSeo}
              setAutoContentSeo={setAutoContentSeo}
              autoMediaAi={autoMediaAi}
              setAutoMediaAi={setAutoMediaAi}
            />
          </div>

          {/* Full-width Rows: Prompts, limits and templates */}
          <AIPromptsAndTemplates
            categoryDefaultTemplate={categoryDefaultTemplate}
            setCategoryDefaultTemplate={setCategoryDefaultTemplate}
            productDefaultTemplate={productDefaultTemplate}
            setProductDefaultTemplate={setProductDefaultTemplate}
            categoryDescriptionPrompt={categoryDescriptionPrompt}
            setCategoryDescriptionPrompt={setCategoryDescriptionPrompt}
            categoryDescriptionLimit={categoryDescriptionLimit}
            setCategoryDescriptionLimit={setCategoryDescriptionLimit}
            productDescriptionPrompt={productDescriptionPrompt}
            setProductDescriptionPrompt={setProductDescriptionPrompt}
            productDescriptionLimit={productDescriptionLimit}
            setProductDescriptionLimit={setProductDescriptionLimit}
            productShortPrompt={productShortPrompt}
            setProductShortPrompt={setProductShortPrompt}
            productShortLimit={productShortLimit}
            setProductShortLimit={setProductShortLimit}
            collectionDefaultTemplate={collectionDefaultTemplate}
            setCollectionDefaultTemplate={setCollectionDefaultTemplate}
            collectionDescriptionPrompt={collectionDescriptionPrompt}
            setCollectionDescriptionPrompt={setCollectionDescriptionPrompt}
            collectionDescriptionLimit={collectionDescriptionLimit}
            setCollectionDescriptionLimit={setCollectionDescriptionLimit}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16162a] p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-455 transition-colors col-span-1 md:col-span-2">
          <Zap className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">AI System Disabled</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            AI copywriting and image analysis capabilities are currently disabled globally. Turn on the switch above to configure API keys, models, behavior parameters, and default templates.
          </p>
        </div>
      )}
    </div>
  );
}
