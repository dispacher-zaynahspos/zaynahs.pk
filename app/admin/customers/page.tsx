'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { getAdminCustomers } from '@/lib/services/customers';
import { getWhatsAppSubscribers } from '@/lib/services/sections';
import { getOrdersByCustomerId } from '@/lib/services/orders';
import { Order, WhatsAppSubscriber } from '@/lib/types';
import { toast } from 'sonner';
import { useAdminTab } from '@/lib/hooks/useAdminTab';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import {
  CustomerRecord,
  CustomerStats,
  CustomerBuyersTable,
  CustomerLeadsTable,
  CustomerOrdersModal,
} from './components';

function AdminCustomersPageInner() {
  const { confirm } = useConfirm();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [leads, setLeads] = useState<WhatsAppSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useAdminTab<'buyers' | 'leads'>('buyers');

  // Customer Orders Modal state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [buyersData, leadsData] = await Promise.all([
          getAdminCustomers(),
          getWhatsAppSubscribers()
        ]);
        setCustomers(buyersData);
        setLeads(leadsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load customer or leads data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewOrders = async (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setExpandedOrderId(null);
    setOrdersLoading(true);
    try {
      const orders = await getOrdersByCustomerId(customer.id);
      setCustomerOrders(orders);
    } catch {
      toast.error('Failed to load orders for this customer.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setExpandedOrderId(null);
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this customer to Trash?',
      variant: 'danger',
      confirmText: 'Move to Trash'
    });
    if (!confirmed) return;
    try {
      const { deleteCustomer } = await import('@/lib/services/customers');
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Customer moved to Trash');
    } catch {
      toast.error('Failed to move customer to Trash');
    }
  };

  const handleDeleteLead = async (id: string) => {
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

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(l => 
      (l.name || '').toLowerCase().includes(q) ||
      (l.phone || '').toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const stats = useMemo(() => {
    const total = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = total > 0 ? totalSpent / total : 0;
    const totalOrders = customers.reduce((sum, c) => sum + c.ordersCount, 0);
    return { total, totalSpent, avgSpent, totalOrders };
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Customers Directory</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage and contact your e-store customers</p>
        </div>
        <AdminSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search name, phone, email..."
          className="md:w-80"
        />
      </div>

      {/* Stats row */}
      <CustomerStats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button type="button" onClick={() => setActiveTab('buyers')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'buyers' ? 'border-[#e94560] text-[#e94560]' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          Registered Buyers ({customers.length})
        </button>
        <button type="button" onClick={() => setActiveTab('leads')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${activeTab === 'leads' ? 'border-[#e94560] text-[#e94560]' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          WhatsApp Leads ({leads.length})
        </button>
      </div>

      {/* Main List Panel */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800 animate-pulse space-y-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : activeTab === 'buyers' ? (
          <CustomerBuyersTable
            customers={filteredCustomers}
            searchQuery={searchQuery}
            onViewOrders={handleViewOrders}
            onDeleteCustomer={handleDeleteCustomer}
          />
        ) : (
          <CustomerLeadsTable
            leads={filteredLeads}
            searchQuery={searchQuery}
            onDeleteLead={handleDeleteLead}
          />
        )}
      </div>

      {/* CUSTOMER ORDERS MODAL */}
      {selectedCustomer && (
        <CustomerOrdersModal
          selectedCustomer={selectedCustomer}
          customerOrders={customerOrders}
          ordersLoading={ordersLoading}
          expandedOrderId={expandedOrderId}
          setExpandedOrderId={setExpandedOrderId}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <Suspense>
      <AdminCustomersPageInner />
    </Suspense>
  );
}
