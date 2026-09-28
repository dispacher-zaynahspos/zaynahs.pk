/**
 * Review text sanitizer. Older/imported reviews sometimes have their star
 * rating baked into the comment as leading emoji (e.g. "⭐⭐⭐⭐⭐ Bohat..."),
 * which renders as raw emoji text next to the actual star widget. Strip any
 * leading run of rating emojis / stars (and following whitespace) for display.
 * Non-destructive: only affects rendering, never the stored value.
 */
const LEADING_RATING_EMOJI = /^[\s\u2B50\u2605\u2606\uD83C\uDF1F\u26A1\uFE0F\u2764\uD83D\uDC4D*]+/;

export function sanitizeReviewText(text?: string | null): string {
  if (!text) return '';
  return text.replace(LEADING_RATING_EMOJI, '').trim();
}
