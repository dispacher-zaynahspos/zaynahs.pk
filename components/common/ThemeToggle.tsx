'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from '@/components/common/Icons';

interface ThemeToggleProps {
  className?: string;
  iconClassName?: string;
}

export default function ThemeToggle({ className, iconClassName }: ThemeToggleProps = {}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until client-side mount
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse ${className || 'h-10 w-10'}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer ${
        className || 'h-10 w-10'
      }`}
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <Sun className={`text-amber-500 transition-transform duration-300 hover:rotate-45 ${iconClassName || 'h-5 w-5'}`} />
      ) : (
        <Moon className={`text-indigo-600 transition-transform duration-300 hover:-rotate-12 ${iconClassName || 'h-5 w-5'}`} />
      )}
    </button>
  );
}
