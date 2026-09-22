'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { addEmailSubscriberClient } from '@/lib/services/sections-client';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await addEmailSubscriberClient(email.trim());
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
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Your email address"
        disabled={loading}
        className="flex-grow rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-[#16162a]/50 px-3.5 py-2 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-[#e94560] px-4 py-2 text-xs font-bold text-white hover:bg-[#d8344f] transition-all cursor-pointer shrink-0 disabled:opacity-70"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
