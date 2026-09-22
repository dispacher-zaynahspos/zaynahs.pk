import React from 'react';

interface PostExSyncRulesProps {
  productCheck: string;
  setProductCheck: (val: string) => void;
  skuCheck: string;
  setSkuCheck: (val: string) => void;
  weightCheck: string;
  setWeightCheck: (val: string) => void;
  piecesCheck: string;
  setPiecesCheck: (val: string) => void;
  codCheck: string;
  setCodCheck: (val: string) => void;
  notesCheck: string;
  setNotesCheck: (val: string) => void;
  autoDownloadLabel: boolean;
  setAutoDownloadLabel: (val: boolean) => void;
}

export default function PostExSyncRules({
  productCheck,
  setProductCheck,
  skuCheck,
  setSkuCheck,
  weightCheck,
  setWeightCheck,
  piecesCheck,
  setPiecesCheck,
  codCheck,
  setCodCheck,
  notesCheck,
  setNotesCheck,
  autoDownloadLabel,
  setAutoDownloadLabel,
}: PostExSyncRulesProps) {
  return (
    <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Sync & Print Rules</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={productCheck === '1'}
            onChange={(e) => setProductCheck(e.target.checked ? '1' : '0')}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Print Item Name in Label</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Include parsed details on shipment invoice</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={skuCheck === '1'}
            onChange={(e) => setSkuCheck(e.target.checked ? '1' : '0')}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Print SKU Name in Label</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Append items' unique code to shipping labels</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={weightCheck === '1'}
            onChange={(e) => setWeightCheck(e.target.checked ? '1' : '0')}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Auto Calculate Weight</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Use order item weight or fall back to default</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={piecesCheck === '1'}
            onChange={(e) => setPiecesCheck(e.target.checked ? '1' : '0')}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Auto Calculate Pieces</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Extract quantity automatically or use defaults</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={codCheck === '1'}
            onChange={(e) => setCodCheck(e.target.checked ? '1' : '0')}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Calculate Non-COD (Prepaid) as Zero</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Set booking amount to 0 for prepaid/advance paid orders</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={notesCheck === '1'}
            onChange={(e) => setNotesCheck(e.target.checked ? '1' : '0')}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Print Order Notes in Remarks</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Combine custom customer notes with default remarks</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            type="checkbox"
            checked={autoDownloadLabel}
            onChange={(e) => setAutoDownloadLabel(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Auto-Download Shipping Label PDF After Fulfillment</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">When enabled, a browser download trigger launches for postex-labels.pdf on booking success</p>
          </div>
        </label>
      </div>
    </div>
  );
}
