'use client';

import React, { useState } from 'react';
import { Shield } from '@/components/common/Icons';
import { changeCustomerPassword } from '@/lib/services/customers';
import { toast } from 'sonner';

export function AccountSecurityCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All password fields are required.');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New password and confirmation do not match.');
    }

    try {
      setChangingPassword(true);
      const res = await changeCustomerPassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.error || 'Failed to change password.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Shield className="h-5 w-5 text-[#e94560]" />
        Account Security
      </h2>
      
      <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-gray-100 dark:border-gray-800/80 p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
          Change Password
        </h3>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#e94560] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#e94560] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#e94560] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full py-3 px-4 rounded-xl bg-[#e94560] hover:bg-[#d8344e] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md active:scale-97 cursor-pointer"
          >
            {changingPassword ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
