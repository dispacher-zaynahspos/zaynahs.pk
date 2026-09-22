import React from 'react';
import { Upload, PackageOpen, FileUp, Loader2 } from '@/components/common/Icons';

interface ImportProgressLog {
  productName: string;
  status: 'skipped' | 'overwritten' | 'imported' | 'error';
  message?: string;
  error?: string;
}

interface ImportTabContentProps {
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  importMeta: {
    version: string;
    storeName: string;
    productCount: number;
    exportedAt: string;
  } | null;
  setImportMeta: (meta: any) => void;
  conflictStrategy: 'skip' | 'overwrite' | 'rename';
  setConflictStrategy: (val: 'skip' | 'overwrite' | 'rename') => void;
  isImporting: boolean;
  importProgress: { current: number; total: number } | null;
  importLogs: ImportProgressLog[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleImport: () => void;
  handleImportClose: () => void;
  onClose: () => void;
}

export default function ImportTabContent({
  importFile,
  setImportFile,
  importMeta,
  setImportMeta,
  conflictStrategy,
  setConflictStrategy,
  isImporting,
  importProgress,
  importLogs,
  fileInputRef,
  handleFileChange,
  handleDragOver,
  handleDrop,
  handleImport,
  handleImportClose,
  onClose,
}: ImportTabContentProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      {!importFile ? (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#e94560] dark:hover:border-[#e94560] transition-colors rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer bg-gray-50/50 dark:bg-gray-900/10"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Drag and drop your export JSON here
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Select a previously downloaded <code className="text-[#e94560] font-mono">*.zaynah-export.json</code> file to import products and catalog content.
          </p>
          <button type="button" className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">
            Browse Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      ) : (
        /* File Overview and Import Form */
        <div className="flex-1 flex flex-col gap-6">
          {/* File Metadata Overview */}
          <div className="bg-gray-50 dark:bg-[#16162a] border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-[#e94560] rounded-xl">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {importFile.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Products: <strong className="text-gray-800 dark:text-white">{importMeta?.productCount}</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="text-gray-800 dark:text-white">{importMeta?.storeName}</strong></span>
                  <span>•</span>
                  <span>Exported: <strong className="text-gray-800 dark:text-white">{importMeta?.exportedAt}</strong></span>
                </p>
              </div>
            </div>
            {!isImporting && (
              <button
                type="button"
                onClick={() => {
                  setImportFile(null);
                  setImportMeta(null);
                }}
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Settings / Options */}
          {!isImporting && importLogs.length === 0 && (
            <div className="flex flex-col gap-4 bg-gray-50/20 dark:bg-[#14142a]/10 border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Import Configuration</h4>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Conflict Strategy (If product slug already exists):
                </label>
                <select
                  value={conflictStrategy}
                  onChange={e => setConflictStrategy(e.target.value as 'skip' | 'overwrite' | 'rename')}
                  className="px-3 py-2 text-sm bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e94560] dark:text-white w-full max-w-sm"
                >
                  <option value="skip">Skip existing products</option>
                  <option value="overwrite">Overwrite existing products (Replace variations/images)</option>
                  <option value="rename">Import as copies (Rename conflicts)</option>
                </select>
              </div>
            </div>
          )}

          {/* Progress logs & streaming outputs */}
          {(isImporting || importLogs.length > 0) && (
            <div className="flex-1 flex flex-col border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/10 dark:bg-gray-900/10">
              {/* Progress header & bar */}
              {importProgress && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <span>Importing Products</span>
                    <span>
                      {importProgress.current} / {importProgress.total} ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#e94560] h-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Logs scrolling panel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs max-h-56">
                {importLogs.map((log, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      log.status === 'error'
                        ? 'bg-red-50/50 dark:bg-red-950/10 text-red-600 dark:text-red-400'
                        : log.status === 'skipped'
                        ? 'bg-amber-50/50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400'
                        : 'bg-green-50/50 dark:bg-green-950/10 text-green-600 dark:text-green-400'
                    }`}
                  >
                    <span className="font-semibold uppercase text-[10px] tracking-wide px-1.5 py-0.5 rounded border border-current">
                      {log.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{log.productName}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {log.status === 'error' ? log.error : log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800/80 pt-4">
            {importLogs.length > 0 && !isImporting ? (
              <button
                type="button"
                onClick={handleImportClose}
                className="bg-[#e94560] hover:bg-[#d63d56] text-white font-semibold text-sm rounded-xl px-6 py-2 transition-all cursor-pointer"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex items-center gap-2 bg-[#e94560] hover:bg-[#d63d56] text-white font-semibold text-sm rounded-xl px-5 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Start Import
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
