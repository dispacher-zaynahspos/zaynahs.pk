'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { addEmailSubscriberAction } from '@/lib/services/sections/subscribe-actions';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await addEmailSubscriberAction(email.trim());
      toast.success('Thank you for subscribing! 🎉', { description: "You'll receive our latest offers." });
      setEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('23505')) {
        toast.info("You're already subscribed!");
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5 w-full max-w-full">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Your email address"
        disabled={loading}
        className="w-full min-w-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-[#16162a]/50 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] disabled:opacity-50 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#1a1a2e] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition-all cursor-pointer shrink-0 disabled:opacity-70 text-center"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
