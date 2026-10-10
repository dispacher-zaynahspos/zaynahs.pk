export interface ResponsiveSwatchSizes {
  mobile: string;
  tablet?: string | null;
  desktop?: string | null;
}

const heightMap: Record<string, string> = {
  xxs: 'h-4',
  xs: 'h-5',
  sm: 'h-6',
  md: 'h-7',
  lg: 'h-8',
  xl: 'h-9',
  xxl: 'h-10',
};

const widthMap: Record<string, string> = {
  xxs: 'w-4',
  xs: 'w-5',
  sm: 'w-6',
  md: 'w-7',
  lg: 'w-8',
  xl: 'w-9',
  xxl: 'w-10',
};

const fontMap: Record<string, string> = {
  xxs: 'text-[6px]',
  xs: 'text-[7.5px]',
  sm: 'text-[8.5px]',
  md: 'text-[9.5px]',
  lg: 'text-[11px]',
  xl: 'text-[12px]',
  xxl: 'text-[13px]',
};

function getMinWidthClass(sizeKey: string): string {
  switch (sizeKey) {
    case 'xxs': return 'min-w-[16px] px-0.5';
    case 'xs': return 'min-w-[22px] px-1';
    case 'sm': return 'min-w-[26px] px-1';
    case 'lg': return 'min-w-[38px] px-2';
    case 'xl': return 'min-w-[48px] px-2';
    case 'xxl': return 'min-w-[56px] px-2.5';
    default: return 'min-w-[32px] px-1.5';
  }
}

function getAdjustedFont(sizeKey: string, text: string): string {
  const base = fontMap[sizeKey] || fontMap.md;
  if (text.length <= 3) return base;
  switch (sizeKey) {
    case 'xxs': return 'text-[5px]';
    case 'xs': return 'text-[6px]';
    case 'sm': return 'text-[7px]';
    case 'lg': return 'text-[9px]';
    case 'xl': return 'text-[10px]';
    case 'xxl': return 'text-[11px]';
    default: return 'text-[8px]';
  }
}

function getSinglePartClasses(type: 'color' | 'text', sizeKey: string, text: string) {
  const h = heightMap[sizeKey] || heightMap.md;
  const w = widthMap[sizeKey] || widthMap.md;
  const font = getAdjustedFont(sizeKey, text);
  const minW = getMinWidthClass(sizeKey);
  return { h, w, font, minW };
}

export const getSwatchClasses = (
  type: 'color' | 'text',
  sizeKeyOrResponsive: string | ResponsiveSwatchSizes,
  text: string
): string => {
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

  return `${m.h} md:${t.h} lg:${d.h} ${m.minW} md:${t.minW} lg:${d.minW} ${m.font} md:${t.font} lg:${d.font}`;
};
