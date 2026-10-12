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
  handleLoadDefaultHtml?: () => void;
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
  handleLoadDefaultHtml,
}: TemplateEditorFormProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Theme Link Banner */}
      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🎨</span>
          <div>
            <span className="font-bold">Active Theme Linked:</span>
            <span className="ml-1 text-emerald-700 dark:text-emerald-400">
              Default templates automatically adopt your active theme preset colors, logo, and store branding.
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 transition-colors">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                mode === 'default'
                  ? 'border-[#1a1a2e] dark:border-[#e94560] bg-gray-50/40 dark:bg-white/5'
                  : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
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
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                Uses built-in responsive e-commerce layout linked with your theme colors, buttons, logo, and WhatsApp links.
              </span>
            </label>

            <label
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                mode === 'custom'
                  ? 'border-[#1a1a2e] dark:border-[#e94560] bg-gray-50/40 dark:bg-white/5'
                  : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
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
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                Write raw custom HTML code. Fully customizable layout, typography, and promotional styling.
              </span>
            </label>
          </div>
        </div>

        {/* Custom HTML Textarea Editor */}
        {mode === 'custom' && (
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Custom HTML Body
              </label>
              <div className="flex items-center gap-3">
                {handleLoadDefaultHtml && (
                  <button
                    type="button"
                    onClick={handleLoadDefaultHtml}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    📋 Load Default HTML Template
                  </button>
                )}
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  🔄 Reset to Default Layout
                </button>
              </div>
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

        {/* Default Mode Notice & Actions */}
        {mode === 'default' && (
          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Default mode is active. You can customize this anytime by switching to Custom HTML.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:underline cursor-pointer flex items-center gap-1"
            >
              🔄 Reset Subject & Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
