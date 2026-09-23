import React from 'react';
import { Calendar, ShoppingBag, Trash2, MessageSquare, Phone, Mail, Users } from '@/components/common/Icons';
import EmptyState from '@/components/common/EmptyState';
import { formatPrice, cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { CustomerRecord } from './types';

interface CustomerBuyersTableProps {
  customers: CustomerRecord[];
  searchQuery: string;
  onViewOrders: (customer: CustomerRecord) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CustomerBuyersTable({
  customers,
  searchQuery,
  onViewOrders,
  onDeleteCustomer,
}: CustomerBuyersTableProps) {
  const getCleanPhone = (phone: string | null) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  if (customers.length === 0) {
    return (
      <EmptyState 
        icon={<Users className="h-6 w-6 text-gray-300 dark:text-gray-600" />}
        title="No customers found"
        description={searchQuery ? 'Adjust your search query and try again.' : 'Registered customer profiles will appear here.'}
      />
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/10 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <th className="py-2.5 px-3 md:px-4">Customer Info</th>
              <th className="py-2.5 px-3 md:px-4">Joined</th>
              <th className="py-2.5 px-3 md:px-4 text-center">Orders</th>
              <th className="py-2.5 px-3 md:px-4 text-right">Lifetime Spent</th>
              <th className="py-2.5 px-3 md:px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
            {customers.map(customer => {
              const joinDate = new Date(customer.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
              return (
                <tr key={customer.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 md:px-4">
                    <div className="font-bold text-gray-950 dark:text-white text-sm">{customer.name}</div>
                    <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                      {customer.email && <span>{customer.email}</span>}
                      {customer.phone && <span>{customer.phone}</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 md:px-4 font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>{joinDate}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 md:px-4 text-center font-bold text-gray-900 dark:text-white">
                    {customer.ordersCount}
                  </td>
                  <td className="py-2.5 px-3 md:px-4 text-right font-black text-gray-950 dark:text-white whitespace-nowrap">
                    {formatPrice(customer.totalSpent)}
                  </td>
                  <td className="py-2.5 px-3 md:px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewOrders(customer)}
                        className="h-8 w-8 rounded-lg bg-[#e94560]/10 text-[#e94560] hover:bg-[#e94560] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title="View Orders"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCustomer(customer.id)}
                        className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Move Customer to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {customer.phone ? (
                        <a href={`https://wa.me/${cleanWhatsAppPhone(customer.phone)}`} target="_blank" rel="noopener noreferrer"
                          className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Chat on WhatsApp">
                          <MessageSquare className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center cursor-not-allowed">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      )}
                      {customer.phone ? (
                        <a href={`tel:${getCleanPhone(customer.phone)}`}
                          className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Call">
                          <Phone className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center cursor-not-allowed">
                          <Phone className="h-4 w-4" />
                        </div>
                      )}
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`}
                          className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                          title="Send Email">
                          <Mail className="h-4 w-4" />
                        </a>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center cursor-not-allowed">
                          <Mail className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {customers.map(customer => {
          const joinDate = new Date(customer.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
          return (
            <div key={customer.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-gray-950 dark:text-white truncate">{customer.name}</h3>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 space-y-0.5">
                    {customer.email && <p className="truncate">{customer.email}</p>}
                    {customer.phone && <p>{customer.phone}</p>}
                  </div>
                </div>
                <span className="text-xs font-black text-gray-950 dark:text-white flex-shrink-0 ml-2">{formatPrice(customer.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{joinDate}</span>
                </div>
                <span>{customer.ordersCount} order{customer.ordersCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                <button
                  type="button"
                  onClick={() => onViewOrders(customer)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#e94560]/10 text-[#e94560] hover:bg-[#e94560] hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Orders
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCustomer(customer.id)}
                  className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                  title="Move to Trash"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {customer.phone ? (
                  <a href={`https://wa.me/${cleanWhatsAppPhone(customer.phone)}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[10px] font-bold transition-all">
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 text-[10px] font-bold cursor-not-allowed">
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </div>
                )}
                {customer.email ? (
                  <a href={`mailto:${customer.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white text-[10px] font-bold transition-all">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 text-[10px] font-bold cursor-not-allowed">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
