'use client';

import React, { useState } from 'react';
import { ExternalLink, Loader2, ShieldCheck } from '@/components/common/Icons';
import { TEXT_MODELS, VISION_MODELS, PROVIDER_KEY_LINKS, getModelLabel } from './aiModelsData';

interface AIModelsSectionProps {
  contentProvider: string;
  setContentProvider: (val: string) => void;
  contentModel: string;
  setContentModel: (val: string) => void;
  visionProvider: string;
  setVisionProvider: (val: string) => void;
  visionModel: string;
  setVisionModel: (val: string) => void;
  aiModelCredentials: Record<string, Record<string, string>>;
  setAiModelCredentials: (val: Record<string, Record<string, string>>) => void;
}

export function AIModelsSection({
  contentProvider,
  setContentProvider,
  contentModel,
  setContentModel,
  visionProvider,
  setVisionProvider,
  visionModel,
  setVisionModel,
  aiModelCredentials,
  setAiModelCredentials,
}: AIModelsSectionProps) {
  const [testingKey, setTestingKey] = useState<'content' | 'vision' | null>(null);
  const [keyTestResult, setKeyTestResult] = useState<{ section: string; valid: boolean; message: string } | null>(null);

  const contentKeys = aiModelCredentials?.content?.[contentProvider] || '';
  const visionKeys = aiModelCredentials?.vision?.[visionProvider] || '';

  const setContentKeys = (val: string) => {
    setAiModelCredentials({
      ...aiModelCredentials,
      content: {
        ...(aiModelCredentials.content || {}),
        [contentProvider]: val,
      },
    });
  };

  const setVisionKeys = (val: string) => {
    setAiModelCredentials({
      ...aiModelCredentials,
      vision: {
        ...(aiModelCredentials.vision || {}),
        [visionProvider]: val,
      },
    });
  };

  const handleContentProviderChange = (val: string) => {
    setContentProvider(val);
    const defaultModel = TEXT_MODELS[val]?.[0] || '';
    setContentModel(defaultModel);
  };

  const handleVisionProviderChange = (val: string) => {
    setVisionProvider(val);
    const defaultModel = VISION_MODELS[val]?.[0] || '';
    setVisionModel(defaultModel);
  };

  const handleTestKey = async (section: 'content' | 'vision') => {
    const provider = section === 'content' ? contentProvider : visionProvider;
    const keysRaw = aiModelCredentials?.[section]?.[provider] || '';
    const firstKey = keysRaw.split('\n').map(k => k.trim()).filter(Boolean)[0];
    if (!firstKey) {
      setKeyTestResult({ section, valid: false, message: 'No API key entered' });
      return;
    }
    setTestingKey(section);
    setKeyTestResult(null);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: firstKey, section }),
      });
      const data = await res.json();
      setKeyTestResult({ section, valid: data.valid, message: data.valid ? 'Key is valid ✓' : (data.error || 'Invalid key') });
    } catch {
      setKeyTestResult({ section, valid: false, message: 'Connection failed' });
    } finally {
      setTestingKey(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Models & Credentials</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Select model providers and supply your API credentials. API keys are stored securely in the database.
      </p>

      {/* Text/SEO Provider */}
      <div className="space-y-4 pt-2 border-t border-gray-150 dark:border-gray-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Text & SEO Copywriter</h4>
        
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Model Provider</label>
          <select
            value={contentProvider}
            onChange={(e) => handleContentProviderChange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
          >
            {Object.keys(TEXT_MODELS).map((prov) => (
              <option key={prov} value={prov}>{prov.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Model Identifier</label>
          <select
            value={contentModel}
            onChange={(e) => setContentModel(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
          >
            {(TEXT_MODELS[contentProvider] || []).map((model) => (
              <option key={model} value={model}>{getModelLabel(contentProvider, model)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">
            API Key / Access Secret
            {!contentKeys && (
              <span className="ml-2 text-[10px] font-bold text-amber-500 uppercase">Not Configured</span>
            )}
          </label>
          <div className="relative mt-1.5">
            <textarea
              rows={2}
              value={contentKeys}
              onChange={(e) => setContentKeys(e.target.value)}
              placeholder="Enter API Key(s), one per line for rotation"
              className={`w-full rounded-xl border bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all ${
                !contentKeys
                  ? 'border-dashed border-amber-300 dark:border-amber-700'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            />
            {!contentKeys && (
              <div className="absolute inset-0 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 pointer-events-none" />
            )}
          </div>
          {PROVIDER_KEY_LINKS[contentProvider] && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>Need keys?</span>
              <a 
                href={PROVIDER_KEY_LINKS[contentProvider]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                Get keys from {contentProvider.toUpperCase()} Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleTestKey('content')}
              disabled={testingKey !== null || !contentKeys}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {testingKey === 'content' ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
              ) : (
                <><ShieldCheck className="w-3 h-3" /> Validate Key</>
              )}
            </button>
            {keyTestResult && keyTestResult.section === 'content' && (
              <span className={`text-xs font-semibold ${keyTestResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                {keyTestResult.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vision/Image Analyzer Provider */}
      <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Media & Vision Analyzer</h4>
        
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Vision Provider</label>
          <select
            value={visionProvider}
            onChange={(e) => handleVisionProviderChange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
          >
            {Object.keys(VISION_MODELS).map((prov) => (
              <option key={prov} value={prov}>{prov.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">Vision Model Identifier</label>
          <select
            value={visionModel}
            onChange={(e) => setVisionModel(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
          >
            {(VISION_MODELS[visionProvider] || []).map((model) => (
              <option key={model} value={model}>{getModelLabel(visionProvider, model)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-455">
            API Key / Access Secret
            {!visionKeys && (
              <span className="ml-2 text-[10px] font-bold text-amber-500 uppercase">Not Configured</span>
            )}
          </label>
          <div className="relative mt-1.5">
            <textarea
              rows={2}
              value={visionKeys}
              onChange={(e) => setVisionKeys(e.target.value)}
              placeholder="Enter Vision API key"
              className={`w-full rounded-xl border bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all ${
                !visionKeys
                  ? 'border-dashed border-amber-300 dark:border-amber-700'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            />
            {!visionKeys && (
              <div className="absolute inset-0 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 pointer-events-none" />
            )}
          </div>
          {PROVIDER_KEY_LINKS[visionProvider] && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>Need keys?</span>
              <a 
                href={PROVIDER_KEY_LINKS[visionProvider]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                Get keys from {visionProvider.toUpperCase()} Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleTestKey('vision')}
              disabled={testingKey !== null || !visionKeys}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {testingKey === 'vision' ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
              ) : (
                <><ShieldCheck className="w-3 h-3" /> Validate Key</>
              )}
            </button>
            {keyTestResult && keyTestResult.section === 'vision' && (
              <span className={`text-xs font-semibold ${keyTestResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                {keyTestResult.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
