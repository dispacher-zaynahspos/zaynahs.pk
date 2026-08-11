export function getSharedAspectClass(ratio?: string): string {
  if (!ratio) return 'aspect-[3/4]';
  
  const normalized = ratio.toLowerCase().replace('by', ':');
  
  switch (normalized) {
    case '3:4': 
    case '3/4':
    case 'recommended':
    case 'portrait':
      return 'aspect-[3/4]';
    case '4:3': 
    case '4/3':
    case 'landscape':
      return 'aspect-[4/3]';
    case '16:9': 
    case '16/9':
      return 'aspect-[16/9]';
    case 'auto': 
      return 'aspect-auto min-h-[220px] sm:min-h-[280px]';
    case '1:1':
    case '1/1':
    case '1by1':
    case 'square':
      return 'aspect-square';
    default:
      return 'aspect-[3/4]';
  }
}

export function getSharedTitleClampClass(limit?: string): string {
  switch (limit) {
    case '1': return 'line-clamp-1 min-h-[14px] sm:min-h-[16px]';
    case 'none': return 'line-clamp-none';
    case '2':
    default:
      return 'line-clamp-2 min-h-[28px] sm:min-h-[32px]';
  }
}
