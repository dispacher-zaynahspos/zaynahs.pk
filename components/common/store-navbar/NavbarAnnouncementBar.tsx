'use client';

import React from 'react';

interface NavbarAnnouncementBarProps {
  showTopBar: boolean;
  showNewsletter: boolean;
  topBarPhone: string;
  topBarEmail: string;
  topBarBg: string;
  topBarTextColor: string;
  headerBorderColor: string;
  announcementLines: string[];
  isPreview: boolean;
  emblaRef: any;
  emblaApi: any;
}

export default function NavbarAnnouncementBar({
  showTopBar,
  showNewsletter,
  topBarPhone,
  topBarEmail,
  topBarBg,
  topBarTextColor,
  headerBorderColor,
  announcementLines,
  isPreview,
  emblaRef,
  emblaApi,
}: NavbarAnnouncementBarProps) {
  if (!showTopBar && !showNewsletter) return null;

  return (
    <div
      onClick={(e) => {
        if (isPreview) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'select_section', sectionId: 'announcement_bar' }, '*');
        }
      }}
      className={`w-full text-xs py-1 md:py-2 px-4 flex flex-col md:flex-row items-center justify-between gap-2 border-b transition-colors font-semibold ${isPreview ? 'cursor-pointer hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2' : ''}`}
      style={{
        backgroundColor: topBarBg,
        color: topBarTextColor,
        borderColor: headerBorderColor
      }}
    >
      {/* Top Bar Contacts */}
      {showTopBar ? (
        <div className="hidden md:flex flex-wrap items-center gap-4 text-[10px] sm:text-[11px] font-bold">
          {topBarPhone && (
            <a href={`tel:${topBarPhone.replace(/\D/g, '')}`} className="hover:opacity-85 transition-opacity flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.15 15.15 0 006.57 6.57l2.2-2.2a1 1 0 01.9-.27 11.36 11.36 0 00.57 3.58 1 1 0 01-.27.9l-2.2 2.2z" />
              </svg>
              <span>{topBarPhone}</span>
            </a>
          )}
          {topBarEmail && (
            <a href={`mailto:${topBarEmail}`} className="hover:opacity-85 transition-opacity flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>{topBarEmail}</span>
            </a>
          )}
        </div>
      ) : (
        <div className="hidden md:block shrink-0 w-32" />
      )}

      {/* Announcement Ticker */}
      {showNewsletter && announcementLines.length > 0 && (
        <div className="flex-1 max-w-xl flex items-center justify-center gap-1 sm:gap-2">
          {announcementLines.length > 1 && (
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="w-8 h-8 flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer shrink-0 z-10 -my-1"
              aria-label="Previous announcement"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="overflow-hidden flex-1 select-none" ref={emblaRef}>
            <div className="flex">
              {announcementLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] min-w-0 text-center font-black tracking-wider truncate px-1 text-[10px] sm:text-[11px] uppercase min-h-[16px] flex items-center justify-center"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {announcementLines.length > 1 && (
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="w-8 h-8 flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer shrink-0 z-10 -my-1"
              aria-label="Next announcement"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="hidden md:block shrink-0 w-32" />
    </div>
  );
}
