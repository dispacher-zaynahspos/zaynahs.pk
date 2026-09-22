'use client';

export function getSwatchClasses(type: 'color' | 'text', sizeKey: string, text: string) {
  const heightMap: Record<string, string> = {
    xxs: 'h-5',
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-14',
    xxl: 'h-16'
  };
  const widthMap: Record<string, string> = {
    xxs: 'w-5',
    xs: 'w-6',
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12',
    xl: 'w-14',
    xxl: 'w-16'
  };
  const fontMap: Record<string, string> = {
    xxs: 'text-[8px]',
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    xxl: 'text-xl'
  };

  const height = heightMap[sizeKey] || heightMap.md;
  const fontClass = fontMap[sizeKey] || fontMap.md;

  if (type === 'color') {
    const width = widthMap[sizeKey] || widthMap.md;
    return `${height} ${width}`;
  } else {
    const minWidthClass =
      sizeKey === 'xxs' ? 'min-w-[20px] px-1' :
      sizeKey === 'xs' ? 'min-w-[26px] px-1.5' :
      sizeKey === 'sm' ? 'min-w-[32px] px-1.5' :
      sizeKey === 'lg' ? 'min-w-[48px] px-2.5' :
      sizeKey === 'xl' ? 'min-w-[56px] px-3' :
      sizeKey === 'xxl' ? 'min-w-[64px] px-3.5' :
      'min-w-[40px] px-2';

    let adjustedFont = fontClass;
    if (text.length > 3) {
      adjustedFont =
        sizeKey === 'xxs' ? 'text-[6.5px]' :
        sizeKey === 'xs' ? 'text-[8px]' :
        sizeKey === 'sm' ? 'text-[9.5px]' :
        sizeKey === 'lg' ? 'text-xs' :
        sizeKey === 'xl' ? 'text-sm' :
        sizeKey === 'xxl' ? 'text-base' :
        'text-[11px]';
    }
    return `${height} ${minWidthClass} ${adjustedFont}`;
  }
}
