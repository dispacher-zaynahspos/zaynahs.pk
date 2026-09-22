'use client';

import React from 'react';
import { CreditCard, Loader2, Plus, Edit2, Trash2, Check, X, GripVertical, ChevronUp, ChevronDown } from '@/components/common/Icons';
import { PaymentMethod } from '@/lib/types';

interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethod[];
  loadingLists: boolean;
  editingPayId: string | null;
  setEditingPayId: (v: string | null) => void;
  editPayName: string;
  setEditPayName: (v: string) => void;
  editPayCode: string;
  setEditPayCode: (v: string) => void;
  editPayInstructions: string;
  setEditPayInstructions: (v: string) => void;
  newPayName: string;
  setNewPayName: (v: string) => void;
  newPayCode: string;
  setNewPayCode: (v: string) => void;
  newPayInstructions: string;
  setNewPayInstructions: (v: string) => void;
  handleAddPayment: (e: React.FormEvent) => void;
  handleTogglePaymentActive: (id: string, currentActive: boolean) => void;
  startEditPayment: (method: PaymentMethod) => void;
  handleSavePaymentEdit: (id: string) => void;
  handleDeletePayment: (id: string) => void;
  handleMove: (list: 'shipping' | 'payment', index: number, direction: 'up' | 'down') => void;
  handleDragStart: (id: string) => void;
  handleDragOver: (id: string) => void;
  handleDrop: (list: 'shipping' | 'payment') => void;
  dragOverItemId: string | null;
}

export default function PaymentMethodsCard({
  paymentMethods,
  loadingLists,
  editingPayId,
  setEditingPayId,
  editPayName,
  setEditPayName,
  editPayCode,
  setEditPayCode,
  editPayInstructions,
  setEditPayInstructions,
  newPayName,
  setNewPayName,
  newPayCode,
  setNewPayCode,
  newPayInstructions,
  setNewPayInstructions,
  handleAddPayment,
  handleTogglePaymentActive,
  startEditPayment,
  handleSavePaymentEdit,
  handleDeletePayment,
  handleMove,
  handleDragStart,
  handleDragOver,
  handleDrop,
  dragOverItemId,
}: PaymentMethodsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-[#e94560]" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Methods & Badges</h3>
      </div>

      {loadingLists ? (
        <div className="flex items-center justify-center py-6 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-xs font-bold">Loading payment methods...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List */}
          <div className="space-y-2">
            {paymentMethods.map((method, idx) => (
              <div
                key={method.id}
                draggable={editingPayId !== method.id}
                onDragStart={() => handleDragStart(method.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(method.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop('payment');
                }}
                className={`p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/30 flex items-center justify-between gap-2 text-sm transition-shadow ${
                  dragOverItemId === method.id ? 'ring-2 ring-[#e94560]' : ''
                }`}
              >
                {editingPayId === method.id ? (
                  /* Editing Row */
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editPayName}
                      onChange={(e) => setEditPayName(e.target.value)}
                      placeholder="Name (e.g. Visa)"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
                    />
                    <select
                      value={editPayCode}
                      onChange={(e) => setEditPayCode(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-950 dark:text-white focus:outline-none"
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">MasterCard</option>
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="banktransfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="amex">AMEX</option>
                      <option value="klarna">Klarna</option>
                      <option value="cirrus">Cirrus</option>
                      <option value="westernunion">Western Union</option>
                      <option value="custom">Custom Badge (Text only)</option>
                    </select>
                    <textarea
                      value={editPayInstructions}
                      onChange={(e) => setEditPayInstructions(e.target.value)}
                      placeholder="Instructions (e.g. Bank Account details or EasyPaisa info)"
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSavePaymentEdit(method.id)}
                        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPayId(null)}
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
                        onClick={() => handleMove('payment', idx, 'up')}
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
                        onClick={() => handleMove('payment', idx, 'down')}
                        disabled={idx === paymentMethods.length - 1}
                        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 dark:text-gray-200 truncate">{method.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5 uppercase">
                        Badge Code: {method.code}
                      </div>
                      {method.instructions && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 border-t border-gray-100 dark:border-gray-800/50 pt-1 italic whitespace-pre-line">
                          {method.instructions}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Active Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={method.active}
                          onChange={() => handleTogglePaymentActive(method.id, method.active)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
                      </label>
                      <button
                        type="button"
                        onClick={() => startEditPayment(method)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePayment(method.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {paymentMethods.length === 0 && (
              <div className="text-center py-6 text-xs italic text-gray-400">
                No payment methods defined. Add one below!
              </div>
            )}
          </div>

          {/* Add form */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Add New Payment Method
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Method Name (e.g. EasyPaisa)"
                value={newPayName}
                onChange={(e) => setNewPayName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
              <select
                value={newPayCode}
                onChange={(e) => setNewPayCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-950 dark:text-white focus:outline-none focus:border-[#e94560]"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">MasterCard</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="banktransfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="amex">AMEX</option>
                <option value="klarna">Klarna</option>
                <option value="cirrus">Cirrus</option>
                <option value="westernunion">Western Union</option>
                <option value="custom">Custom Badge (Text only)</option>
              </select>
              <textarea
                placeholder="Payment Instructions (e.g. Account No, Bank Name, Account Title)"
                value={newPayInstructions}
                onChange={(e) => setNewPayInstructions(e.target.value)}
                rows={2}
                className="w-full sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] resize-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddPayment}
              className="flex items-center justify-center gap-1.5 w-full bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Payment Method</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
