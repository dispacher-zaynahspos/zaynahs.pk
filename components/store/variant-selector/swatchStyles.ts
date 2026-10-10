'use client';

export interface ResponsiveSwatchSizes {
  mobile: string;
  tablet?: string | null;
  desktop?: string | null;
}

const heightMap: Record<string, string> = {
  xxs: 'h-5',
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
  xxl: 'h-16',
};

const widthMap: Record<string, string> = {
  xxs: 'w-5',
  xs: 'w-6',
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
  xl: 'w-14',
  xxl: 'w-16',
};

const fontMap: Record<string, string> = {
  xxs: 'text-[8px]',
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  xxl: 'text-xl',
};

function getMinWidthClass(sizeKey: string): string {
  switch (sizeKey) {
    case 'xxs': return 'min-w-[20px] px-1';
    case 'xs': return 'min-w-[26px] px-1.5';
    case 'sm': return 'min-w-[32px] px-1.5';
    case 'lg': return 'min-w-[48px] px-2.5';
    case 'xl': return 'min-w-[56px] px-3';
    case 'xxl': return 'min-w-[64px] px-3.5';
    default: return 'min-w-[40px] px-2';
  }
}

function getAdjustedFont(sizeKey: string, text: string): string {
  const base = fontMap[sizeKey] || fontMap.md;
  if (text.length <= 3) return base;
  switch (sizeKey) {
    case 'xxs': return 'text-[6.5px]';
    case 'xs': return 'text-[8px]';
    case 'sm': return 'text-[9.5px]';
    case 'lg': return 'text-xs';
    case 'xl': return 'text-sm';
    case 'xxl': return 'text-base';
    default: return 'text-[11px]';
  }
}

function getSinglePartClasses(type: 'color' | 'text', sizeKey: string, text: string) {
  const h = heightMap[sizeKey] || heightMap.md;
  const w = widthMap[sizeKey] || widthMap.md;
  const font = getAdjustedFont(sizeKey, text);
  const minW = getMinWidthClass(sizeKey);
  return { h, w, font, minW };
}

export function getSwatchClasses(
  type: 'color' | 'text',
  sizeKeyOrResponsive: string | ResponsiveSwatchSizes,
  text: string
): string {
  if (typeof sizeKeyOrResponsive === 'string') {
    const single = getSinglePartClasses(type, sizeKeyOrResponsive, text);
    return type === 'color' ? `${single.h} ${single.w}` : `${single.h} ${single.minW} ${single.font}`;
  }

  const mobKey = sizeKeyOrResponsive.mobile || 'md';
  const tabKey = sizeKeyOrResponsive.tablet || mobKey;
  const deskKey = sizeKeyOrResponsive.desktop || tabKey;

  const m = getSinglePartClasses(type, mobKey, text);
  const t = getSinglePartClasses(type, tabKey, text);
  const d = getSinglePartClasses(type, deskKey, text);

  if (mobKey === tabKey && tabKey === deskKey) {
    return type === 'color' ? `${m.h} ${m.w}` : `${m.h} ${m.minW} ${m.font}`;
  }

  if (type === 'color') {
    return `${m.h} ${m.w} md:${t.h} md:${t.w} lg:${d.h} lg:${d.w}`;
  }

  // Text variant responsive classes
  return `${m.h} md:${t.h} lg:${d.h} ${m.minW} md:${t.minW} lg:${d.minW} ${m.font} md:${t.font} lg:${d.font}`;
}
