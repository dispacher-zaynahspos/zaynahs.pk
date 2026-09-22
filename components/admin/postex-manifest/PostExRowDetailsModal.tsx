'use client';

import React, { useState } from 'react';
import { StoreSettings } from '@/lib/types';
import { X, Save } from '@/components/common/Icons';
import { ManifestOrder, EditableRow } from './types';

interface PostExRowDetailsModalProps {
  order: ManifestOrder;
  row: EditableRow;
  settings: StoreSettings;
  onClose: () => void;
  onSave: (updates: Partial<EditableRow>) => void;
}

export default function PostExRowDetailsModal({
  order,
  row,
  settings,
  onClose,
  onSave,
}: PostExRowDetailsModalProps) {
  const [form, setForm] = useState({
    shipmentType: row.shipmentType,
    fragile: row.fragile,
    pieces: row.pieces,
    remarks: row.remarks,
    invoiceDivision: row.invoiceDivision,
    paymentMethod: row.paymentMethod,
    productDetail: row.productDetail,
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#16162a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Order {order.orderNumber} Details
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Advanced shipping specifications</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Shipment Type</label>
            <select
              value={form.shipmentType}
              onChange={(e) => setForm(f => ({ ...f, shipmentType: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="Normal">Normal</option>
              <option value="Reversed">Reversed</option>
              <option value="Replacement">Replacement</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Fragile</label>
            <select
              value={form.fragile}
              onChange={(e) => setForm(f => ({ ...f, fragile: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Invoice Division</label>
              <input
                type="number"
                value={form.invoiceDivision}
                onChange={(e) => setForm(f => ({ ...f, invoiceDivision: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pieces</label>
              <input
                type="number"
                value={form.pieces}
                onChange={(e) => setForm(f => ({ ...f, pieces: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))}
              rows={2}
              placeholder="if the number is unavailable please reach on whatsapp"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Products</label>
            <input
              type="text"
              value={form.productDetail}
              onChange={(e) => setForm(f => ({ ...f, productDetail: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Payment Method</label>
            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
              {form.paymentMethod}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => onSave(form)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            Save Details Change State
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
