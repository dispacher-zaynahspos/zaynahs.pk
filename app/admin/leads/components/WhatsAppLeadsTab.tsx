'use client';

import React from 'react';
import { 
  MessageSquare, Mail, Phone, Calendar, Zap, ArrowUpRight, SlidersHorizontal, Trash2, Copy
} from '@/components/common/Icons';
import EmptyState from '@/components/common/EmptyState';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { WhatsAppSubscriber } from '@/lib/types';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';

interface WhatsAppLeadsTabProps {
  filteredLeads: WhatsAppSubscriber[];
  loading: boolean;
  searchQuery: string;
  timeFilter: 'all' | 'today' | 'yesterday' | 'week' | 'month';
  setTimeFilter: (val: any) => void;
  sourceFilter: 'all' | 'wheel' | 'exit_intent';
  setSourceFilter: (val: 'all' | 'wheel' | 'exit_intent') => void;
  handleDeleteWhatsAppLead: (id: string) => void;
  handleCopyLead: (lead: WhatsAppSubscriber) => void;
  getCleanPhone: (phone: string) => string;
}

export default function WhatsAppLeadsTab({
  filteredLeads,
  loading,
  searchQuery,
  timeFilter,
  setTimeFilter,
  sourceFilter,
  setSourceFilter,
  handleDeleteWhatsAppLead,
  handleCopyLead,
  getCleanPhone,
}: WhatsAppLeadsTabProps) {
  const getWhatsAppURL = (lead: WhatsAppSubscriber) => {
    const phone = cleanWhatsAppPhone(lead.phone);
    const greeting = lead.name ? `Dear ${lead.name}` : 'Hello';
    const message = `${greeting}, thank you for subscribing at Zaynah's E-Store! We noticed you claimed a special coupon on our store. Let us know if you need any assistance placing your order.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters:</span>
        </div>
        <AdminDateFilter
          value={timeFilter}
          onChange={(val: any) => setTimeFilter(val)}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'week', label: 'Last 7 Days' },
            { value: 'month', label: 'Last 30 Days' },
          ]}
        />
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          {(['all', 'wheel', 'exit_intent'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === s
                  ? 'bg-[#1a1a2e] dark:bg-amber-600 text-white'
                  : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
              }`}
            >
              {s === 'all' ? 'All Sources' : s === 'wheel' ? 'Spin Wheel' : 'Exit Popup'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 animate-pulse space-y-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex justify-between items-center py-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-24" />
              </div>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6 text-gray-300 dark:text-gray-600" />}
            title="No subscriber leads found"
            description={
              searchQuery || sourceFilter !== 'all' || timeFilter !== 'all'
                ? 'Adjust your filters or search terms.'
                : 'Subscriber details from Spin Wheel and Exit Popup will display here.'
            }
          />
        ) : (
          <>
            {/* Desktop WhatsApp Leads Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    <th className="py-4 px-6">Subscriber</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Source</th>
                    <th className="py-4 px-6">Opt-In Date</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {filteredLeads.map((lead) => {
                    const optInDate = lead.created_at
                      ? new Date(lead.created_at).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-';
                    const isWheel = (lead.source_type || 'wheel') === 'wheel';
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-950 dark:text-white text-sm">
                            {lead.name || 'Anonymous Guest'}
                          </div>
                          {lead.email ? (
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{lead.email}</span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-gray-400 dark:text-gray-600 italic block mt-0.5">
                              No email provided
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-gray-900 dark:text-gray-300 text-sm">
                          {lead.phone}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isWheel
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {isWheel ? <Zap className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {isWheel ? 'Spin Wheel' : 'Exit Popup'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{optInDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={getWhatsAppURL(lead)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title="Open WhatsApp chat"
                            >
                              <MessageSquare className="h-4.5 w-4.5" />
                            </a>
                            <a
                              href={`tel:${getCleanPhone(lead.phone)}`}
                              className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title="Call"
                            >
                              <Phone className="h-4.5 w-4.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteWhatsAppLead(lead.id)}
                              className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title="Move to Trash"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleCopyLead(lead)}
                              className="h-9 w-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer"
                              title="Copy"
                            >
                              <Copy className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile WhatsApp Leads Cards */}
            <div className="md:hidden space-y-3 p-4">
              {filteredLeads.map((lead) => {
                const optInDate = lead.created_at
                  ? new Date(lead.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-';
                const isWheel = (lead.source_type || 'wheel') === 'wheel';
                return (
                  <div
                    key={lead.id}
                    className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">
                          {lead.name || 'Anonymous Guest'}
                        </h3>
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-0.5">{lead.phone}</p>
                        {lead.email && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{lead.email}</p>}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0 ml-2 ${
                          isWheel
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {isWheel ? 'Wheel' : 'Exit'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                      <Calendar className="h-3 w-3" />
                      <span>{optInDate}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <a
                        href={getWhatsAppURL(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[10px] font-bold transition-all"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                      <a
                        href={`tel:${getCleanPhone(lead.phone)}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white text-[10px] font-bold transition-all"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                      <button
                        onClick={() => handleDeleteWhatsAppLead(lead.id)}
                        className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyLead(lead)}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold transition-all"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
