'use client';

/**
 * Customizer control primitives (Phase 1 foundation).
 * One design language: label left, control right, help tooltip, and — for
 * responsive fields — a device badge + override dot + "reset to inherited".
 */
import React, { useState } from 'react';
import { HelpCircle, Monitor, Tablet, Smartphone, RotateCcw } from '@/components/common/Icons';
import type { Device } from '@/lib/theme-schema';

export const DEVICE_ICON: Record<Device, React.ComponentType<{ className?: string }>> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help"
        aria-label="Help"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span className="absolute right-0 top-5 z-30 w-52 rounded-lg bg-gray-900 text-white text-[11px] leading-snug font-medium p-2 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

/** Small badge showing which device is being edited + whether it overrides the inherited value. */
export function DeviceBadge({
  device,
  overridden,
  onReset,
}: {
  device: Device;
  overridden: boolean;
  onReset?: () => void;
}) {
  const Icon = DEVICE_ICON[device];
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="w-3 h-3 text-gray-400" />
      {overridden && device !== 'desktop' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Overridden on this device" />
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-gray-400 hover:text-red-500 cursor-pointer"
              title="Reset to inherited"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </span>
  );
}

export interface ControlRowProps {
  label: string;
  help?: string;
  device?: Device;
  overridden?: boolean;
  onResetOverride?: () => void;
  /** stack control below the label instead of side-by-side */
  stacked?: boolean;
  children: React.ReactNode;
}

export function ControlRow({ label, help, device, overridden, onResetOverride, stacked, children }: ControlRowProps) {
  return (
    <div className={stacked ? 'space-y-1.5 py-2' : 'flex items-center justify-between gap-3 py-2'}>
      <div className="flex items-center gap-1.5 min-w-0">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{label}</label>
        {help && <HelpTip text={help} />}
        {device && <DeviceBadge device={device} overridden={!!overridden} onReset={onResetOverride} />}
      </div>
      <div className={stacked ? 'w-full' : 'shrink-0'}>{children}</div>
    </div>
  );
}
