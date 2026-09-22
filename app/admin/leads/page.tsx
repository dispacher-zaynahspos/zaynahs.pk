'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Mail, MessageSquare } from '@/components/common/Icons';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { getWhatsAppSubscribers, getEmailSubscribers } from '@/lib/services/sections';
import { WhatsAppSubscriber, EmailSubscriber } from '@/lib/types';
import { toast } from 'sonner';
import { useAdminTab } from '@/lib/hooks/useAdminTab';
import { LeadsStatsGrid, WhatsAppLeadsTab, EmailSubscribersTab } from './components';

type ActiveTab = 'whatsapp' | 'email';

function AdminLeadsPageInner() {
  const { confirm } = useConfirm();
  const [leads, setLeads] = useState<WhatsAppSubscriber[]>([]);
  const [emailSubs, setEmailSubs] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useAdminTab<ActiveTab>('whatsapp');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('today');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'wheel' | 'exit_intent'>('all');

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const [waData, emailData] = await Promise.all([
          getWhatsAppSubscribers(),
          getEmailSubscribers(),
        ]);
        setLeads(waData);
        setEmailSubs(emailData);
      } catch (err) {
        console.error('Failed to load leads:', err);
        toast.error('Failed to load leads.');
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  // Filtered WhatsApp Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (lead.name || '').toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;

      const matchedSource = sourceFilter === 'all' || 
        (lead.source_type || 'wheel') === sourceFilter;
      if (!matchedSource) return false;

      if (timeFilter === 'all') return true;
      if (!lead.created_at) return false;
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (timeFilter === 'today') return leadDate >= startOfToday;
      if (timeFilter === 'yesterday') return leadDate >= startOfYesterday && leadDate < startOfToday;
      if (timeFilter === 'week') return leadDate >= sevenDaysAgo;
      if (timeFilter === 'month') return leadDate >= thirtyDaysAgo;
      return true;
    });
  }, [leads, searchQuery, sourceFilter, timeFilter]);

  // Filtered Email Subscribers
  const filteredEmailSubs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return emailSubs.filter(sub => {
      if (!q) return true;
      return sub.email.toLowerCase().includes(q);
    });
  }, [emailSubs, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let todayCount = 0;
    let wheelCount = 0;
    let exitCount = 0;
    leads.forEach(l => {
      if (l.created_at && new Date(l.created_at) >= startOfToday) todayCount++;
      if ((l.source_type || 'wheel') === 'wheel') wheelCount++;
      else if (l.source_type === 'exit_intent') exitCount++;
    });
    return { total: leads.length, today: todayCount, wheel: wheelCount, exit: exitCount };
  }, [leads]);

  const getCleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const handleCopyLead = (lead: WhatsAppSubscriber) => {
    const text = `Name: ${lead.name || 'N/A'}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'N/A'}\nSource: ${lead.source_type || 'wheel'}`;
    navigator.clipboard.writeText(text);
    toast.success('Lead details copied!');
  };

  const handleCopyEmail = (sub: EmailSubscriber) => {
    navigator.clipboard.writeText(sub.email);
    toast.success('Email copied!');
  };

  const handleDeleteWhatsAppLead = async (id: string) => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this WhatsApp lead to Trash?',
      variant: 'danger',
      confirmText: 'Move to Trash'
    });
    if (!confirmed) return;
    try {
      const { deleteWhatsAppSubscriber } = await import('@/lib/services/sections');
      await deleteWhatsAppSubscriber(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('WhatsApp lead moved to Trash');
    } catch {
      toast.error('Failed to move WhatsApp lead to Trash');
    }
  };

  const handleDeleteEmailSub = async (id: string) => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this email subscriber to Trash?',
      variant: 'danger',
      confirmText: 'Move to Trash'
    });
    if (!confirmed) return;
    try {
      const { deleteEmailSubscriber } = await import('@/lib/services/sections');
      await deleteEmailSubscriber(id);
      setEmailSubs(prev => prev.filter(s => s.id !== id));
      toast.success('Email subscriber moved to Trash');
    } catch {
      toast.error('Failed to move email subscriber to Trash');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Leads & Subscribers</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            WhatsApp leads from Spin Wheel / Exit Intent + Newsletter email subscribers
          </p>
        </div>
        <AdminSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search name, phone, email..."
          className="md:w-80"
        />
      </div>

      {/* Stats Cards */}
      <LeadsStatsGrid stats={stats} emailSubsCount={emailSubs.length} />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#0f0f1b] p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          WhatsApp Leads ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'email'
              ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Newsletter ({emailSubs.length})
        </button>
      </div>

      {/* WhatsApp Leads Tab */}
      {activeTab === 'whatsapp' && (
        <WhatsAppLeadsTab
          filteredLeads={filteredLeads}
          loading={loading}
          searchQuery={searchQuery}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          handleDeleteWhatsAppLead={handleDeleteWhatsAppLead}
          handleCopyLead={handleCopyLead}
          getCleanPhone={getCleanPhone}
        />
      )}

      {/* Newsletter Email Subscribers Tab */}
      {activeTab === 'email' && (
        <EmailSubscribersTab
          filteredEmailSubs={filteredEmailSubs}
          loading={loading}
          searchQuery={searchQuery}
          handleDeleteEmailSub={handleDeleteEmailSub}
          handleCopyEmail={handleCopyEmail}
        />
      )}
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
      <AdminLeadsPageInner />
    </Suspense>
  );
}
