export function getStartISO(d: Date | string): string {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

export function getEndISO(d: Date | string): string {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
}

export function timeAgo(dateStr: string | Date): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/**
 * ── Pakistan-time (PKT, UTC+5, no DST) day boundaries ─────────────────────────
 * The store operates in PKT. `created_at` is stored in UTC. Day filters MUST be
 * computed against PKT days regardless of where the code runs (browser local OR
 * Vercel UTC), otherwise early-PKT orders land on the wrong calendar day and the
 * header badge / stat cards / list disagree. These helpers are the SINGLE source
 * of truth for order day-boundary math.
 */
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5

/** "Now" shifted into PKT wall-clock space (as a Date whose UTC fields read PKT). */
function toPktClock(d: Date | string | number): Date {
  return new Date(new Date(d).getTime() + PKT_OFFSET_MS);
}

/** Start of the PKT day for the given instant, returned as a UTC ISO string. */
export function pktStartISO(d: Date | string | number = new Date()): string {
  const p = toPktClock(d);
  p.setUTCHours(0, 0, 0, 0);
  return new Date(p.getTime() - PKT_OFFSET_MS).toISOString();
}

/** End of the PKT day (inclusive, .999) for the given instant, as UTC ISO. */
export function pktEndISO(d: Date | string | number = new Date()): string {
  const p = toPktClock(d);
  p.setUTCHours(23, 59, 59, 999);
  return new Date(p.getTime() - PKT_OFFSET_MS).toISOString();
}

/** Start of PKT day from a plain YYYY-MM-DD value (date <input>), as UTC ISO. */
export function pktStartISOFromYMD(ymd: string): string {
  // Treat the YMD as a PKT calendar day: PKT midnight = UTC midnight - 5h.
  return new Date(`${ymd}T00:00:00.000+05:00`).toISOString();
}

/** End of PKT day (inclusive) from a plain YYYY-MM-DD value, as UTC ISO. */
export function pktEndISOFromYMD(ymd: string): string {
  return new Date(`${ymd}T23:59:59.999+05:00`).toISOString();
}

/** Epoch-ms helpers for client-side array filtering (same PKT boundaries). */
export function pktStartMs(d: Date | string | number = new Date()): number {
  return new Date(pktStartISO(d)).getTime();
}
export function pktEndMs(d: Date | string | number = new Date()): number {
  return new Date(pktEndISO(d)).getTime();
}
export function pktStartMsFromYMD(ymd: string): number {
  return new Date(pktStartISOFromYMD(ymd)).getTime();
}
export function pktEndMsFromYMD(ymd: string): number {
  return new Date(pktEndISOFromYMD(ymd)).getTime();
}
