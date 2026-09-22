import React from 'react';

interface FooterVisibilityConfigProps {
  footerShowMenu: boolean;
  setFooterShowMenu: (val: boolean) => void;
  footerShowNewsletter: boolean;
  setFooterShowNewsletter: (val: boolean) => void;
  footerShowSocial: boolean;
  setFooterShowSocial: (val: boolean) => void;
  footerShowPayments: boolean;
  setFooterShowPayments: (val: boolean) => void;
}

export default function FooterVisibilityConfig({
  footerShowMenu,
  setFooterShowMenu,
  footerShowNewsletter,
  setFooterShowNewsletter,
  footerShowSocial,
  setFooterShowSocial,
  footerShowPayments,
  setFooterShowPayments,
}: FooterVisibilityConfigProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">Footer Content Visibility</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">Enable or disable individual sections of the store footer globally.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Show Navigation Menu */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Quick Links Menu</span>
            <span className="text-[10px] text-gray-400">Show Quick Links navigation links</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={footerShowMenu}
              onChange={(e) => setFooterShowMenu(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {/* Show Newsletter */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Newsletter Signup</span>
            <span className="text-[10px] text-gray-400">Show email newsletter subscription form</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={footerShowNewsletter}
              onChange={(e) => setFooterShowNewsletter(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {/* Show Social Media */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Social Media Links</span>
            <span className="text-[10px] text-gray-400">Show social channel icons</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={footerShowSocial}
              onChange={(e) => setFooterShowSocial(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {/* Show Payments */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Payment Badges</span>
            <span className="text-[10px] text-gray-400">Show checkout credit card logos at the bottom</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={footerShowPayments}
              onChange={(e) => setFooterShowPayments(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>
      </div>
    </div>
  );
}
