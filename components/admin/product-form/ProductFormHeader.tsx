'use client';

import React from 'react';
import { Zap, Loader2 } from '@/components/common/Icons';

interface ProductFormHeaderProps {
  name: string;
  aiConfigured: boolean;
  isAiGenerating: boolean;
  onAICopywrite: () => void;
  onShowAiNotice: () => void;
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  name,
  aiConfigured,
  isAiGenerating,
  onAICopywrite,
  onShowAiNotice,
}) => {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/80">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Product Details</h3>
      {name.trim() !== '' && (
        <button
          type="button"
          onClick={aiConfigured ? onAICopywrite : onShowAiNotice}
          disabled={isAiGenerating}
          className={`relative overflow-hidden flex items-center gap-1.5 px-2.5 py-1 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs select-none active:scale-[0.98] ${aiConfigured
              ? isAiGenerating
                ? 'bg-purple-700 bg-linear-to-r from-purple-700 to-indigo-700 disabled:cursor-not-allowed'
                : 'bg-purple-600 bg-linear-to-r from-purple-600 to-indigo-600 hover:bg-purple-700 hover:from-purple-700 hover:to-indigo-700'
              : 'bg-gray-400 hover:bg-gray-500'
            }`}
          title={aiConfigured ? 'Generate AI copy' : 'Enable AI in Settings → AI Copywriter'}
        >
          {isAiGenerating && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] pointer-events-none z-10 bg-inherit">
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              <div className="flex items-center gap-1.5 relative z-10">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </div>
            </div>
          )}
          <div className={`flex items-center gap-1.5 transition-opacity ${isAiGenerating ? 'opacity-0' : 'opacity-100'}`}>
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>AI Generate Copy</span>
          </div>
        </button>
      )}
    </div>
  );
};
