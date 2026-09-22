import React from 'react';
import { Calendar, MessageSquare, Phone, Trash2, Users } from '@/components/common/Icons';
import EmptyState from '@/components/common/EmptyState';
import { WhatsAppSubscriber } from '@/lib/types';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';

interface CustomerLeadsTableProps {
  leads: WhatsAppSubscriber[];
  searchQuery: string;
  onDeleteLead: (id: string) => void;
}

export default function CustomerLeadsTable({
  leads,
  searchQuery,
  onDeleteLead,
}: CustomerLeadsTableProps) {
  const getCleanPhone = (phone: string | null) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  if (leads.length === 0) {
    return (
      <EmptyState 
        icon={<Users className="h-6 w-6 text-gray-300 dark:text-gray-600" />}
        title="No WhatsApp leads found"
        description={searchQuery ? 'Adjust your search query and try again.' : 'Subscribers from the spin wheel and exit popups will appear here.'}
      />
    );
  }

  return (
    <>
      {/* Desktop Leads Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">WhatsApp Phone</th>
              <th className="py-4 px-6">Joined Date</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
            {leads.map(lead => {
              const optInDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
              return (
                <tr key={lead.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{lead.name || 'Anonymous Guest'}</td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono">{lead.phone}</td>
                  <td className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>{optInDate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <a href={`https://wa.me/${cleanWhatsAppPhone(lead.phone)}`} target="_blank" rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Chat on WhatsApp">
                        <MessageSquare className="h-4 w-4" />
                      </a>
                      <a href={`tel:${getCleanPhone(lead.phone)}`}
                        className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Call Lead">
                        <Phone className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onDeleteLead(lead.id)}
                        className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Move Lead to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Leads Cards */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {leads.map(lead => {
          const optInDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
          return (
            <div key={lead.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">{lead.name || 'Anonymous Guest'}</h3>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-0.5">{lead.phone}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-semibold flex-shrink-0 ml-2">
                  <Calendar className="h-3 w-3" />
                  <span>{optInDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                <a href={`https://wa.me/${cleanWhatsAppPhone(lead.phone)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[10px] font-bold transition-all">
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href={`tel:${getCleanPhone(lead.phone)}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white text-[10px] font-bold transition-all">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <button
                  type="button"
                  onClick={() => onDeleteLead(lead.id)}
                  className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                  title="Move to Trash"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
