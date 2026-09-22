'use client';

import React from 'react';
import { Mail, Calendar, Trash2, Copy } from '@/components/common/Icons';
import { EmailSubscriber } from '@/lib/types';

interface EmailSubscribersTabProps {
  filteredEmailSubs: EmailSubscriber[];
  loading: boolean;
  searchQuery: string;
  handleDeleteEmailSub: (id: string) => void;
  handleCopyEmail: (sub: EmailSubscriber) => void;
}

export default function EmailSubscribersTab({
  filteredEmailSubs,
  loading,
  searchQuery,
  handleDeleteEmailSub,
  handleCopyEmail,
}: EmailSubscribersTabProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden">
      {loading ? (
        <div className="p-6 animate-pulse space-y-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="flex justify-between items-center py-3">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
            </div>
          ))}
        </div>
      ) : filteredEmailSubs.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] border border-gray-100 dark:border-gray-800 mx-auto flex items-center justify-center text-gray-300 dark:text-gray-600">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">No newsletter subscribers yet</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
            {searchQuery ? 'No results for your search.' : 'Customers who subscribe via the footer newsletter form will appear here.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Email Subscribers Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Source</th>
                  <th className="py-4 px-6">Subscribed On</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
                {filteredEmailSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{sub.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400">
                        Newsletter
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          {sub.created_at
                            ? new Date(sub.created_at).toLocaleDateString('en-PK', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`mailto:${sub.email}`}
                          className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Send email"
                        >
                          <Mail className="h-4.5 w-4.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteEmailSub(sub.id)}
                          className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Move to Trash"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleCopyEmail(sub)}
                          className="h-9 w-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer"
                          title="Copy email"
                        >
                          <Copy className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Email Subscribers Cards */}
          <div className="md:hidden space-y-3 p-4">
            {filteredEmailSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white truncate">{sub.email}</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 flex-shrink-0 ml-2">
                    Newsletter
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {sub.created_at
                      ? new Date(sub.created_at).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                  <a
                    href={`mailto:${sub.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white text-[10px] font-bold transition-all"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                  <button
                    onClick={() => handleDeleteEmailSub(sub.id)}
                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                    title="Move to Trash"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopyEmail(sub)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
