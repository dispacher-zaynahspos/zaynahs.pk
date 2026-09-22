'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, LogOut } from '@/components/common/Icons';
import { customerLogout } from '@/lib/services/customers';
import { Order } from '@/lib/types';
import { toast } from 'sonner';
import { AccountOrdersList } from './account/AccountOrdersList';
import { AccountSecurityCard } from './account/AccountSecurityCard';

interface AccountDashboardProps {
  profile: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  orders: Order[];
}

export default function AccountDashboard({ profile, orders }: AccountDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const res = await customerLogout();
      if (res.success) {
        toast.success('Logged out successfully');
        router.push('/');
        router.refresh();
      } else {
        toast.error('Logout failed');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1b] py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Profile Details Header Card */}
        <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-gray-100 dark:border-gray-800/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/20 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                {profile.name}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">Customer Profile Account</p>
            </div>
          </div>

          {/* Contact Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {profile.email && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {profile.phone}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-900/30 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Multi-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <AccountOrdersList orders={orders} />
          <AccountSecurityCard />
        </div>

      </div>
    </div>
  );
}
