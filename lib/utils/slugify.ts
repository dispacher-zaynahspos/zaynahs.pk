/**
 * Canonical URL slug generator (SSOT)
 * Safely converts any title/string into a clean, URL-safe slug.
 * Handles spaces, pipes, ampersands, unicode, and removes leading/trailing hyphens.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/&+/g, 'and')
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // trim leading and trailing hyphens
}
