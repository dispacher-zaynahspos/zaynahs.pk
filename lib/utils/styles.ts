export function getSharedAspectClass(ratio?: string): string {
  if (!ratio) return 'aspect-square';
  
  const normalized = ratio.toLowerCase().replace('by', ':');
  
  switch (normalized) {
    case '3:4': 
      return 'aspect-[3/4]';
    case '4:3': 
      return 'aspect-[4/3]';
    case '16:9': 
      return 'aspect-[16/9]';
    case 'auto': 
      // Use aspect-auto but allow it to have a flexible height
      return 'aspect-auto';
    case '1:1':
    case 'recommended':
    default:
      return 'aspect-square';
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
