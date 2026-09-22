import React from 'react';

interface PostExWhatsAppConfigProps {
  whatsappTemplate: string;
  setWhatsappTemplate: (val: string) => void;
  whatsappNote: string;
  setWhatsappNote: (val: string) => void;
}

export default function PostExWhatsAppConfig({
  whatsappTemplate,
  setWhatsappTemplate,
  whatsappNote,
  setWhatsappNote,
}: PostExWhatsAppConfigProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          WhatsApp Senders & Templates
        </h2>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">WhatsApp Message Template</label>
          <textarea
            value={whatsappTemplate}
            onChange={(e) => setWhatsappTemplate(e.target.value)}
            rows={3}
            placeholder="Template text..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Placeholder Format Guide:</span> Use
            <code className="mx-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-blue-600 dark:text-blue-400 font-semibold">{`{name}`}</code> for customer name,
            <code className="mx-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-blue-600 dark:text-blue-400 font-semibold">{`{url}`}</code> for PostEx tracking link, and
            <code className="mx-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-blue-600 dark:text-blue-400 font-semibold">{`{note}`}</code> for custom remarks note.
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Default Suffix Note</label>
          <input
            type="text"
            value={whatsappNote}
            onChange={(e) => setWhatsappNote(e.target.value)}
            placeholder="e.g. Thank you for shopping with us!"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
