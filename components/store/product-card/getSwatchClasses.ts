export const getSwatchClasses = (type: 'color' | 'text', sizeKey: string, text: string) => {
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

  const height = heightMap[sizeKey] || heightMap.md;
  const fontClass = fontMap[sizeKey] || fontMap.md;

  if (type === 'color') {
    const width = widthMap[sizeKey] || widthMap.md;
    return `${height} ${width}`;
  } else {
    const minWidthClass =
      sizeKey === 'xxs'
        ? 'min-w-[16px] px-0.5'
        : sizeKey === 'xs'
        ? 'min-w-[22px] px-1'
        : sizeKey === 'sm'
        ? 'min-w-[26px] px-1'
        : sizeKey === 'lg'
        ? 'min-w-[38px] px-2'
        : sizeKey === 'xl'
        ? 'min-w-[48px] px-2'
        : sizeKey === 'xxl'
        ? 'min-w-[56px] px-2.5'
        : 'min-w-[32px] px-1.5';

    let adjustedFont = fontClass;
    if (text.length > 3) {
      adjustedFont =
        sizeKey === 'xxs'
          ? 'text-[5px]'
          : sizeKey === 'xs'
          ? 'text-[6px]'
          : sizeKey === 'sm'
          ? 'text-[7px]'
          : sizeKey === 'lg'
          ? 'text-[9px]'
          : sizeKey === 'xl'
          ? 'text-[10px]'
          : sizeKey === 'xxl'
          ? 'text-[11px]'
          : 'text-[8px]';
    }
    return `${height} ${minWidthClass} ${adjustedFont}`;
  }
};
