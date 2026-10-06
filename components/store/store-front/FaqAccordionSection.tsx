'use client';

import React, { useState } from 'react';
import { HomepageSection } from '@/lib/types';
import { ChevronDown } from '@/components/common/Icons';
import { SectionWrapper } from './SectionWrapper';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionSectionProps {
  section: HomepageSection;
}

export function FaqAccordionSection({ section }: FaqAccordionSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const items: FaqItem[] = c.items || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <SectionWrapper section={section} maxWidthClass="max-w-3xl">
      {section.title && s.show_title !== false && (
        <h2 className="text-center text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-8 font-heading">
          {section.title}
        </h2>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#16162a] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[52px]"
              >
                <span className="text-sm font-bold text-gray-900 dark:text-white pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium pt-3 whitespace-pre-line">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export default FaqAccordionSection;
