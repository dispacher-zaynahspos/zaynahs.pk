'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogOut, Shield, User, Eye, EyeOff, CheckCircle } from '@/components/common/Icons';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { SettingsTabBar } from '@/components/admin/settings-form/SettingsTabBar';

export default function ProfileSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success(
        'Password changed! You have been logged out from all devices. Redirecting to login...',
        { duration: 5000 }
      );

      // Clear local state and redirect to login
      setTimeout(() => {
        router.push('/admin/login');
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (err) {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Profile & Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            Manage your admin account credentials, sessions, and security
          </p>
        </div>
      </div>

      {/* 🌟 Unified Top Navigation Tab Bar */}
      <SettingsTabBar activeTab="profile" />

      {/* Responsive 2-Column SaaS Grid (Zero dead space on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Change Password (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/60 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary,#C2185B)]/10 text-[var(--color-primary,#C2185B)] flex-shrink-0">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">
                Change Admin Password
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Updating your password will automatically sign you out of all other active sessions
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 h-10 pl-10 pr-10 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[var(--color-primary,#C2185B)] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 h-10 pl-10 pr-10 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[var(--color-primary,#C2185B)] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 h-10 pl-10 pr-10 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[var(--color-primary,#C2185B)] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-white px-5 h-9 text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>

              <Link
                href="/admin/forgot-password"
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary,#C2185B)] transition-colors underline underline-offset-2"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Account Snapshot & Security (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Account Details & Role */}
          <div className="bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/60 pb-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  Account Status & Security
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Role: <span className="font-bold text-emerald-600 dark:text-emerald-400">Store Administrator</span>
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Supabase Secure Authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Encrypted JWT Sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Multi-device session revocation on update</span>
              </li>
            </ul>
          </div>

          {/* Active Session & Logout */}
          <div className="bg-white dark:bg-[#16162a] rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex-shrink-0">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  Session Control
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  End your current session on this browser
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 h-9 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{loggingOut ? 'Logging out...' : 'Sign Out of Console'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
