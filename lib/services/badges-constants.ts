export const SYSTEM_FEATURED_BADGE_ID = '00000000-0000-4000-8000-000000000002';

export const SYSTEM_BADGE_CONFIGS = [
  { id: SYSTEM_FEATURED_BADGE_ID, name: 'Featured', bgColor: '#e94560', textColor: '#ffffff' },
  { id: '00000000-0000-4000-8000-000000000004', name: 'HOT', bgColor: '#ea580c', textColor: '#ffffff' },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Sale', bgColor: '#10b981', textColor: '#ffffff' },
  { id: '00000000-0000-4000-8000-000000000005', name: 'New', bgColor: '#d97706', textColor: '#ffffff' },
];

export const isSystemBadgeName = (name?: string): boolean => {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  return n === 'featured' || n === 'hot' || n === 'sale' || n === 'new';
};
