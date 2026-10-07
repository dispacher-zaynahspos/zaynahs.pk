import React from 'react';

interface ColorRowProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (val: string) => void;
  fallback: string;
}

function ColorRow({ label, hint, value, onChange, fallback }: ColorRowProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>
      {hint && <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value || fallback}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          placeholder={fallback}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
        />
      </div>
    </div>
  );
}

interface FooterColorsConfigProps {
  footerBg: string;
  setFooterBg: (val: string) => void;
  footerTextColor: string;
  setFooterTextColor: (val: string) => void;
  footerHeadingColor: string;
  setFooterHeadingColor: (val: string) => void;
  footerLinkColor: string;
  setFooterLinkColor: (val: string) => void;
  footerBorderColor: string;
  setFooterBorderColor: (val: string) => void;
  footerCopyrightColor: string;
  setFooterCopyrightColor: (val: string) => void;
  footerSocialIconColor: string;
  setFooterSocialIconColor: (val: string) => void;
  footerSocialIconBg: string;
  setFooterSocialIconBg: (val: string) => void;
  footerSocialHoverColor: string;
  setFooterSocialHoverColor: (val: string) => void;
  footerSocialHoverBg: string;
  setFooterSocialHoverBg: (val: string) => void;
}

export default function FooterColorsConfig(props: FooterColorsConfigProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Footer Colors</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Same keys as the Theme Customizer (Global &rarr; Footer &amp; Social). Leave blank to use the theme default.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorRow label="Background" value={props.footerBg} onChange={props.setFooterBg} fallback="#ffffff" />
        <ColorRow label="Body Text" value={props.footerTextColor} onChange={props.setFooterTextColor} fallback="#5B6B85" />
        <ColorRow label="Headings" value={props.footerHeadingColor} onChange={props.setFooterHeadingColor} fallback="#111827" />
        <ColorRow label="Links" value={props.footerLinkColor} onChange={props.setFooterLinkColor} fallback="#5B6B85" />
        <ColorRow label="Divider / Border" value={props.footerBorderColor} onChange={props.setFooterBorderColor} fallback="#e5e7eb" />
        <ColorRow label="Copyright Text" value={props.footerCopyrightColor} onChange={props.setFooterCopyrightColor} fallback="#5B6B85" />
        <ColorRow label="Social Icon" hint="Icon color (default state)" value={props.footerSocialIconColor} onChange={props.setFooterSocialIconColor} fallback="#5B6B85" />
        <ColorRow label="Social Icon Background" hint="Chip background (default state)" value={props.footerSocialIconBg} onChange={props.setFooterSocialIconBg} fallback="#f1f1f1" />
        <ColorRow label="Social Hover Icon" hint="Icon color on hover/press" value={props.footerSocialHoverColor} onChange={props.setFooterSocialHoverColor} fallback="#ffffff" />
        <ColorRow label="Social Hover Background" hint="Chip background on hover/press" value={props.footerSocialHoverBg} onChange={props.setFooterSocialHoverBg} fallback="#e94560" />
      </div>
    </div>
  );
}
