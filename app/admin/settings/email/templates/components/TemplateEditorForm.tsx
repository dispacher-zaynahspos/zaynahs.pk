'use client';

import React from 'react';
import { EmailTemplate } from './types';

interface TemplateEditorFormProps {
  subject: string;
  setSubject: (v: string) => void;
  mode: 'default' | 'custom';
  setMode: (v: 'default' | 'custom') => void;
  customHtml: string;
  setCustomHtml: (v: string) => void;
  template: EmailTemplate;
  handleReset: () => void;
}

export default function TemplateEditorForm({
  subject,
  setSubject,
  mode,
  setMode,
  customHtml,
  setCustomHtml,
  template,
  handleReset,
}: TemplateEditorFormProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
        {/* Subject Line */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-5/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
          <p className="text-[10px] text-gray-450 mt-1">
            Supports placeholders like{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-600 dark:text-gray-300">
              &#123;&#123;brand_name&#125;&#125;
            </code>{' '}
            and{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-600 dark:text-gray-300">
              &#123;&#123;order_id&#125;&#125;
            </code>
            .
          </p>
        </div>

        {/* Mode Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Template Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                mode === 'default'
                  ? 'border-[#1a1a2e] dark:border-[#e94560] bg-gray-50/20 dark:bg-white/5'
                  : 'border-gray-250 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="template-mode"
                  checked={mode === 'default'}
                  onChange={() => setMode('default')}
                  className="text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white">Default Template</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium leading-relaxed">
                Uses built-in Shopify-style responsive layout with your store colors and branding.
              </span>
            </label>

            <label
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                mode === 'custom'
                  ? 'border-[#1a1a2e] dark:border-[#e94560] bg-gray-50/20 dark:bg-white/5'
                  : 'border-gray-250 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="template-mode"
                  checked={mode === 'custom'}
                  onChange={() => setMode('custom')}
                  className="text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white">Custom Template (HTML)</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium leading-relaxed">
                Write raw HTML code. Fully customizable layout, typography and items display.
              </span>
            </label>
          </div>
        </div>

        {/* Custom HTML Textarea Editor */}
        {mode === 'custom' && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Custom HTML Body
              </label>
              {template.customHtml && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] font-bold text-[#e94560] hover:underline"
                >
                  Reset to Default Layout
                </button>
              )}
            </div>
            <textarea
              id="html-textarea"
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              placeholder="<html>&#10;<body style='font-family: sans-serif;'>&#10;  ...&#10;</body>&#10;</html>"
              className="w-full h-80 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#0f0f1b] px-4 py-3 text-xs font-mono text-gray-200 focus:border-[#e94560] focus:outline-none transition-all resize-y"
            />
          </div>
        )}
      </div>
    </div>
  );
}
