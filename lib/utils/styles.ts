export function getSharedAspectClass(ratio?: string): string {
  if (!ratio) return 'aspect-[3/4]';
  
  const normalized = ratio.toLowerCase().trim().replace(/[\s_/]/g, ':').replace('by', ':');
  
  switch (normalized) {
    case '3:4': 
    case 'portrait':
    case 'recommended':
      return 'aspect-[3/4]';
    case '4:3': 
    case 'landscape':
      return 'aspect-[4/3]';
    case '16:9': 
    case 'wide':
    case 'widescreen':
    case 'video':
      return 'aspect-[16/9] aspect-video';
    case 'auto': 
    case 'natural':
      return 'aspect-auto min-h-[220px] sm:min-h-[280px]';
    case '1:1':
    case 'square':
      return 'aspect-square';
    default:
      return 'aspect-[3/4]';
  }
}

export function getSharedTitleClampClass(limit?: string | number): string {
  const normalized = String(limit || '2').toLowerCase().trim();
  switch (normalized) {
    case '1':
      // 1 line × (11px × 1.375 leading-snug) ≈ 15px mobile; (12px × 1.375) ≈ 16.5px desktop
      return 'title-clamp-1 line-clamp-1 min-h-[16px] sm:min-h-[18px]';
    case 'none':
    case 'unlimited':
    case '0':
      return 'title-clamp-none line-clamp-none';
    case '2':
    default:
      // 2 lines × (11px × 1.375 leading-snug) ≈ 30px mobile; (12px × 1.375) ≈ 33px desktop
      return 'title-clamp-2 line-clamp-2 min-h-[30px] sm:min-h-[33px]';
  }
}
