import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, RefreshCw, Check } from '@/components/common/Icons';

interface PostExApiSettingsProps {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  apiToken: string;
  setApiToken: (val: string) => void;
  mode: string;
  setMode: (val: string) => void;
  testing: boolean;
  testResult: { ok: boolean; message: string } | null;
  onTestLoad: () => void;
}

export default function PostExApiSettings({
  enabled,
  setEnabled,
  apiToken,
  setApiToken,
  mode,
  setMode,
  testing,
  testResult,
  onTestLoad,
}: PostExApiSettingsProps) {
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Enable Toggle */}
      <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Enable PostEx Courier Integration</span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Toggle to activate automated dispatch via PostEx</p>
          </div>
        </label>
      </div>

      {/* Token Validation Deck */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">API Token</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type={showToken ? 'text' : 'password'}
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Paste PostEx API token..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="button"
            onClick={onTestLoad}
            disabled={testing || !apiToken}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
          >
            {testing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Testing...</>
            ) : (
              <><RefreshCw size={16} /> Test & Load</>
            )}
          </button>
        </div>
      </div>

      {/* Error / Success Banner */}
      {testResult && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${testResult.ok ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'}`}>
          {testResult.ok ? (
            <Check className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          <div>
            <p className={`text-sm font-semibold ${testResult.ok ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {testResult.ok ? 'Connection Successful' : 'Validation Failed'}
            </p>
            <p className={`text-xs mt-0.5 ${testResult.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Environment Mode */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Environment Mode</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750/50"
            style={{
              borderColor: mode === 'production' ? '#059669' : '',
              backgroundColor: mode === 'production' ? '#ecfdf5' : '',
            }}
          >
            <input
              type="radio"
              name="postexMode"
              checked={mode === 'production'}
              onChange={() => setMode('production')}
              className="accent-emerald-600 h-4 w-4"
            />
            <div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Production</span>
              <p className="text-[10px] text-gray-400">Live PostEx API</p>
            </div>
          </label>
          <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750/50"
            style={{
              borderColor: mode === 'sandbox' ? '#d97706' : '',
              backgroundColor: mode === 'sandbox' ? '#fffbeb' : '',
            }}
          >
            <input
              type="radio"
              name="postexMode"
              checked={mode === 'sandbox'}
              onChange={() => setMode('sandbox')}
              className="accent-amber-600 h-4 w-4"
            />
            <div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Sandbox</span>
              <p className="text-[10px] text-gray-400">Staging Environment</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
