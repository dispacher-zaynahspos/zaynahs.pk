import React from 'react';

interface FooterColumnsConfigProps {
  footerCol1Title: string;
  setFooterCol1Title: (val: string) => void;
  footerText: string;
  setFooterText: (val: string) => void;
  footerCol2Title: string;
  setFooterCol2Title: (val: string) => void;
  footerCol2Text: string;
  setFooterCol2Text: (val: string) => void;
  footerCol3Title: string;
  setFooterCol3Title: (val: string) => void;
  footerCol4Title: string;
  setFooterCol4Title: (val: string) => void;
  footerCol4Text: string;
  setFooterCol4Text: (val: string) => void;
  footerBottomText: string;
  setFooterBottomText: (val: string) => void;
  storeName: string;
}

export default function FooterColumnsConfig({
  footerCol1Title,
  setFooterCol1Title,
  footerText,
  setFooterText,
  footerCol2Title,
  setFooterCol2Title,
  footerCol2Text,
  setFooterCol2Text,
  footerCol3Title,
  setFooterCol3Title,
  footerCol4Title,
  setFooterCol4Title,
  footerCol4Text,
  setFooterCol4Text,
  footerBottomText,
  setFooterBottomText,
  storeName,
}: FooterColumnsConfigProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">Shopify-Style Footer Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1 & 2 Config */}
        <div className="space-y-4 border-r border-gray-100 dark:border-gray-800/80 pr-0 md:pr-6">
          <span className="text-xs font-bold text-[#e94560] block uppercase tracking-wider">Footer Columns 1 & 2</span>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 1 Title (Brand / About)</label>
            <input
              type="text"
              value={footerCol1Title}
              onChange={(e) => setFooterCol1Title(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 1 Description (Footer Text)</label>
            <textarea
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              rows={4}
              placeholder="Brief information about your brand, address, or customer support details."
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 2 Title (Customer Support)</label>
              <input
                type="text"
                value={footerCol2Title}
                onChange={(e) => setFooterCol2Title(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 2 Text (Support Details)</label>
              <textarea
                value={footerCol2Text}
                onChange={(e) => setFooterCol2Text(e.target.value)}
                rows={4}
                placeholder="Enter phone/email/timing lines. Support multiline."
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Column 3 & 4 Config */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-[#e94560] block uppercase tracking-wider">Footer Columns 3 & 4</span>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 3 Title (Quick Links)</label>
            <input
              type="text"
              value={footerCol3Title}
              onChange={(e) => setFooterCol3Title(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Column 3 renders your storefront navigation menu links automatically.</p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 4 Title (Newsletter)</label>
              <input
                type="text"
                value={footerCol4Title}
                onChange={(e) => setFooterCol4Title(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Column 4 Text (Newsletter Prompt)</label>
              <textarea
                value={footerCol4Text}
                onChange={(e) => setFooterCol4Text(e.target.value)}
                rows={4}
                placeholder="Enter newsletter subscription instructions."
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright text editor */}
        <div className="col-span-1 md:col-span-2 border-t border-gray-200 dark:border-gray-800 pt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Footer Copyright Text</label>
          <input
            type="text"
            value={footerBottomText}
            onChange={(e) => setFooterBottomText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            placeholder={`e.g. © ${new Date().getFullYear()} ${storeName || 'OurStore E-Store'}. All rights reserved.`}
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">This will edit the entire copyright text at the bottom of the page.</p>
        </div>

      </div>
    </div>
  );
}
