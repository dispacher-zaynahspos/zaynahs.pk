'use client';

import React from 'react';
import { Eye, Mail, Save } from '@/components/common/Icons';

interface TemplateVariablesSidebarProps {
  availableVars: string[];
  mode: 'default' | 'custom';
  insertVariable: (variable: string) => void;
  handleOpenPreview: () => void;
  handleSendTest: () => void;
  sendingTest: boolean;
  handleSave: () => void;
  saving: boolean;
}

export default function TemplateVariablesSidebar({
  availableVars,
  mode,
  insertVariable,
  handleOpenPreview,
  handleSendTest,
  sendingTest,
  handleSave,
  saving,
}: TemplateVariablesSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Template Variables</h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Click any variable tag below to insert it at the cursor position inside the HTML editor.
        </p>

        <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
          {availableVars.length > 0 ? (
            availableVars.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                disabled={mode === 'default'}
                className="px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-[10px] font-semibold text-gray-700 dark:text-gray-300 font-mono transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={mode === 'default' ? 'Switch to Custom HTML to use variables selector' : `Click to insert {{${v}}}`}
              >
                &#123;&#123;{v}&#125;&#125;
              </button>
            ))
          ) : (
            <span className="text-xs text-gray-400">No variables available</span>
          )}
        </div>

        {mode === 'default' && (
          <p className="text-[10px] text-amber-500 font-semibold bg-amber-50 dark:bg-amber-950/10 p-3 rounded-xl">
            💡 Variable insertion is disabled in Default mode, as placeholders are pre-rendered automatically in the Shopify layout.
          </p>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#e94560]">Test & Confirm</h3>

        <button
          type="button"
          onClick={handleOpenPreview}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>Preview template</span>
        </button>

        <button
          type="button"
          onClick={handleSendTest}
          disabled={sendingTest}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
          <span>{sendingTest ? 'Sending Test...' : 'Send Test Email'}</span>
        </button>

        <div className="border-t border-gray-150 dark:border-gray-800 my-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white hover:opacity-90 px-4 py-3 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
