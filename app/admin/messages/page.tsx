'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Trash2, Check } from '@/components/common/Icons';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import {
  getContactMessages,
  setContactMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from '@/lib/services/contact-messages';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
  const { confirm } = useConfirm();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setMessages(await getContactMessages());
    } catch {
      toast.error('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject || '').toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const markRead = async (m: ContactMessage) => {
    if (m.status === 'read') return;
    try {
      await setContactMessageStatus(m.id, 'read');
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: 'read' } : x));
    } catch { toast.error('Failed to update.'); }
  };

  const remove = async (m: ContactMessage) => {
    const ok = await confirm({
      title: 'Delete message?',
      message: `Delete the message from ${m.name}? This cannot be undone from here.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteContactMessage(m.id);
      setMessages(prev => prev.filter(x => x.id !== m.id));
      toast.success('Message deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const unreadCount = messages.filter(m => m.status === 'new').length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#e94560]" />
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Contact Messages</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#e94560] px-2 py-0.5 text-[11px] font-bold text-white">{unreadCount} new</span>
          )}
        </div>
        <div className="w-full sm:w-72">
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search name, email, message..." />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Mail className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700" />
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            {messages.length === 0 ? 'No contact messages yet.' : 'No messages match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 transition-all ${
                m.status === 'new'
                  ? 'border-[#e94560]/30 bg-[#e94560]/[0.03] dark:bg-[#e94560]/[0.06]'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="text-xs text-[#e94560] hover:underline">{m.email}</a>
                    <span className="text-[11px] text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                  {m.subject && <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{m.subject}</p>}
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">{m.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {m.status === 'new' && (
                    <button
                      type="button"
                      onClick={() => markRead(m)}
                      title="Mark as read"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-emerald-500 transition-all cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
