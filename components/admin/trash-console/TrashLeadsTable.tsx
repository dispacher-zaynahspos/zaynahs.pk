'use client';

import React from 'react';
import { Phone, Mail, RefreshCw, Trash2 } from '@/components/common/Icons';
import EmptyState from '@/components/common/EmptyState';

interface TrashLeadsTableProps {
  leads: any[];
  searchTerm: string;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  handleRestore: (id: string, type: 'leads', extraInfo?: any) => void;
  setConfirmDelete: (val: any) => void;
  isPending: boolean;
}

export const TrashLeadsTable: React.FC<TrashLeadsTableProps> = ({
  leads,
  searchTerm,
  selectedIds,
  toggleSelect,
  handleRestore,
  setConfirmDelete,
  isPending,
}) => {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No trashed leads"
        description={searchTerm ? "No leads matching your search term." : "Your trash bin is clean of subscriber leads."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {leads.map(lead => {
          const isSelected = selectedIds.includes(lead.id);
          return (
            <div
              key={lead.id}
              className={`bg-white dark:bg-[#16162a] p-4 rounded-2xl border shadow-sm flex flex-col space-y-3 transition-colors ${
                isSelected ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/5' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(lead.id)}
                  className="h-4.5 w-4.5 rounded-md border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
                <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800 flex-shrink-0 flex items-center justify-center">
                  {lead.type === 'whatsapp' ? (
                    <Phone className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Mail className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{lead.name}</h4>
                  <p className="text-xs text-gray-500 font-mono truncate">{lead.contact}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-gray-800/50">
                <button
                  onClick={() => handleRestore(lead.id, 'leads', { leadType: lead.type })}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: lead.id, type: 'leads', name: lead.contact, extraInfo: { leadType: lead.type } })}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-gray-850/50">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && leads.every(l => selectedIds.includes(l.id))}
                  onChange={(e) => {
                    if (e.target.checked) toggleSelect(leads[0]?.id);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
              </th>
              <th className="p-4">Lead Type</th>
              <th className="p-4">Name / Info</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Source</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {leads.map(lead => {
              const isSelected = selectedIds.includes(lead.id);
              return (
                <tr key={lead.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors ${isSelected ? 'bg-[#e94560]/5 dark:bg-[#e94560]/5' : ''}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(lead.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-xs uppercase">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                      lead.type === 'whatsapp' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}>
                      {lead.type === 'whatsapp' ? <Phone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                      {lead.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{lead.name}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{lead.contact}</td>
                  <td className="p-4 text-gray-400 text-xs">{lead.source}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleRestore(lead.id, 'leads', { leadType: lead.type })}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: lead.id, type: 'leads', name: lead.contact, extraInfo: { leadType: lead.type } })}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
