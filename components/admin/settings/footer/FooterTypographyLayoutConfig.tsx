import React from 'react';

interface FooterTypographyLayoutConfigProps {
  footerHeadingFont: string;
  setFooterHeadingFont: (v: string) => void;
  footerBodyFont: string;
  setFooterBodyFont: (v: string) => void;
  footerHeadingSize: string;
  setFooterHeadingSize: (v: string) => void;
  footerBodySize: string;
  setFooterBodySize: (v: string) => void;
  footerHeadingWeight: string;
  setFooterHeadingWeight: (v: string) => void;
  footerBodyWeight: string;
  setFooterBodyWeight: (v: string) => void;
  footerAlign: 'left' | 'center';
  setFooterAlign: (v: 'left' | 'center') => void;
  footerPadding: string;
  setFooterPadding: (v: string) => void;
}

const inputCls =
  'mt-1.5 w-full min-w-0 box-border rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400';

export default function FooterTypographyLayoutConfig(props: FooterTypographyLayoutConfigProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Footer Typography &amp; Layout</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Same keys as the Theme Customizer. Leave blank for theme defaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Heading Font Family</label>
          <input type="text" value={props.footerHeadingFont} placeholder="inherit (theme heading font)" onChange={(e) => props.setFooterHeadingFont(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Body Font Family</label>
          <input type="text" value={props.footerBodyFont} placeholder="inherit (theme body font)" onChange={(e) => props.setFooterBodyFont(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Heading Size</label>
          <input type="text" value={props.footerHeadingSize} placeholder="e.g. 0.875rem" onChange={(e) => props.setFooterHeadingSize(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Body Size</label>
          <input type="text" value={props.footerBodySize} placeholder="e.g. 0.875rem" onChange={(e) => props.setFooterBodySize(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Heading Weight</label>
          <select value={props.footerHeadingWeight} onChange={(e) => props.setFooterHeadingWeight(e.target.value)} className={inputCls}>
            <option value="">Default</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semibold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extrabold (800)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Body Weight</label>
          <select value={props.footerBodyWeight} onChange={(e) => props.setFooterBodyWeight(e.target.value)} className={inputCls}>
            <option value="">Default</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semibold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Alignment</label>
          <select value={props.footerAlign} onChange={(e) => props.setFooterAlign(e.target.value as 'left' | 'center')} className={inputCls}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Vertical Padding</label>
          <input type="text" value={props.footerPadding} placeholder="e.g. 3rem" onChange={(e) => props.setFooterPadding(e.target.value)} className={inputCls} />
        </div>
      </div>
    </div>
  );
}
