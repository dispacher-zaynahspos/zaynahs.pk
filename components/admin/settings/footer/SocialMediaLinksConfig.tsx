import React from 'react';

interface SocialMediaLinksConfigProps {
  socialFacebook: string;
  setSocialFacebook: (val: string) => void;
  socialInstagram: string;
  setSocialInstagram: (val: string) => void;
  socialYoutube: string;
  setSocialYoutube: (val: string) => void;
  socialWhatsapp: string;
  setSocialWhatsapp: (val: string) => void;
  socialTiktok: string;
  setSocialTiktok: (val: string) => void;
  socialSnapchat: string;
  setSocialSnapchat: (val: string) => void;
  socialTwitter: string;
  setSocialTwitter: (val: string) => void;
}

export default function SocialMediaLinksConfig({
  socialFacebook,
  setSocialFacebook,
  socialInstagram,
  setSocialInstagram,
  socialYoutube,
  setSocialYoutube,
  socialWhatsapp,
  setSocialWhatsapp,
  socialTiktok,
  setSocialTiktok,
  socialSnapchat,
  setSocialSnapchat,
  socialTwitter,
  setSocialTwitter,
}: SocialMediaLinksConfigProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">Social Media Links</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">Add URLs to your active social channels. Supported icons will be displayed in Column 4 of the footer.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Facebook Page URL</label>
            <input
              type="url"
              placeholder="https://facebook.com/yourpage"
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Instagram Profile URL</label>
            <input
              type="url"
              placeholder="https://instagram.com/yourusername"
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">YouTube Channel URL</label>
            <input
              type="url"
              placeholder="https://youtube.com/@yourchannel"
              value={socialYoutube}
              onChange={(e) => setSocialYoutube(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Contact Number</label>
            <input
              type="text"
              placeholder="e.g. 923001234567"
              value={socialWhatsapp}
              onChange={(e) => setSocialWhatsapp(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">Format: 923001234567 (no spaces or +).</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">TikTok Profile URL</label>
            <input
              type="url"
              placeholder="https://tiktok.com/@yourusername"
              value={socialTiktok}
              onChange={(e) => setSocialTiktok(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Snapchat Profile URL</label>
            <input
              type="url"
              placeholder="https://snapchat.com/add/yourusername"
              value={socialSnapchat}
              onChange={(e) => setSocialSnapchat(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Twitter (X) Profile URL</label>
            <input
              type="url"
              placeholder="https://twitter.com/yourusername"
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
