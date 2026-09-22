'use client';

import React from 'react';
import { toast } from 'sonner';
import * as CentralIcons from '@/components/common/Icons';

interface BadgeCardItemProps {
  cardNumber: number;
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  title: string;
  setTitle: (val: string) => void;
  desc: string;
  setDesc: (val: string) => void;
  icon: string;
  setIcon: (val: string) => void;
}

function BadgeCardItem({
  cardNumber,
  enabled,
  setEnabled,
  title,
  setTitle,
  desc,
  setDesc,
  icon,
  setIcon,
}: BadgeCardItemProps) {
  const IconComponent = (CentralIcons as any)[icon];

  return (
    <div
      className={`p-4 border rounded-xl space-y-3 transition-all ${
        enabled
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-white/5'
          : 'border-gray-200 dark:border-gray-800/40 bg-gray-50/5 dark:bg-white/1 opacity-50'
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">
          Badge Card {cardNumber}
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="mt-4 p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center shrink-0">
              {IconComponent ? <IconComponent className="h-5 w-5 text-[#e94560]" /> : null}
            </div>
            <div className="flex-grow">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Title</label>
              <input
                type="text"
                disabled={!enabled}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Icon</label>
          <select
            disabled={!enabled}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
          >
            {['Truck', 'Shield', 'RefreshCw', 'Phone', 'HelpCircle', 'Award', 'Star', 'Lock', 'Clock', 'Gift', 'Headphones'].map(ic => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
        <input
          type="text"
          disabled={!enabled}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] disabled:opacity-50"
        />
      </div>
    </div>
  );
}

interface HomepageTrustBadgesConfigProps {
  trustBadge1Title: string;
  setTrustBadge1Title: (val: string) => void;
  trustBadge1Desc: string;
  setTrustBadge1Desc: (val: string) => void;
  trustBadge1Icon: string;
  setTrustBadge1Icon: (val: string) => void;
  trustBadge1Enabled: boolean;
  setTrustBadge1Enabled: (val: boolean) => void;

  trustBadge2Title: string;
  setTrustBadge2Title: (val: string) => void;
  trustBadge2Desc: string;
  setTrustBadge2Desc: (val: string) => void;
  trustBadge2Icon: string;
  setTrustBadge2Icon: (val: string) => void;
  trustBadge2Enabled: boolean;
  setTrustBadge2Enabled: (val: boolean) => void;

  trustBadge3Title: string;
  setTrustBadge3Title: (val: string) => void;
  trustBadge3Desc: string;
  setTrustBadge3Desc: (val: string) => void;
  trustBadge3Icon: string;
  setTrustBadge3Icon: (val: string) => void;
  trustBadge3Enabled: boolean;
  setTrustBadge3Enabled: (val: boolean) => void;

  trustBadge4Title: string;
  setTrustBadge4Title: (val: string) => void;
  trustBadge4Desc: string;
  setTrustBadge4Desc: (val: string) => void;
  trustBadge4Icon: string;
  setTrustBadge4Icon: (val: string) => void;
  trustBadge4Enabled: boolean;
  setTrustBadge4Enabled: (val: boolean) => void;
}

export default function HomepageTrustBadgesConfig({
  trustBadge1Title,
  setTrustBadge1Title,
  trustBadge1Desc,
  setTrustBadge1Desc,
  trustBadge1Icon,
  setTrustBadge1Icon,
  trustBadge1Enabled,
  setTrustBadge1Enabled,
  trustBadge2Title,
  setTrustBadge2Title,
  trustBadge2Desc,
  setTrustBadge2Desc,
  trustBadge2Icon,
  setTrustBadge2Icon,
  trustBadge2Enabled,
  setTrustBadge2Enabled,
  trustBadge3Title,
  setTrustBadge3Title,
  trustBadge3Desc,
  setTrustBadge3Desc,
  trustBadge3Icon,
  setTrustBadge3Icon,
  trustBadge3Enabled,
  setTrustBadge3Enabled,
  trustBadge4Title,
  setTrustBadge4Title,
  trustBadge4Desc,
  setTrustBadge4Desc,
  trustBadge4Icon,
  setTrustBadge4Icon,
  trustBadge4Enabled,
  setTrustBadge4Enabled,
}: HomepageTrustBadgesConfigProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors mt-6 col-span-1 md:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Shopify-Style Homepage Trust Badges</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure the 4 feature/trust badge cards displayed above the footer on the storefront landing page.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTrustBadge1Enabled(true);
              setTrustBadge2Enabled(true);
              setTrustBadge3Enabled(true);
              setTrustBadge4Enabled(true);
              toast.success('All homepage trust badges enabled');
            }}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => {
              setTrustBadge1Enabled(false);
              setTrustBadge2Enabled(false);
              setTrustBadge3Enabled(false);
              setTrustBadge4Enabled(false);
              toast.success('All homepage trust badges disabled');
            }}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Disable All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <BadgeCardItem
          cardNumber={1}
          enabled={trustBadge1Enabled}
          setEnabled={setTrustBadge1Enabled}
          title={trustBadge1Title}
          setTitle={setTrustBadge1Title}
          desc={trustBadge1Desc}
          setDesc={setTrustBadge1Desc}
          icon={trustBadge1Icon}
          setIcon={setTrustBadge1Icon}
        />
        <BadgeCardItem
          cardNumber={2}
          enabled={trustBadge2Enabled}
          setEnabled={setTrustBadge2Enabled}
          title={trustBadge2Title}
          setTitle={setTrustBadge2Title}
          desc={trustBadge2Desc}
          setDesc={setTrustBadge2Desc}
          icon={trustBadge2Icon}
          setIcon={setTrustBadge2Icon}
        />
        <BadgeCardItem
          cardNumber={3}
          enabled={trustBadge3Enabled}
          setEnabled={setTrustBadge3Enabled}
          title={trustBadge3Title}
          setTitle={setTrustBadge3Title}
          desc={trustBadge3Desc}
          setDesc={setTrustBadge3Desc}
          icon={trustBadge3Icon}
          setIcon={setTrustBadge3Icon}
        />
        <BadgeCardItem
          cardNumber={4}
          enabled={trustBadge4Enabled}
          setEnabled={setTrustBadge4Enabled}
          title={trustBadge4Title}
          setTitle={setTrustBadge4Title}
          desc={trustBadge4Desc}
          setDesc={setTrustBadge4Desc}
          icon={trustBadge4Icon}
          setIcon={setTrustBadge4Icon}
        />
      </div>
    </div>
  );
}
