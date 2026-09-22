'use client';

import React from 'react';
import { Truck, Loader2, Plus, Edit2, Trash2, Check, X, GripVertical, ChevronUp, ChevronDown } from '@/components/common/Icons';
import { ShippingMethod } from '@/lib/types';

interface ShippingMethodsCardProps {
  shippingMethods: ShippingMethod[];
  loadingLists: boolean;
  editingShipId: string | null;
  setEditingShipId: (v: string | null) => void;
  editShipName: string;
  setEditShipName: (v: string) => void;
  editShipCost: string;
  setEditShipCost: (v: string) => void;
  editShipDays: string;
  setEditShipDays: (v: string) => void;
  newShipName: string;
  setNewShipName: (v: string) => void;
  newShipCost: string;
  setNewShipCost: (v: string) => void;
  newShipDays: string;
  setNewShipDays: (v: string) => void;
  handleAddShipping: (e: React.FormEvent) => void;
  handleToggleShippingActive: (id: string, currentActive: boolean) => void;
  startEditShipping: (method: ShippingMethod) => void;
  handleSaveShippingEdit: (id: string) => void;
  handleDeleteShipping: (id: string) => void;
  handleMove: (list: 'shipping' | 'payment', index: number, direction: 'up' | 'down') => void;
  handleDragStart: (id: string) => void;
  handleDragOver: (id: string) => void;
  handleDrop: (list: 'shipping' | 'payment') => void;
  dragOverItemId: string | null;
}

export default function ShippingMethodsCard({
  shippingMethods,
  loadingLists,
  editingShipId,
  setEditingShipId,
  editShipName,
  setEditShipName,
  editShipCost,
  setEditShipCost,
  editShipDays,
  setEditShipDays,
  newShipName,
  setNewShipName,
  newShipCost,
  setNewShipCost,
  newShipDays,
  setNewShipDays,
  handleAddShipping,
  handleToggleShippingActive,
  startEditShipping,
  handleSaveShippingEdit,
  handleDeleteShipping,
  handleMove,
  handleDragStart,
  handleDragOver,
  handleDrop,
  dragOverItemId,
}: ShippingMethodsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-[#e94560]" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Shipping Methods</h3>
      </div>

      {loadingLists ? (
        <div className="flex items-center justify-center py-6 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-xs font-bold">Loading shipping methods...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List */}
          <div className="space-y-2">
            {shippingMethods.map((method, idx) => (
              <div
                key={method.id}
                draggable={editingShipId !== method.id}
                onDragStart={() => handleDragStart(method.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(method.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop('shipping');
                }}
                className={`p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/30 flex items-center justify-between gap-2 text-sm transition-shadow ${
                  dragOverItemId === method.id ? 'ring-2 ring-[#e94560]' : ''
                }`}
              >
                {editingShipId === method.id ? (
                  /* Editing Row */
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editShipName}
                      onChange={(e) => setEditShipName(e.target.value)}
                      placeholder="Name (e.g. Express Delivery)"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={editShipCost}
                        onChange={(e) => setEditShipCost(e.target.value)}
                        placeholder="Cost (Rs.)"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editShipDays}
                        onChange={(e) => setEditShipDays(e.target.value)}
                        placeholder="Estimated Days (e.g. 1-2 days)"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveShippingEdit(method.id)}
                        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingShipId(null)}
                        className="p-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Row */
                  <>
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove('shipping', idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-grab active:cursor-grabbing touch-none"
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove('shipping', idx, 'down')}
                        disabled={idx === shippingMethods.length - 1}
                        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 dark:text-gray-200 truncate">{method.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                        Cost: Rs. {method.cost.toLocaleString()}{' '}
                        {method.estimatedDays ? `| ${method.estimatedDays}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Active Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={method.active}
                          onChange={() => handleToggleShippingActive(method.id, method.active)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                      </label>
                      <button
                        type="button"
                        onClick={() => startEditShipping(method)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShipping(method.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {shippingMethods.length === 0 && (
              <div className="text-center py-6 text-xs italic text-gray-400">
                No shipping methods defined. Add one below!
              </div>
            )}
          </div>

          {/* Add form */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Add New Shipping Method
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Method Name (e.g. Standard Delivery)"
                value={newShipName}
                onChange={(e) => setNewShipName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
              <input
                type="number"
                placeholder="Cost in Rs. (e.g. 200)"
                value={newShipCost}
                onChange={(e) => setNewShipCost(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
              <input
                type="text"
                placeholder="Estimated Days (e.g. 3-5 business days)"
                value={newShipDays}
                onChange={(e) => setNewShipDays(e.target.value)}
                className="w-full sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
            </div>
            <button
              type="button"
              onClick={handleAddShipping}
              className="flex items-center justify-center gap-1.5 w-full bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Shipping Method</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
