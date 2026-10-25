/**
 * Shared utility for Google-review style vibrant avatar colors and 2-letter uppercase initials.
 * Single Source of Truth (SSOT) shared between /reviews and Homepage RecentReviewsSection.
 */

export const getReviewInitials = (name?: string): string => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getReviewAvatarColor = (name?: string): string => {
  const str = (name || 'Customer').trim();
  const colors = [
    'bg-[#10b981]', // Emerald green (like Fatima Zahra)
    'bg-[#FF8B3D]', // Warm orange (like Madiha Faisal)
    'bg-[#0284c7]', // Sky blue (like Sadia Tariq)
    'bg-[#8b5cf6]', // Purple (like Farhan Qureshi)
    'bg-[#06b6d4]', // Teal (like Sobia Rehan)
    'bg-[#e11d48]', // Rose red
    'bg-[#f59e0b]', // Amber
    'bg-[#4f46e5]', // Indigo
    'bg-[#db2777]', // Pink
  ];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return colors[Math.abs(sum) % colors.length];
};
